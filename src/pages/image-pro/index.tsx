import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  FaMagic, FaRocket, FaEdit, FaHistory, FaCog, FaImage, FaTrash,
  FaUserFriends, FaBullhorn, FaLayerGroup, FaUndo, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import ImageUploader from '../../components/ImageGen/ImageUploader';
import { useApiKey } from '../../hooks/useApiKey';
import { useAppContext } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { ReferenceLibraryModal } from '../../components/ImageGen/ReferenceLibraryModal';
import UsageCounter from '../../components/ImageGen/UsageCounter';
import { useImageUsage } from '../../hooks/useImageUsage';
import Head from 'next/head';

export default function ImageProPage() {
  const { googleAiKey, canAccessModule } = useAppContext();
  const { openApiKeyModal } = useApiKey();
  const { refreshCount } = useImageUsage();
  const router = useRouter();

  // Estados principales
  const [baseImageBase64, setBaseImageBase64] = useState<string | null>(null);
  const [styleImageBase64, setStyleImageBase64] = useState<string | null>(null);
  const [productData, setProductData] = useState({
    name: '',
    angle: '',
    buyer: '',
    details: ''
  });
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [correctionPrompt, setCorrectionPrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // NUEVOS ESTADOS PARA MODOS
  const [generationMode, setGenerationMode] = useState<'libre' | 'ads' | 'personas'>('libre');
  const [adsSubMode, setAdsSubMode] = useState<'sencillo' | 'completo'>('sencillo');
  const [personaOption, setPersonaOption] = useState<'generar' | 'fondo' | 'cara' | 'producto'>('generar');
  const [currentAdStep, setCurrentAdStep] = useState(0);
  const [generations, setGenerations] = useState<Record<string, string>>({});

  const ADS_STEPS = [
    {
      id: 'hook',
      title: 'Hook Visual',
      prompt: 'Cinematic product shot, high contrast, minimalist background. Focus on visual impact and curiosity.'
    },
    {
      id: 'proof',
      title: 'Prueba de Valor',
      prompt: 'Close-up macro of product texture or feature. Technical studio lighting. Highlight quality and reliability.'
    },
    {
      id: 'cta',
      title: 'Acción / Estilo de Vida',
      prompt: 'Lifestyle shot with product in a premium setting. Composition leaves space for marketing text on the sides. Professional commercial look.'
    }
  ];

  const PERSONA_PROMPTS = {
    generar: 'Hyper-realistic model interacting with the product. Natural pose, commercial lighting, high-end fashion aesthetic.',
    fondo: 'Maintain the product and primary subject exactly but place them in a premium setting with matching lighting and atmosphere.',
    cara: 'Close-up focus on human face interacting with product. Expressive, authentic emotion, high detail skin textures, professional portrait lighting.',
    producto: 'Integrate the product naturally into a pre-existing lifestyle scene with people. Perfect shadow and reflection matching.'
  };

  if (!canAccessModule('image-pro')) {
    if (typeof window !== 'undefined') router.push('/');
    return null;
  }

  const handleImageSelect = async (file: File | string | null) => {
    if (file instanceof File) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      setBaseImageBase64(base64);
    } else if (typeof file === 'string') {
      setBaseImageBase64(file);
    } else {
      setBaseImageBase64(null);
    }
  };

  const handleStyleImageSelect = async (file: File | string | null) => {
    if (file instanceof File) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      setStyleImageBase64(base64);
    } else if (typeof file === 'string') {
      setStyleImageBase64(file);
    } else {
      setStyleImageBase64(null);
    }
  };

  const handleGenerate = async (isCorrection: boolean = false) => {
    if (!googleAiKey) {
      openApiKeyModal('google');
      return;
    }

    if (!isCorrection && (!productData.name || !baseImageBase64)) {
      alert('Por favor, completa el nombre del producto y sube una imagen base.');
      return;
    }

    setIsGenerating(true);
    if (isCorrection) setIsCorrectionModalOpen(false);

    // DETERMINAR PROMPT SEGÚN MODO
    let finalPrompt = '';
    let previousUrl = isCorrection ? generatedImageUrl : baseImageBase64;

    if (isCorrection) {
      finalPrompt = correctionPrompt;
    } else if (generationMode === 'libre') {
      finalPrompt = productData.details || 'Professional product photography, studio lighting';
    } else if (generationMode === 'ads') {
      if (adsSubMode === 'sencillo') {
        finalPrompt = `Premium marketing advertisement for ${productData.name}. ${ADS_STEPS[0].prompt}`;
      } else {
        const step = ADS_STEPS[currentAdStep];
        finalPrompt = `${step.prompt} | Focus on ${productData.name}`;
        if (currentAdStep > 0 && generations[ADS_STEPS[currentAdStep - 1].id]) {
          previousUrl = generations[ADS_STEPS[currentAdStep - 1].id];
        }
      }
    } else if (generationMode === 'personas') {
      finalPrompt = `${PERSONA_PROMPTS[personaOption]} | Featuring ${productData.name}`;
    }

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const authToken = currentSession?.access_token;

      const response = await fetch('/api/image-pro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          productData,
          aspectRatio,
          referenceImage: styleImageBase64,
          referenceType: 'style',
          prompt: finalPrompt,
          isCorrection,
          previousImageUrl: previousUrl
        })
      });

      const data = await response.json();
      if (data.success) {
        if (generationMode === 'ads' && adsSubMode === 'completo' && !isCorrection) {
          setGenerations(prev => ({ ...prev, [ADS_STEPS[currentAdStep].id]: data.imageUrl }));
          setGeneratedImageUrl(data.imageUrl);
        } else {
          setGeneratedImageUrl(data.imageUrl);
        }
        // Refrescar contador de uso
        refreshCount();
      } else {
        alert(data.error || 'Error al generar la imagen');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const url = generatedImageUrl;
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    const extension = url.split(';')[0].split('/')[1] || 'png';
    link.download = `imagen-pro-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Agente Pro - Ecomlab</title>
      </Head>

      <div className="max-w-6xl mx-auto">
        {/* Header con Estética Premium */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary-color/20 rounded-lg">
                <FaMagic className="text-primary-color text-2xl" />
              </div>
              <h1 className="text-3xl font-bold text-theme-primary tracking-tight">Agente <span className="text-primary-color drop-shadow-[0_0_10px_rgba(18,216,250,0.5)]">Pro</span></h1>
            </div>
            <p className="text-theme-secondary opacity-80">Generación estratégica de imágenes con IA avanzada</p>
          </div>

          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-theme-component border border-white/10 hover:border-primary-color/50 transition-all text-theme-secondary btn-modern">
              <FaHistory /> Historial
            </button>
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-theme-component border border-white/10 hover:border-primary-color/50 transition-all text-theme-secondary btn-modern"
            >
              <FaCog /> Configuración
            </button>
          </div>
        </div>

        {/* SELECTOR DE MODO PRINCIPAL */}
        <div className="flex bg-theme-component border border-white/10 rounded-2xl p-1.5 mb-8 w-fit mx-auto shadow-xl">
          <button
            onClick={() => setGenerationMode('libre')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${generationMode === 'libre' ? 'bg-primary-color text-black shadow-lg shadow-primary-color/20' : 'text-theme-tertiary hover:text-white'}`}
          >
            <FaImage /> Imagen Libre
          </button>
          <button
            onClick={() => setGenerationMode('ads')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${generationMode === 'ads' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-theme-tertiary hover:text-white'}`}
          >
            <FaBullhorn /> Ads
          </button>
          <button
            onClick={() => setGenerationMode('personas')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${generationMode === 'personas' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-theme-tertiary hover:text-white'}`}
          >
            <FaUserFriends /> Personas
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Lado Izquierdo: Configuración y Carga */}
          <div className="lg:col-span-4 space-y-6">
            <UsageCounter />

            <div className="soft-card p-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-color/5 blur-3xl rounded-full -mr-16 -mt-16"></div>

              <h2 className="text-lg font-semibold text-theme-primary mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary-color rounded-full"></div>
                {generationMode === 'libre' ? 'Configuración Libre' : generationMode === 'ads' ? 'Configuración de Ads' : 'Configuración de Personas'}
              </h2>

              <div className="space-y-6">
                {/* OPCIONES SECUNDARIAS SEGÚN MODO */}
                {generationMode === 'ads' && (
                  <div className="p-1 bg-white/5 rounded-xl flex gap-1">
                    <button
                      onClick={() => setAdsSubMode('sencillo')}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${adsSubMode === 'sencillo' ? 'bg-white/10 text-white' : 'text-theme-tertiary'}`}
                    >
                      Sencillo (1)
                    </button>
                    <button
                      onClick={() => setAdsSubMode('completo')}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${adsSubMode === 'completo' ? 'bg-white/10 text-white' : 'text-theme-tertiary'}`}
                    >
                      Completo (3)
                    </button>
                  </div>
                )}

                {generationMode === 'personas' && (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(PERSONA_PROMPTS).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setPersonaOption(opt as any)}
                        className={`py-2 px-3 rounded-xl border text-[9px] font-bold uppercase transition-all ${personaOption === opt ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-white/5 bg-white/5 text-theme-tertiary'}`}
                      >
                        {opt === 'generar' ? 'Generar' : opt === 'fondo' ? 'Cambiar Fondo' : opt === 'cara' ? 'Cambiar Cara' : 'Agregar Prod.'}
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-theme-secondary uppercase tracking-widest flex justify-between">
                    <span>1. Foto Producto Real</span>
                    <span className="text-primary-color animate-pulse">Obligatorio</span>
                  </label>
                  <ImageUploader onImageSelect={handleImageSelect} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-black text-theme-secondary uppercase tracking-widest">
                      2. Referencia de Estilo
                    </label>
                    <button
                      onClick={() => setIsLibraryOpen(true)}
                      className="text-[10px] bg-primary-color/10 text-primary-color px-2 py-0.5 rounded border border-primary-color/20 hover:bg-primary-color/20 transition-all font-bold"
                    >
                      + Biblioteca
                    </button>
                  </div>
                  <div className="relative group">
                    <ImageUploader
                      onImageSelect={handleStyleImageSelect}
                      externalPreview={styleImageBase64}
                    />
                    {styleImageBase64 && (
                      <button
                        onClick={() => setStyleImageBase64(null)}
                        className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-theme-secondary">Nombre del Producto</label>
                  <input
                    type="text"
                    placeholder="Ej: Reloj Nebula..."
                    className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none"
                    value={productData.name}
                    onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                  />
                </div>

                <button
                  onClick={() => handleGenerate(false)}
                  disabled={isGenerating || !productData.name || !baseImageBase64}
                  className={`w-full py-4 mt-4 text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all btn-modern disabled:opacity-50 disabled:cursor-not-allowed ${generationMode === 'libre' ? 'bg-primary-color' : generationMode === 'ads' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}`}
                >
                  {isGenerating ? (
                    <div className="w-6 h-6 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                  ) : (
                    <>
                      <FaRocket /> {generationMode === 'ads' && adsSubMode === 'completo' ? `Generar Ad ${currentAdStep + 1}` : 'Generar Imagen Pro'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Resultado */}
          <div className="lg:col-span-8 space-y-6">
            {/* STEPPER PARA ADS COMPLETO */}
            {generationMode === 'ads' && adsSubMode === 'completo' && (
              <div className="flex items-center gap-4 bg-theme-component/50 p-4 rounded-2xl border border-white/5 shadow-inner">
                {ADS_STEPS.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentAdStep(idx)}
                    className={`flex-1 flex items-center gap-3 p-3 rounded-xl border transition-all ${currentAdStep === idx ? 'border-blue-500 bg-blue-500/10' : generations[step.id] ? 'border-green-500/30 bg-green-500/5 opacity-60' : 'border-white/5 opacity-30'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${currentAdStep === idx ? 'bg-blue-500 text-white' : generations[step.id] ? 'bg-green-500 text-white' : 'bg-gray-800'}`}>
                      {idx + 1}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-white">{step.title}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="soft-card overflow-hidden min-h-[600px] flex flex-col relative">
              <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
                <span className="text-sm font-medium text-theme-secondary flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${generatedImageUrl ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  {generationMode === 'ads' && adsSubMode === 'completo' ? `Resultado: Ad ${currentAdStep + 1}` : 'Vista Previa'}
                </span>

                {generatedImageUrl && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => setIsCorrectionModalOpen(true)}
                      className="text-theme-secondary text-xs font-bold hover:text-primary-color transition-colors flex items-center gap-2"
                    >
                      <FaEdit /> Pulir esta imagen
                    </button>
                    <button
                      onClick={handleDownload}
                      className="bg-primary-color text-black px-4 py-1.5 rounded-full text-[10px] font-black hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                    >
                      <FaRocket className="rotate-180" /> DESCARGAR
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center p-8 relative bg-[#07090E]">
                {(generationMode === 'ads' && adsSubMode === 'completo' ? generations[ADS_STEPS[currentAdStep].id] : generatedImageUrl) ? (
                  <div className="relative group max-w-full">
                    <img
                      src={(generationMode === 'ads' && adsSubMode === 'completo' ? generations[ADS_STEPS[currentAdStep].id] : generatedImageUrl) as string}
                      alt="Generada"
                      className="rounded-2xl shadow-2xl border border-white/5 max-h-[500px]"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl"></div>
                  </div>
                ) : (
                  <div className="text-center space-y-4 max-w-sm">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto opacity-50">
                      <FaImage className="text-4xl text-theme-tertiary" />
                    </div>
                    <p className="text-theme-tertiary">Selecciona el modo y haz clic en generar para ver la magia.</p>
                  </div>
                )}

                {isGenerating && (
                  <div className="absolute inset-0 bg-theme-primary/80 backdrop-blur-md flex flex-col items-center justify-center z-10 transition-all">
                    <div className="w-16 h-16 border-4 border-primary-color border-t-transparent animate-spin rounded-full mb-4 shadow-[0_0_30px_rgba(18,216,250,0.3)]"></div>
                    <p className="text-primary-color font-bold text-lg animate-pulse uppercase tracking-widest text-xs">Generando...</p>
                  </div>
                )}
              </div>

              {/* BARRA DE NAVEGACIÓN ADS COMPLETO */}
              {generationMode === 'ads' && adsSubMode === 'completo' && (
                <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentAdStep(prev => Math.max(0, prev - 1))}
                    disabled={currentAdStep === 0}
                    className="flex items-center gap-2 text-xs font-bold text-theme-secondary disabled:opacity-20"
                  >
                    <FaChevronLeft /> Anterior
                  </button>
                  <div className="flex gap-2">
                    {ADS_STEPS.map((_, i) => (
                      <div key={i} className={`h-1 rounded-full transition-all ${i === currentAdStep ? 'w-6 bg-blue-500' : 'w-2 bg-white/10'}`}></div>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentAdStep(prev => Math.min(ADS_STEPS.length - 1, prev + 1))}
                    disabled={currentAdStep === ADS_STEPS.length - 1 || !generations[ADS_STEPS[currentAdStep].id]}
                    className="flex items-center gap-2 text-xs font-bold text-theme-secondary disabled:opacity-20"
                  >
                    Siguiente Paso <FaChevronRight />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modales existentes con ajustes rápidos */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsConfigModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-theme-component border border-white/10 rounded-3xl shadow-2xl overflow-hidden glass-effect">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-bold text-theme-primary flex items-center gap-3">
                <FaCog className="text-primary-color" /> Configuración Pro
              </h3>
              <button onClick={() => setIsConfigModalOpen(false)} className="text-theme-tertiary hover:text-white transition-colors">✕</button>
            </div>

            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <label className="text-xs font-bold text-theme-tertiary uppercase tracking-[0.2em]">Formato de Salida</label>
                <div className="flex gap-4">
                  <button onClick={() => setAspectRatio('1:1')} className={`flex-1 p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all ${aspectRatio === '1:1' ? 'border-primary-color bg-primary-color/10 shadow-lg' : 'border-white/5'}`}>
                    <div className="w-8 h-8 border-2 border-current rounded-lg"></div>
                    <span className="text-xs font-bold">Cuadrado</span>
                  </button>
                  <button onClick={() => setAspectRatio('9:16')} className={`flex-1 p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all ${aspectRatio === '9:16' ? 'border-primary-color bg-primary-color/10 shadow-lg' : 'border-white/5'}`}>
                    <div className="w-6 h-10 border-2 border-current rounded-lg"></div>
                    <span className="text-xs font-bold">Vertical</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-theme-tertiary uppercase tracking-[0.2em]">Instrucciones Extra</label>
                <textarea
                  placeholder="Ej: Estilo minimalista, fondo blanco, iluminación de estudio..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-theme-primary focus:border-primary-color outline-none resize-none transition-all"
                  value={productData.details}
                  onChange={(e) => setProductData({ ...productData, details: e.target.value })}
                />
              </div>

              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="w-full py-4 bg-primary-color text-black font-bold rounded-2xl hover:shadow-lg transition-all"
              >
                Listo, guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {isCorrectionModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCorrectionModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-theme-component border border-gray-800 rounded-3xl shadow-2xl p-8">
            <h3 className="text-xl font-bold text-theme-primary mb-4 flex items-center gap-2">
              <FaEdit className="text-primary-color" /> ¿Qué deseas ajustar?
            </h3>
            <textarea
              placeholder="Ej: Haz el fondo un poco más oscuro y añade reflejos en el cristal..."
              rows={4}
              className="w-full bg-theme-primary border border-gray-700 rounded-2xl p-4 text-theme-primary focus:border-primary-color outline-none mb-6"
              value={correctionPrompt}
              onChange={(e) => setCorrectionPrompt(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => setIsCorrectionModalOpen(false)} className="flex-1 py-3 text-theme-secondary font-medium">Cancelar</button>
              <button onClick={() => handleGenerate(true)} className="flex-[2] py-3 bg-primary-color text-black font-bold rounded-xl shadow-lg">Aplicar Ajustes</button>
            </div>
          </div>
        </div>
      )}

      <ReferenceLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        category="ads-mockup"
        onSelect={(url) => setStyleImageBase64(url)}
      />
    </DashboardLayout>
  );
}
