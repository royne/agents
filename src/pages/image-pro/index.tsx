import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaMagic, FaRocket, FaEdit, FaHistory, FaCog, FaImage } from 'react-icons/fa';
import ImageUploader from '../../components/ImageGen/ImageUploader';
import { useApiKey } from '../../hooks/useApiKey';
import { useAppContext } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { ApiKeyModal } from '../../components/ApiKeyModal';
import Head from 'next/head';

export default function ImageProPage() {
  const { googleAiKey } = useAppContext();
  const { isApiKeyModalOpen, openApiKeyModal, closeApiKeyModal, saveGoogleAiKey } = useApiKey();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [productData, setProductData] = useState({
    name: '',
    angle: '',
    buyer: '',
    details: ''
  });
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [correctionPrompt, setCorrectionPrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const handleGenerate = async (isCorrection: boolean = false) => {
    if (!googleAiKey) {
      openApiKeyModal('google');
      return;
    }

    setIsGenerating(true);
    if (isCorrection) setIsCorrectionModalOpen(false);
    let referenceImageBase64 = null;
    if (selectedImage) {
      const reader = new FileReader();
      referenceImageBase64 = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(selectedImage);
      });
    }

    try {
      // Obtener sesión actual para enviar el token (por si las cookies fallan)
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
          referenceImage: isCorrection ? null : referenceImageBase64,
          prompt: isCorrection ? correctionPrompt : 'Profesional product photography, 4k, studio lighting',
          isCorrection,
          previousImageUrl: isCorrection ? generatedImageUrl : null
        })
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedImageUrl(data.imageUrl);
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
    if (!generatedImageUrl) return;

    const link = document.createElement('a');
    link.href = generatedImageUrl;
    // Extraer extensión del mime type o usar png por defecto
    const extension = generatedImageUrl.split(';')[0].split('/')[1] || 'png';
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
            <p className="text-theme-secondary opacity-80">Generación estratégica de imágenes para landing pages con Imagen 3 Pro</p>
          </div>

          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-theme-component border border-gray-700 hover:border-primary-color transition-all text-theme-secondary">
              <FaHistory /> Historial
            </button>
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-theme-component border border-gray-700 hover:border-primary-color transition-all text-theme-secondary"
            >
              <FaCog /> Configuración
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Lado Izquierdo: Configuración y Carga */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-theme-component p-6 rounded-2xl border border-gray-800 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-color/5 blur-3xl rounded-full -mr-16 -mt-16"></div>

              <h2 className="text-lg font-semibold text-theme-primary mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary-color rounded-full"></div>
                Configuración del Prompt
              </h2>

              <div className="space-y-4">
                <ImageUploader onImageSelect={setSelectedImage} />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-theme-secondary">Nombre del Producto</label>
                  <input
                    type="text"
                    placeholder="Ej: Reloj Inteligente X"
                    className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none"
                    value={productData.name}
                    onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-theme-secondary">Ángulo de Venta</label>
                  <input
                    type="text"
                    placeholder="Ej: Lujo accesible y tecnología"
                    className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none"
                    value={productData.angle}
                    onChange={(e) => setProductData({ ...productData, angle: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-theme-secondary">Buyer Persona</label>
                  <textarea
                    placeholder="Describe a quién va dirigido..."
                    rows={4}
                    className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none resize-none"
                    value={productData.buyer}
                    onChange={(e) => setProductData({ ...productData, buyer: e.target.value })}
                  />
                </div>

                <button
                  onClick={() => handleGenerate(false)}
                  disabled={isGenerating || !productData.name}
                  className="w-full py-4 mt-4 bg-primary-color text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(18,216,250,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <div className="w-6 h-6 border-2 border-black border-t-transparent animate-spin rounded-full"></div>
                  ) : (
                    <>
                      <FaRocket /> Generar Imagen Pro
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Contador de Uso */}
            <div className="bg-gradient-to-br from-theme-component to-theme-component border border-gray-800 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                  <FaImage className="text-primary-color" />
                </div>
                <div>
                  <p className="text-xs text-theme-tertiary uppercase font-bold tracking-wider">Generaciones hoy</p>
                  <p className="text-xl font-bold text-theme-primary">12 <span className="text-sm text-theme-tertiary font-normal">/ 50</span></p>
                </div>
              </div>
              <div className="w-12 h-12 relative flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="transparent" stroke="#1f2937" strokeWidth="4" />
                  <circle cx="24" cy="24" r="20" fill="transparent" stroke="#12D8FA" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset="30" />
                </svg>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Resultado */}
          <div className="lg:col-span-8">
            <div className="bg-theme-component rounded-2xl border border-gray-800 overflow-hidden shadow-2xl min-h-[600px] flex flex-col">
              <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
                <span className="text-sm font-medium text-theme-secondary flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Vista Previa del Resultado
                </span>
                {generatedImageUrl && (
                  <div className="flex gap-4">
                    <button
                      onClick={handleDownload}
                      className="text-primary-color text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      <FaRocket className="rotate-180" /> Descargar Imagen
                    </button>
                    <button
                      onClick={() => setIsCorrectionModalOpen(true)}
                      className="text-theme-secondary text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      <FaEdit /> Aplicar Corrección
                    </button>
                  </div>
                )}
              </div>

              <div
                className="flex-1 flex items-center justify-center p-8 relative"
                style={{
                  backgroundImage: 'radial-gradient(circle, #1f2937 1px, transparent 1px)',
                  backgroundSize: '30px 30px'
                }}
              >
                {generatedImageUrl ? (
                  <div className="relative group max-w-full">
                    <img
                      src={generatedImageUrl}
                      alt="Generada"
                      className="rounded-xl shadow-2xl border border-gray-700 max-h-[500px]"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl"></div>
                  </div>
                ) : (
                  <div className="text-center space-y-4 max-w-sm">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto opacity-50">
                      <FaImage className="text-4xl text-theme-tertiary" />
                    </div>
                    <p className="text-theme-tertiary">Configura el prompt y haz clic en generar para ver la magia.</p>
                  </div>
                )}

                {isGenerating && (
                  <div className="absolute inset-0 bg-theme-primary/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <div className="w-16 h-16 border-4 border-primary-color border-t-transparent animate-spin rounded-full mb-4 shadow-[0_0_30px_rgba(18,216,250,0.3)]"></div>
                    <p className="text-primary-color font-bold text-lg animate-pulse">Procesando con Imagen 3 Pro...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Configuración de Generación */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsConfigModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-theme-component border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-theme-primary flex items-center gap-2">
                <FaCog className="text-primary-color" /> Configuración Pro
              </h3>
              <button onClick={() => setIsConfigModalOpen(false)} className="text-theme-tertiary hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-theme-tertiary uppercase tracking-wider">Formato de Salida</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAspectRatio('1:1')}
                    className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${aspectRatio === '1:1' ? 'border-primary-color bg-primary-color/10' : 'border-gray-700 hover:border-gray-500'}`}
                  >
                    <div className="w-8 h-8 border-2 border-current rounded"></div>
                    <span className={aspectRatio === '1:1' ? 'text-primary-color' : 'text-theme-secondary'}>Cuadrado</span>
                  </button>
                  <button
                    onClick={() => setAspectRatio('9:16')}
                    className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${aspectRatio === '9:16' ? 'border-primary-color bg-primary-color/10' : 'border-gray-700 hover:border-gray-500'}`}
                  >
                    <div className="w-6 h-10 border-2 border-current rounded"></div>
                    <span className={aspectRatio === '9:16' ? 'text-primary-color' : 'text-theme-secondary'}>Historia</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-theme-tertiary uppercase tracking-wider">Estilo e Instrucciones</label>
                <textarea
                  placeholder="Ej: Estilo minimalista, fondo blanco, iluminación de estudio..."
                  rows={4}
                  className="w-full bg-theme-primary border border-gray-700 rounded-xl p-4 text-theme-primary focus:border-primary-color outline-none resize-none"
                  value={productData.details}
                  onChange={(e) => setProductData({ ...productData, details: e.target.value })}
                />
              </div>

              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="w-full py-4 bg-primary-color text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(18,216,250,0.3)] transition-all"
              >
                Listo, guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Corrección */}
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsCorrectionModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-theme-component border border-gray-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-4 flex items-center gap-2">
              <FaEdit className="text-primary-color" /> ¿Qué deseas ajustar?
            </h3>
            <p className="text-sm text-theme-secondary mb-4">Indica los cambios que quieres aplicar sobre la imagen actual.</p>
            <textarea
              placeholder="Ej: Haz el fondo un poco más oscuro y añade reflejos en el cristal..."
              rows={4}
              className="w-full bg-theme-primary border border-gray-700 rounded-xl p-4 text-theme-primary focus:border-primary-color outline-none mb-6"
              value={correctionPrompt}
              onChange={(e) => setCorrectionPrompt(e.target.value)}
            />
            <div className="flex gap-4">
              <button
                onClick={() => setIsCorrectionModalOpen(false)}
                className="flex-1 py-3 text-theme-secondary font-medium hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleGenerate(true)}
                className="flex-[2] py-3 bg-primary-color text-black font-bold rounded-xl shadow-[0_0_15px_rgba(18,216,250,0.3)]"
              >
                Aplicar Ajustes
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
