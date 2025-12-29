import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  FaFilm, FaMagic, FaRocket, FaHistory, FaCog, FaPlay, FaVolumeUp,
  FaUserAlt, FaMicrophone, FaLanguage, FaChevronRight, FaArrowLeft,
  FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';
import AppNotification from '../../components/common/Notification';
import ImageUploader from '../../components/ImageGen/ImageUploader';
import { useApiKey } from '../../hooks/useApiKey';
import { useAppContext } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import UsageCounter from '../../components/ImageGen/UsageCounter';
import { useImageUsage } from '../../hooks/useImageUsage';
import Head from 'next/head';

export default function VideoProPage() {
  const { googleAiKey, canAccessModule, isSuperAdmin } = useAppContext();
  const { openApiKeyModal } = useApiKey();
  const { credits, refreshCredits } = useImageUsage();
  const router = useRouter();

  // Estados principales
  const [firstFrameBase64, setFirstFrameBase64] = useState<string | null>(null);
  const [productData, setProductData] = useState({
    name: '',
    angle: '',
    buyer: '',
  });
  const [script, setScript] = useState('');
  const [specs, setSpecs] = useState({
    accent: 'Colombiano',
    tone: 'Entusiasta',
    gender: 'Femenino'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [lastFrameBase64, setLastFrameBase64] = useState<string | null>(null);
  const [generationMode, setGenerationMode] = useState<'normal' | 'extend' | 'interpolation' | 'ugc'>('normal');
  const [lastVideoUri, setLastVideoUri] = useState<string | null>(null);
  const [ugcStep, setUgcStep] = useState(0); // 0: no ugc, 1, 2, 3: steps
  const [pollingStatus, setPollingStatus] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  if (!canAccessModule('video-pro')) {
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
      setFirstFrameBase64(base64);
    } else {
      setFirstFrameBase64(file as string | null);
    }
  };

  const handleGenerate = async (overrideMode?: 'normal' | 'extend' | 'interpolation', overrideVideoUri?: string) => {
    const activeMode = overrideMode || (generationMode === 'ugc' ? (ugcStep === 0 ? 'normal' : 'extend') : generationMode);

    const requiredCredits = 80;
    if (credits < requiredCredits && !isSuperAdmin()) {
      alert(`Necesitas al menos ${requiredCredits} créditos. Tu saldo es de ${credits}.`);
      return;
    }

    if (!googleAiKey) {
      openApiKeyModal('google');
      return;
    }

    if (!firstFrameBase64 || !productData.name || !script) {
      alert('Por favor, completa los campos obligatorios: Imagen Inicial, Nombre y Guion.');
      return;
    }

    if (activeMode === 'interpolation' && (!lastFrameBase64 || lastFrameBase64 === '')) {
      setNotification({ message: 'El modo Interpolación requiere una Imagen Final.', type: 'error' });
      return;
    }

    setIsGenerating(true);
    if (generationMode === 'ugc' && ugcStep === 0) setUgcStep(1);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      if (!authToken) {
        setNotification({
          message: 'Sesión expirada o inválida. Por favor reingresa.',
          type: 'error'
        });
        setIsGenerating(false);
        return;
      }

      const response = await fetch('/api/video-pro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          mode: 'video',
          prompt: `Generate a UGC video for ${productData.name}. ${productData.angle ? `Angle: ${productData.angle}.` : ''}`,
          productData,
          script,
          specs,
          previousImageUrl: firstFrameBase64,
          lastFrameBase64: lastFrameBase64 || null,
          previousVideoUri: overrideVideoUri || lastVideoUri || null,
          generationMode: activeMode,
          aspectRatio: '9:16',
        }),
      });

      const data = await response.json();

      if (data.success && data.operationName) {
        setPollingStatus('Espere un momento y no cierre esta página para no perder el resultado');
        pollOperationStatus(data.operationName, authToken);
      } else {
        setNotification({
          message: data.error || 'Error al iniciar la generación',
          type: 'error'
        });
        setIsGenerating(false);
        setUgcStep(0);
      }
    } catch (error) {
      console.error(error);
      setNotification({ message: 'Error de conexión', type: 'error' });
      setIsGenerating(false);
      setUgcStep(0);
    }
  };

  const handleExtend = () => {
    if (!lastVideoUri) return;
    handleGenerate('extend');
  };

  const pollOperationStatus = async (operationName: string, authToken: string) => {
    setPollingStatus('Espere un momento y no cierre esta página para no perder el resultado');

    // Espera inicial de 30 segundos solicitada por el usuario
    setTimeout(() => {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/video-pro/status?operationName=${encodeURIComponent(operationName)}`, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          const data = await response.json();

          if (data.error) {
            clearInterval(interval);
            const fullError = data.details ? `${data.error}: ${data.details}` : data.error;
            setNotification({ message: fullError, type: 'error' });
            setIsGenerating(false);
            setPollingStatus(null);
            setUgcStep(0);
            return;
          }

          if (data.done) {
            clearInterval(interval);
            setGeneratedVideoUrl(data.videoUrl);
            setLastVideoUri(data.rawVideoUri);
            setPollingStatus(null);

            if (generationMode === 'ugc' && ugcStep < 3) {
              const nextStep = ugcStep + 1;
              setUgcStep(nextStep);
              setPollingStatus(`Preparando siguiente fragmento (Paso ${nextStep}/3)...`);
              // Pequeña pausa antes de la siguiente llamada para asegurar que el backend procesó el crédito
              setTimeout(() => handleGenerate('extend', data.rawVideoUri), 2000);
            } else {
              setIsGenerating(false);
              setUgcStep(0);
              setNotification({ message: 'Video generado con éxito', type: 'success' });
              refreshCredits();
            }
          } else {
            setPollingStatus('Generando video... por favor, no cierre esta página.');
          }
        } catch (error) {
          console.error('Error in polling:', error);
        }
      }, 10000); // Intervalo de 10 segundos solicitado por el usuario
    }, 30000);
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Video Pro - UGC AI Generator</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-primary-color/20 rounded-2xl shadow-[0_0_15px_rgba(18,216,250,0.2)]">
                <FaFilm className="text-primary-color text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-theme-primary tracking-tight">
                  Video <span className="text-primary-color drop-shadow-[0_0_10px_rgba(18,216,250,0.5)]">Pro</span>
                </h1>
                <p className="text-theme-secondary opacity-70 text-sm font-medium">Generación de videos UGC con Veo 3.1 Fast</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-theme-component border border-white/5 hover:border-primary-color/50 transition-all text-theme-secondary font-bold text-sm btn-modern">
              <FaHistory /> Historial
            </button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-theme-component border border-white/5 hover:border-primary-color/50 transition-all text-theme-secondary font-bold text-sm btn-modern">
              <FaCog /> Ajustes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Side */}
          <div className="lg:col-span-5 space-y-6">
            <UsageCounter />

            <div className="bg-theme-component/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-color/5 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-primary-color/10 transition-colors duration-700"></div>

              <h2 className="text-xl font-black text-theme-primary mb-8 flex items-center gap-3">
                <div className="w-2 h-8 bg-primary-color rounded-full shadow-[0_0_10px_rgba(18,216,250,0.5)]"></div>
                Configuración del Video
              </h2>

              <div className="space-y-6 relative z-10">
                {/* Product Meta */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-theme-tertiary uppercase tracking-[0.2em] ml-1">Contexto del Producto</label>
                    <input
                      type="text"
                      placeholder="Nombre del Producto (ej: Reloj Nebula)"
                      className="w-full bg-theme-component border border-white/5 rounded-2xl p-4 text-theme-primary focus:border-primary-color outline-none text-sm transition-all focus:shadow-[0_0_15px_rgba(18,216,250,0.1)]"
                      value={productData.name}
                      onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Ángulo de Venta (ej: Ideal para deportistas)"
                      className="w-full bg-theme-component border border-white/5 rounded-2xl p-4 text-theme-primary focus:border-primary-color outline-none text-sm transition-all focus:shadow-[0_0_15px_rgba(18,216,250,0.1)]"
                      value={productData.angle}
                      onChange={(e) => setProductData({ ...productData, angle: e.target.value })}
                    />
                  </div>
                </div>

                {/* Mode Selector */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-theme-tertiary uppercase tracking-[0.2em] ml-1">Modo de Generación</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setGenerationMode('normal')}
                      className={`p-3 rounded-xl border text-[10px] font-black transition-all ${generationMode === 'normal' ? 'bg-primary-color/20 border-primary-color text-primary-color' : 'bg-theme-component border-white/5 text-theme-tertiary hover:border-white/20'}`}
                    >
                      RÁPIDO (7s)
                    </button>
                    <button
                      onClick={() => setGenerationMode('interpolation')}
                      className={`p-3 rounded-xl border text-[10px] font-black transition-all ${generationMode === 'interpolation' ? 'bg-primary-color/20 border-primary-color text-primary-color' : 'bg-theme-component border-white/5 text-theme-tertiary hover:border-white/20'}`}
                    >
                      INTERPOLACIÓN
                    </button>
                    {/* 
                    <button
                      onClick={() => setGenerationMode('ugc')}
                      className={`p-3 rounded-xl border text-[10px] font-black transition-all col-span-2 ${generationMode === 'ugc' ? 'bg-primary-color/20 border-primary-color text-primary-color' : 'bg-theme-component border-white/5 text-theme-tertiary hover:border-white/20'}`}
                    >
                      UGC COMPLETO (21s - PRO)
                    </button>
                    */}
                  </div>
                </div>

                {/* Frames Uploaders */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-theme-tertiary uppercase tracking-[0.2em] ml-1 flex justify-between items-center">
                      <span>1. Imagen Inicial</span>
                      <span className="text-primary-color font-black animate-pulse">Requerido</span>
                    </label>
                    <ImageUploader onImageSelect={handleImageSelect} />
                  </div>

                  {generationMode === 'interpolation' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top duration-500">
                      <label className="text-[10px] font-black text-theme-tertiary uppercase tracking-[0.2em] ml-1 flex justify-between items-center">
                        <span>2. Imagen Final (Cierre)</span>
                        <span className="text-primary-color font-black">Requerido</span>
                      </label>
                      <ImageUploader onImageSelect={(fileOrBase64) => {
                        if (fileOrBase64 instanceof File) {
                          const reader = new FileReader();
                          reader.onload = () => setLastFrameBase64(reader.result as string);
                          reader.readAsDataURL(fileOrBase64);
                        } else {
                          setLastFrameBase64((fileOrBase64 as string | null) || null);
                        }
                      }} />
                    </div>
                  )}
                </div>

                {/* Script Area */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-theme-tertiary uppercase tracking-[0.2em] ml-1">2. Guion del Video (UGC)</label>
                  <textarea
                    placeholder="Describe lo que sucede en el video o escribe el guion literal..."
                    rows={4}
                    className="w-full bg-theme-component border border-white/5 rounded-2xl p-4 text-theme-primary focus:border-primary-color outline-none text-sm resize-none transition-all focus:shadow-[0_0_15px_rgba(18,216,250,0.1)] shadow-inner"
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                  />
                </div>

                {/* Detailed Specs */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-theme-tertiary uppercase tracking-widest flex items-center gap-1">
                        <FaMicrophone className="text-primary-color" /> Acento
                      </label>
                      <select
                        className="w-full bg-black/40 border border-white/5 rounded-xl p-2.5 text-[11px] text-theme-primary outline-none focus:border-primary-color"
                        value={specs.accent}
                        onChange={(e) => setSpecs({ ...specs, accent: e.target.value })}
                      >
                        <option>Neutro</option>
                        <option>Español (España)</option>
                        <option>Mexicano</option>
                        <option>Colombiano</option>
                        <option>Argentino</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-theme-tertiary uppercase tracking-widest flex items-center gap-1">
                        <FaVolumeUp className="text-primary-color" /> Tono
                      </label>
                      <select
                        className="w-full bg-black/40 border border-white/5 rounded-xl p-2.5 text-[11px] text-theme-primary outline-none focus:border-primary-color"
                        value={specs.tone}
                        onChange={(e) => setSpecs({ ...specs, tone: e.target.value })}
                      >
                        <option>Entusiasta</option>
                        <option>Profesional</option>
                        <option>Cercano</option>
                        <option>Urgencia</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-theme-tertiary uppercase tracking-widest flex items-center gap-1">
                        <FaUserAlt className="text-primary-color" /> Género
                      </label>
                      <select
                        className="w-full bg-black/40 border border-white/5 rounded-xl p-2.5 text-[11px] text-theme-primary outline-none focus:border-primary-color"
                        value={specs.gender}
                        onChange={(e) => setSpecs({ ...specs, gender: e.target.value })}
                      >
                        <option>Femenino</option>
                        <option>Masculino</option>
                        <option>No binario</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating || !firstFrameBase64 || !productData.name || !script}
                  className={`w-full py-5 mt-6 text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(18,216,250,0.2)] disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed uppercase tracking-widest text-xs btn-modern bg-primary-color`}
                >
                  {isGenerating ? (
                    <div className="w-6 h-6 border-4 border-black border-t-transparent animate-spin rounded-full"></div>
                  ) : (
                    <>
                      <FaRocket className="text-lg" />
                      {generationMode === 'ugc' ? 'Generar UGC Completo (240 Cred)' : 'Generar Video (80 Créditos)'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Result Side */}
          <div className="lg:col-span-7">
            <div className="bg-theme-component/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden h-full flex flex-col shadow-2xl group min-h-[600px]">
              <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${generatedVideoUrl ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]'}`}></div>
                  <span className="text-xs font-bold text-theme-secondary uppercase tracking-[0.2em]">Vista Previa del Resultado</span>
                </div>
                {generatedVideoUrl && (
                  <button className="px-4 py-2 bg-primary-color/10 text-primary-color border border-primary-color/20 rounded-xl text-[10px] font-black hover:bg-primary-color/20 transition-all uppercase tracking-widest">
                    Descargar Video
                  </button>
                )}
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-12 relative bg-[#05070A]">
                {generatedVideoUrl ? (
                  <div className="flex flex-col items-center gap-6 w-full">
                    <div className="w-full max-w-[320px] aspect-[9/16] bg-black rounded-3xl shadow-2xl overflow-hidden border border-white/10 relative group-result">
                      <video
                        src={generatedVideoUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-3xl"></div>
                    </div>

                    {/* Action buttons below video */}
                    <div className="w-full max-w-[320px] flex gap-2">
                      <button
                        onClick={handleExtend}
                        disabled={isGenerating}
                        className="flex-1 py-4 bg-primary-color text-black border border-primary-color/20 rounded-2xl text-[11px] font-black hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest shadow-xl"
                      >
                        {isGenerating ? 'Extendiendo...' : '+ Extender 7s (+80 Cred)'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-8 animate-in fade-in zoom-in duration-1000">
                    <div className="relative">
                      <div className="w-32 h-32 bg-primary-color/5 rounded-full flex items-center justify-center mx-auto border border-primary-color/10 group-hover:scale-110 transition-transform duration-700">
                        <FaPlay className="text-4xl text-primary-color/30 translate-x-1" />
                      </div>
                      <div className="absolute inset-0 border-2 border-primary-color/10 border-dashed rounded-full animate-[spin_10s_linear_infinite]"></div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-theme-primary">Tu video aparecerá aquí</h3>
                      <p className="text-theme-tertiary text-sm max-w-xs mx-auto opacity-70">
                        Configura los detalles en el panel izquierdo y haz clic en generar para comenzar el proceso.
                      </p>
                    </div>
                  </div>
                )}

                {isGenerating && (
                  <div className="absolute inset-0 bg-theme-primary/90 backdrop-blur-2xl flex flex-col items-center justify-center z-50 animate-in fade-in duration-300">
                    <div className="relative mb-8">
                      <div className="w-24 h-24 border-4 border-primary-color/20 rounded-full animate-ping"></div>
                      <div className="absolute inset-0 w-24 h-24 border-4 border-primary-color border-t-transparent animate-spin rounded-full"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FaFilm className="text-primary-color text-2xl animate-bounce" />
                      </div>
                    </div>
                    <div className="text-center space-y-3">
                      <p className="text-primary-color font-black text-xl uppercase tracking-[0.3em] animate-pulse">
                        {pollingStatus || 'Procesando Video'}
                      </p>
                      <div className="flex gap-1 justify-center">
                        <div className="w-2 h-2 bg-primary-color rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-primary-color rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-primary-color rounded-full animate-bounce"></div>
                      </div>
                      <p className="text-theme-tertiary text-[10px] font-bold uppercase tracking-widest mt-4 opacity-50">Esto puede tomar hasta 2 minutos</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tips Section */}
              <div className="p-6 bg-white/5 border-t border-white/5 flex items-center gap-6">
                <div className="flex-1 flex items-start gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg shrink-0">
                    <FaLanguage className="text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-theme-primary uppercase tracking-widest mb-1">Tip de Generación</h4>
                    <p className="text-[10px] text-theme-tertiary leading-relaxed">
                      Para mejores resultados, asegúrate de que la imagen inicial tenga buena iluminación y el producto esté bien centrado.
                    </p>
                  </div>
                </div>
                <div className="h-10 w-px bg-white/10"></div>
                <div className="flex-1 flex items-start gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                    <FaRocket className="text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-theme-primary uppercase tracking-widest mb-1">Veo 3.1 Fast</h4>
                    <p className="text-[10px] text-theme-tertiary leading-relaxed">
                      Modelo optimizado para velocidad y rendimiento en videos cortos de hasta 7 segundos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .btn-modern {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        .btn-modern:hover {
          box-shadow: 0 10px 15px -3px rgba(18, 216, 250, 0.2), 0 4px 6px -2px rgba(18, 216, 250, 0.1);
        }
      `}</style>
      {notification && (
        <AppNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          duration={8000}
        />
      )}
    </DashboardLayout>
  );
}
