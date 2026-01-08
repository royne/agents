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
import { HistoryModal } from '../../components/ImageGen/HistoryModal';

export default function ImageProPage() {
  const { authData, googleAiKey, canAccessModule, isSuperAdmin } = useAppContext();
  const { openApiKeyModal } = useApiKey();
  const { credits, loading: usageLoading, refreshCredits } = useImageUsage();
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
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // NUEVOS ESTADOS PARA MODOS
  const [generationMode, setGenerationMode] = useState<'libre' | 'ads' | 'personas'>('libre');
  const [adsSubMode, setAdsSubMode] = useState<'sencillo' | 'completo'>('sencillo');
  const [personaOption, setPersonaOption] = useState<'generar' | 'fondo' | 'cara' | 'producto'>('generar');
  const [faceSwapOption, setFaceSwapOption] = useState<'rostro' | 'completo'>('completo');
  const [currentAdStep, setCurrentAdStep] = useState(0);
  const [generations, setGenerations] = useState<Record<string, string>>({});
  const [isContextExpanded, setIsContextExpanded] = useState(false);

  // Efecto para ajustar ratio por defecto según modo
  useEffect(() => {
    if (generationMode === 'personas') setAspectRatio('9:16');
    else setAspectRatio('1:1');
  }, [generationMode]);

  const ADS_STEPS = [
    {
      id: 'hook',
      title: 'Hook Visual',
      prompt: 'MAIN HERO AD: Create a high-impact visual hook. Cinematic lighting. RENDER A BOLD MARKETING HEADLINE integrated into the design based on the Angle of Sale. Use professional typography. No placeholder text, use meaningful copy.'
    },
    {
      id: 'proof',
      title: 'Prueba de Valor',
      prompt: 'TECHNICAL PROOF AD: Macro studio shot of product quality. INCLUDE A SUB-HEADLINE OR STAMP that certifies quality or a key benefit. The text should be sharp and legible, reinforcing the buyer persona trust.'
    },
    {
      id: 'cta',
      title: 'Acción / Estilo de Vida',
      prompt: 'LIFESTYLE CALL TO ACTION: The product in use. RENDER A CLEAR "CALL TO ACTION" text (e.g. "Shop Now" or a benefit-driven phrase) using modern design aesthetics. The typography must feel part of a premium advertisement.'
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
    // 1. Validar Créditos (10 por imagen)
    // El bypass de admin se maneja en el backend, aquí solo prevenimos accidentes
    if (credits < 10 && !isSuperAdmin()) {
      alert(`Necesitas al menos 10 créditos para generar una imagen. Tu saldo actual es de ${credits}.`);
      return;
    }

    if (!googleAiKey) {
      openApiKeyModal('google');
      return;
    }

    if (!isCorrection && (!baseImageBase64 || (generationMode !== 'personas' && !productData.name))) {
      alert(baseImageBase64 ? 'Por favor, completa el nombre del producto.' : 'Por favor, sube una imagen base.');
      return;
    }

    setIsGenerating(true);
    if (isCorrection) setIsCorrectionModalOpen(false);

    // DETERMINAR PROMPT Y BASE SEGÚN MODO
    let finalPrompt = '';

    // Determinar la imagen base real que el usuario está viendo (especialmente en Ads Completo)
    const currentViewedImage = (generationMode === 'ads' && adsSubMode === 'completo')
      ? (generations[ADS_STEPS[currentAdStep].id] || baseImageBase64)
      : generatedImageUrl || baseImageBase64;

    let previousUrl = isCorrection ? currentViewedImage : baseImageBase64;
    if (isCorrection) {
      finalPrompt = correctionPrompt;
    } else if (generationMode === 'ads') {
      const angleInfo = productData.angle ? `| Angle: ${productData.angle}` : '';
      const buyerInfo = productData.buyer ? `| Audience: ${productData.buyer}` : '';

      if (adsSubMode === 'sencillo') {
        finalPrompt = `Premium marketing advertisement for ${productData.name} ${angleInfo} ${buyerInfo}. ${ADS_STEPS[0].prompt}`;
      } else {
        const step = ADS_STEPS[currentAdStep];
        finalPrompt = `${step.prompt} ${angleInfo} ${buyerInfo} | Focus on ${productData.name}`;
        if (currentAdStep > 0 && generations[ADS_STEPS[currentAdStep - 1].id]) {
          previousUrl = generations[ADS_STEPS[currentAdStep - 1].id];
        }
      }
    } else if (generationMode === 'personas') {
      const userInstructions = productData.details ? `| User Instructions: ${productData.details}` : '';
      const faceSwapMode = personaOption === 'cara' ? ` (${faceSwapOption.toUpperCase()})` : '';
      finalPrompt = `${PERSONA_PROMPTS[personaOption]}${faceSwapMode} ${userInstructions}`;
    } else {
      // Modo LIBRE: Concatenar todo si existe
      const parts = [];
      if (productData.name) parts.push(`Product: ${productData.name}`);
      if (productData.angle) parts.push(`Angle: ${productData.angle}`);
      if (productData.buyer) parts.push(`Audience: ${productData.buyer}`);
      if (productData.details) parts.push(`Details: ${productData.details}`);
      finalPrompt = parts.join(' | ') || 'Professional product photography';
    }

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const authToken = currentSession?.access_token;

      const response = await fetch('/api/image-pro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          mode: generationMode,
          subMode: generationMode === 'ads' ? adsSubMode : (generationMode === 'personas' ? (personaOption === 'cara' ? `cara_${faceSwapOption}` : personaOption) : undefined),
          prompt: finalPrompt,
          productData: productData,
          aspectRatio: aspectRatio,
          referenceImage: styleImageBase64,
          referenceType: generationMode === 'ads' ? 'layout' : 'style',
          isCorrection: isCorrection,
          previousImageUrl: previousUrl,
          debug: false
        }),
      });

      const data = await response.json();

      if (data.debug) {
        alert(`STRATEGIC PROMPT (BACKEND):\n\n${data.strategicPrompt}\n\n(Revisa consola para ver las PARTES enviadas)`);
        setIsGenerating(false);
        return;
      }

      if (data.success && data.imageUrl) {
        // Caso éxito inmediato
        if (generationMode === 'ads' && adsSubMode === 'completo') {
          setGenerations(prev => ({ ...prev, [ADS_STEPS[currentAdStep].id]: data.imageUrl }));
          setGeneratedImageUrl(data.imageUrl);
        } else {
          setGeneratedImageUrl(data.imageUrl);
        }
        setTimeout(() => refreshCredits(), 500);
      } else if (data.generationId) {
        // Iniciar POLLING
        const startPolling = async (genId: string) => {
          let attempts = 0;
          const maxAttempts = 60; // 2 minutos (2s * 60)

          const poll = async () => {
            if (attempts >= maxAttempts) {
              alert('La generación está tardando más de lo esperado. Podrás ver el resultado en tu historial en unos minutos.');
              setIsGenerating(false);
              return;
            }

            try {
              const res = await fetch(`/api/image-pro/status?id=${genId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
              });
              const statusData = await res.json();

              if (statusData.done) {
                if (statusData.success) {
                  const finalUrl = statusData.imageUrl;
                  if (generationMode === 'ads' && adsSubMode === 'completo') {
                    setGenerations(prev => ({ ...prev, [ADS_STEPS[currentAdStep].id]: finalUrl }));
                    setGeneratedImageUrl(finalUrl);
                  } else {
                    setGeneratedImageUrl(finalUrl);
                  }
                  refreshCredits();
                  setIsGenerating(false);
                } else {
                  alert(statusData.error || 'Error en la generación');
                  setIsGenerating(false);
                }
              } else {
                attempts++;
                setTimeout(poll, 15000);
              }
            } catch (err: any) {
              // Si es un 404 al inicio, reintentamos sin morir
              attempts++;
              setTimeout(poll, 15000);
            }
          };
          poll();
        };

        startPolling(data.generationId);
        return; // El finally no debe apagar el loader aún si hay polling
      } else {
        alert(data.error || 'Error al iniciar la generación');
        setIsGenerating(false);
      }
    } catch (error: any) {
      console.error(error);
      // Si el fetch falla por timeout o red, el servidor podría seguir trabajando
      alert('Se ha perdido la conexión temporalmente, pero el servidor sigue procesando tu imagen. Por favor, espera un momento o revisa tu historial en breve.');
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const url = generatedImageUrl;
    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;

      const extension = url.includes('base64')
        ? (url.split(';')[0].split('/')[1] || 'png')
        : (url.split('.').pop()?.split('?')[0] || 'png');

      link.download = `imagen-ecomlab-${Date.now()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download error:', err);
      // Fallback
      window.open(url, '_blank');
    }
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
            <p className="text-primary-color text-[10px] font-black uppercase tracking-widest mt-1 opacity-90">Gasto: 10 créditos por imagen</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-theme-component border border-white/10 hover:border-primary-color/50 transition-all text-theme-secondary btn-modern"
            >
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
                  <div className="p-1 bg-white/5 rounded-xl flex gap-1 shadow-inner">
                    <button
                      onClick={() => setAdsSubMode('sencillo')}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${adsSubMode === 'sencillo' ? 'bg-white/10 text-white' : 'text-theme-tertiary'}`}
                    >
                      Sencillo (1)
                    </button>
                    <button
                      onClick={() => setAdsSubMode('completo')}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${adsSubMode === 'completo' ? 'bg-white/10 text-white' : 'text-theme-tertiary'}`}
                    >
                      Completo (3)
                    </button>
                  </div>
                )}

                {generationMode === 'personas' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {Object.keys(PERSONA_PROMPTS).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setPersonaOption(opt as any)}
                          className={`py-2 px-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${personaOption === opt ? 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-white/5 bg-white/5 text-theme-tertiary hover:border-white/10'}`}
                        >
                          {opt === 'generar' ? 'Generar' : opt === 'fondo' ? 'Cambiar Fondo' : opt === 'cara' ? 'Cambiar Cara' : 'Agregar Prod.'}
                        </button>
                      ))}
                    </div>

                    {personaOption === 'cara' && (
                      <div className="flex gap-2 p-1 bg-black/20 rounded-xl border border-white/5 animate-in fade-in slide-in-from-top-1">
                        <button
                          onClick={() => setFaceSwapOption('rostro')}
                          className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${faceSwapOption === 'rostro' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-theme-tertiary hover:text-white'}`}
                        >
                          Solo Rostro
                        </button>
                        <button
                          onClick={() => setFaceSwapOption('completo')}
                          className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${faceSwapOption === 'completo' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-theme-tertiary hover:text-white'}`}
                        >
                          Rostro y Cabello
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-theme-secondary uppercase tracking-widest">Formato de Salida</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAspectRatio('1:1')}
                        className={`flex-1 py-1.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${aspectRatio === '1:1' ? 'border-primary-color bg-primary-color/10 text-primary-color shadow-lg' : 'border-white/5 bg-white/5 text-theme-tertiary'}`}
                      >
                        <div className="w-2.5 h-2.5 border border-current rounded-sm"></div>
                        <span className="text-[10px] font-bold">1:1</span>
                      </button>
                      <button
                        onClick={() => setAspectRatio('9:16')}
                        className={`flex-1 py-1.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${aspectRatio === '9:16' ? 'border-primary-color bg-primary-color/10 text-primary-color shadow-lg' : 'border-white/5 bg-white/5 text-theme-tertiary'}`}
                      >
                        <div className="w-2 h-3.5 border border-current rounded-sm"></div>
                        <span className="text-[10px] font-bold">9:16</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-theme-secondary uppercase tracking-widest flex justify-between">
                      <span>1. {generationMode === 'personas' ? 'Persona / Modelo Principal' : 'Foto Producto Real'}</span>
                      <span className="text-primary-color animate-pulse font-bold">Obligatorio</span>
                    </label>
                    <ImageUploader onImageSelect={handleImageSelect} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-black text-theme-secondary uppercase tracking-widest">
                        2. {generationMode === 'personas' ? 'Referencia de Rostro / Pose' : 'Referencia de Estilo'}
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


                  {generationMode === 'personas' ? (
                    <div className="space-y-4 pt-2">
                      <button
                        onClick={() => setIsContextExpanded(!isContextExpanded)}
                        className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between text-[10px] font-black uppercase tracking-widest transition-all ${isContextExpanded || productData.name || productData.angle || productData.buyer ? 'border-primary-color/30 bg-primary-color/5 text-primary-color' : 'border-white/5 bg-white/5 text-theme-tertiary'}`}
                      >
                        <span>{isContextExpanded ? 'Ocultar Contexto' : 'Ajustar Contexto (Nombre/Target)'}</span>
                        <div className={`w-2 h-2 rounded-full ${productData.name || productData.angle || productData.buyer ? 'bg-primary-color animate-pulse' : 'bg-gray-600'}`}></div>
                      </button>

                      {isContextExpanded && (
                        <div className="space-y-4 p-4 bg-black/20 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-top-2">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-theme-tertiary uppercase tracking-widest">Nombre del Producto</label>
                            <input
                              type="text"
                              placeholder="Ej: Reloj Nebula..."
                              className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none text-xs transition-all"
                              value={productData.name}
                              onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-theme-tertiary uppercase tracking-widest">Ángulo de Venta</label>
                            <input
                              type="text"
                              placeholder="Ej: El regalo perfecto..."
                              className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none text-xs transition-all"
                              value={productData.angle}
                              onChange={(e) => setProductData({ ...productData, angle: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-theme-tertiary uppercase tracking-widest">Buyer Persona</label>
                            <input
                              type="text"
                              placeholder="Ej: Emprendedores..."
                              className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none text-xs transition-all"
                              value={productData.buyer}
                              onChange={(e) => setProductData({ ...productData, buyer: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-theme-secondary uppercase tracking-widest">Nombre del Producto</label>
                        <input
                          type="text"
                          placeholder="Ej: Reloj Nebula..."
                          className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none text-xs transition-all"
                          value={productData.name}
                          onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-theme-secondary uppercase tracking-widest">Ángulo de Venta</label>
                        <input
                          type="text"
                          placeholder="Ej: El regalo perfecto para Navidad..."
                          className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none text-xs transition-all"
                          value={productData.angle}
                          onChange={(e) => setProductData({ ...productData, angle: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-theme-secondary uppercase tracking-widest">Buyer Persona</label>
                        <input
                          type="text"
                          placeholder="Ej: Emprendedores de 25-40 años..."
                          className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none text-xs transition-all"
                          value={productData.buyer}
                          onChange={(e) => setProductData({ ...productData, buyer: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-theme-secondary uppercase tracking-widest">
                      {generationMode === 'personas' ? 'Instrucciones del Cambio' : 'Instrucciones / Detalles'}
                    </label>
                    <textarea
                      placeholder={generationMode === 'personas' ? "Ej: Cambia el rostro de la modelo 1 por el de la modelo 2 manteniendo la luz..." : "Ej: Estilo minimalista, fondo oscuro..."}
                      rows={3}
                      className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none text-xs resize-none transition-all"
                      value={productData.details}
                      onChange={(e) => setProductData({ ...productData, details: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleGenerate(false)}
                  disabled={isGenerating || (generationMode !== 'personas' && !productData.name) || !baseImageBase64}
                  className={`w-full py-4 mt-4 text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all btn-modern disabled:opacity-30 disabled:cursor-not-allowed ${generationMode === 'libre' ? 'bg-primary-color' : generationMode === 'ads' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'}`}
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
        category="ads"
        onSelect={(url) => setStyleImageBase64(url)}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        userId={authData?.userId || ''}
      />
    </DashboardLayout>
  );
}
