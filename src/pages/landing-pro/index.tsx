import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  FaMagic, FaRocket, FaEdit, FaImage, FaChevronRight, FaChevronLeft,
  FaCheckCircle, FaDollarSign, FaExchangeAlt, FaStar, FaListUl,
  FaCertificate, FaUsers, FaBook, FaTruck, FaSave, FaTrash
} from 'react-icons/fa';
import ImageUploader from '../../components/ImageGen/ImageUploader';
import { useAppContext } from '../../contexts/AppContext';
import { useApiKey } from '../../hooks/useApiKey';
import { supabase } from '../../lib/supabase';
import Head from 'next/head';

// Definición de las secciones de la Landing
const LANDING_SECTIONS = [
  {
    id: 'hero',
    title: 'Hero / Gancho',
    description: 'Captura la atención con un mensaje poderoso que conecta con el dolor del cliente.',
    icon: FaMagic,
    prompt: 'Premium Hero section for a landing page. High impact visual, dramatic lighting, cinematic composition. The product is the main focus. Emotional connection with the customer pain point.'
  },
  {
    id: 'oferta',
    title: 'Oferta Irresistible',
    description: 'Presenta tu producto con un precio y valor que el cliente no puede rechazar.',
    icon: FaDollarSign,
    prompt: 'Irresistible offer section. Highlighting value and price. Clean, professional, elements of urgency and exclusivity. Studio lighting.'
  },
  {
    id: 'transformacion',
    title: 'Antes y Después',
    description: 'Muestra la transformación que tu producto genera en la vida del cliente.',
    icon: FaExchangeAlt,
    prompt: 'Before and after comparison visual. Showing the transformation and positive result after using the product. Split screen or clear transition effect.'
  },
  {
    id: 'beneficios',
    title: 'Beneficios',
    description: 'Lista los beneficios clave que resuelven los problemas de tu audiencia.',
    icon: FaStar,
    prompt: 'Key benefits visualization. Abstract or literal representations of the 3 main advantages of the product. Modern, clean, professional photography.'
  },
  {
    id: 'comparativa',
    title: 'Tabla Comparativa',
    description: 'Compara tu producto vs alternativas para mostrar superioridad.',
    icon: FaListUl,
    prompt: 'Comparative visual showing product superiority over alternatives. Side by side elements, focus on quality and advanced features.'
  },
  {
    id: 'autoridad',
    title: 'Prueba de Autoridad',
    description: 'Certificaciones, estudios y credenciales que validan tu producto.',
    icon: FaCertificate,
    prompt: 'Authority and trust section. Clean background, professional setting, symbolic elements of quality, certifications or laboratory testing environment.'
  },
  {
    id: 'testimonios',
    title: 'Testimonios',
    description: 'Historias reales de clientes satisfechos que generan confianza.',
    icon: FaUsers,
    prompt: 'Social proof visualization. Happy person using the product in a real-life scenario. Genuine emotion, natural lighting, high-end lifestyle photography.'
  },
  {
    id: 'instrucciones',
    title: 'Cómo Usar',
    description: 'Instrucciones claras que eliminan objeciones sobre complejidad.',
    icon: FaBook,
    prompt: 'How to use demonstration. Macro shot of product in use. Hands holding it, clear action, step by step educational vibe but premium aesthetic.'
  },
  {
    id: 'logistica',
    title: 'Logística',
    description: 'Envío, garantía y proceso de compra sin fricciones.',
    icon: FaTruck,
    prompt: 'Logistics and delivery visual. Fast shipping, security, and guarantee symbols. Professional packaging, unboxing experience vibe, trustworthy.'
  }
];

export default function LandingProPage() {
  const { googleAiKey } = useAppContext();
  const { openApiKeyModal } = useApiKey();

  // Estados principales
  const [currentStep, setCurrentStep] = useState(0);
  const [productData, setProductData] = useState({
    name: '',
    angle: '',
    buyer: '',
    details: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [baseImageBase64, setBaseImageBase64] = useState<string | null>(null);
  const [generations, setGenerations] = useState<Record<number, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Cargar desde LocalStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('ecomlab_landing_pro');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.productData) setProductData(parsed.productData);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        if (parsed.generations) setGenerations(parsed.generations);
        if (parsed.baseImageBase64) setBaseImageBase64(parsed.baseImageBase64);
      } catch (e) {
        console.error('Error al cargar datos guardados', e);
      }
    }
  }, []);

  // Guardar en LocalStorage cada vez que algo cambie
  useEffect(() => {
    const dataToSave = {
      productData,
      currentStep,
      generations,
      baseImageBase64
    };
    localStorage.setItem('ecomlab_landing_pro', JSON.stringify(dataToSave));
  }, [productData, currentStep, generations, baseImageBase64]);

  // Manejar carga de imagen base
  const handleImageSelect = async (file: File | null) => {
    setSelectedImage(file);
    if (file) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      setBaseImageBase64(base64);
    } else {
      setBaseImageBase64(null);
    }
  };

  const handleGenerateStep = async () => {
    if (!googleAiKey) {
      openApiKeyModal('google');
      return;
    }

    if (!productData.name || !baseImageBase64) {
      alert('Por favor, completa el nombre del producto y sube una imagen base.');
      return;
    }

    setIsGenerating(true);
    const section = LANDING_SECTIONS[currentStep];

    // Referencia visual: Imagen anterior si existe, si no la imagen base
    const previousImage = currentStep > 0 ? generations[currentStep - 1] : baseImageBase64;

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
          aspectRatio: '9:16', // Forzamos formato landing (vertical)
          referenceImage: previousImage,
          prompt: section.prompt,
          isCorrection: false,
          previousImageUrl: null
        })
      });

      const data = await response.json();
      if (data.success) {
        setGenerations(prev => ({ ...prev, [currentStep]: data.imageUrl }));
      } else {
        alert(data.error || 'Error al generar la sección');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetProject = () => {
    if (confirm('¿Estás seguro de que deseas reiniciar todo el proyecto de la landing? Se perderán las imágenes generadas.')) {
      setGenerations({});
      setCurrentStep(0);
      setProductData({ name: '', angle: '', buyer: '', details: '' });
      setBaseImageBase64(null);
      localStorage.removeItem('ecomlab_landing_pro');
      window.location.reload();
    }
  };

  const currentSection = LANDING_SECTIONS[currentStep];

  return (
    <DashboardLayout>
      <Head>
        <title>Landing PRO - Ecomlab</title>
      </Head>

      <div className="max-w-6xl mx-auto pb-20">
        {/* Header con Progreso */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary-color/20 rounded-lg">
                <FaImage className="text-primary-color text-2xl" />
              </div>
              <h1 className="text-3xl font-bold text-theme-primary tracking-tight">Landing <span className="text-primary-color drop-shadow-[0_0_10px_rgba(18,216,250,0.5)]">PRO</span></h1>
            </div>
            <p className="text-theme-secondary opacity-80 uppercase text-xs font-bold tracking-widest leading-none">Generador de Marketing Secuencial</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={resetProject}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:text-rose-400 transition-all text-theme-tertiary text-sm flex items-center gap-2"
            >
              <FaTrash /> Reiniciar
            </button>
            <div className="px-5 py-2.5 rounded-xl bg-theme-component border border-white/10 text-theme-secondary font-bold flex items-center gap-2">
              <span className="text-primary-color">{currentStep + 1}</span> / {LANDING_SECTIONS.length} Pasos
            </div>
          </div>
        </div>

        {/* Stepper Visual */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-4 no-scrollbar">
          {LANDING_SECTIONS.map((section, idx) => {
            const Icon = section.icon;
            const isCompleted = generations[idx] !== undefined;
            const isActive = idx === currentStep;

            return (
              <div
                key={section.id}
                onClick={() => isCompleted || idx === currentStep ? setCurrentStep(idx) : null}
                className={`flex-shrink-0 flex items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer ${isActive ? 'border-primary-color bg-primary-color/10 shadow-[0_0_15px_rgba(18,216,250,0.2)]' :
                    isCompleted ? 'border-green-500/50 bg-green-500/5 text-green-500' : 'border-white/5 bg-white/5 opacity-50'
                  }`}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-primary-color text-black' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-800'}`}>
                  {isCompleted ? <FaCheckCircle /> : <Icon />}
                </div>
                {isActive && <span className="text-xs font-bold whitespace-nowrap">{section.title}</span>}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Lado Izquierdo: Inputs de Producto */}
          <div className="lg:col-span-4 space-y-6">
            <div className="soft-card p-6">
              <h2 className="text-lg font-semibold text-theme-primary mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary-color rounded-full"></div>
                Datos del Producto
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider">Imagen Base / Producto</label>
                  <ImageUploader onImageSelect={handleImageSelect} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider">Nombre</label>
                  <input
                    type="text"
                    placeholder="Ej: Serum Rejuvenecedor"
                    className="w-full bg-theme-component border border-white/5 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none"
                    value={productData.name}
                    onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider">Ángulo de Venta</label>
                  <textarea
                    placeholder="Describe la propuesta única de valor..."
                    rows={3}
                    className="w-full bg-theme-component border border-white/5 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none resize-none"
                    value={productData.angle}
                    onChange={(e) => setProductData({ ...productData, angle: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider">Público y Detalles</label>
                  <textarea
                    placeholder="Público objetivo, estilo de marca..."
                    rows={3}
                    className="w-full bg-theme-component border border-white/5 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none resize-none"
                    value={productData.buyer}
                    onChange={(e) => setProductData({ ...productData, buyer: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-primary-color/5 border border-primary-color/20 p-5 rounded-2xl">
              <h3 className="text-primary-color font-bold text-sm mb-2 flex items-center gap-2 uppercase tracking-widest">
                <currentSection.icon /> {currentSection.title}
              </h3>
              <p className="text-theme-secondary text-sm leading-relaxed">
                {currentSection.description}
              </p>
            </div>
          </div>

          {/* Lado Derecho: Generación de Sección */}
          <div className="lg:col-span-8 space-y-6">
            <div className="soft-card overflow-hidden min-h-[600px] flex flex-col">
              <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${generations[currentStep] ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className="text-xs font-bold text-theme-primary uppercase tracking-wider">{currentSection.title}</span>
                  </div>
                </div>

                {generations[currentStep] && (
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generations[currentStep];
                      link.download = `landing-${currentSection.id}.png`;
                      link.click();
                    }}
                    className="text-primary-color text-xs font-bold hover:underline flex items-center gap-1"
                  >
                    <FaRocket className="rotate-180" /> Descargar esta sección
                  </button>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center p-8 relative bg-grid-white/[0.02]">
                {generations[currentStep] ? (
                  <div className="relative group max-w-full">
                    <img
                      src={generations[currentStep]}
                      alt={currentSection.title}
                      className="rounded-2xl shadow-2xl border border-white/5 max-h-[550px]"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl"></div>
                  </div>
                ) : (
                  <div className="text-center space-y-6 max-w-md">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                      <currentSection.icon className="text-5xl text-theme-tertiary opacity-30" />
                    </div>
                    <div>
                      <h4 className="text-theme-primary font-bold mb-2">Listo para el Paso {currentStep + 1}</h4>
                      <p className="text-theme-tertiary text-sm">Haz clic en generar para crear el visual estratégico de la sección **{currentSection.title}**.</p>
                    </div>
                    <button
                      onClick={handleGenerateStep}
                      disabled={isGenerating || !productData.name || !baseImageBase64}
                      className="w-full py-4 bg-primary-color text-black font-bold rounded-2xl hover:shadow-[0_0_30px_rgba(18,216,250,0.3)] transition-all btn-modern flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent animate-spin rounded-full"></div>
                      ) : (
                        <>
                          <FaRocket /> Generar Sección {currentStep + 1}
                        </>
                      )}
                    </button>
                  </div>
                )}

                {isGenerating && (
                  <div className="absolute inset-0 bg-theme-primary/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 transition-all">
                    <div className="w-16 h-16 border-4 border-primary-color border-t-transparent animate-spin rounded-full mb-4 shadow-[0_0_40px_rgba(18,216,250,0.3)]"></div>
                    <p className="text-primary-color font-black text-lg animate-pulse tracking-widest uppercase">Diseñando {currentSection.title}...</p>
                  </div>
                )}
              </div>

              {/* Controles de Navegación Step-by-Step */}
              <div className="p-6 border-t border-white/5 bg-white/5 flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  disabled={currentStep === 0 || isGenerating}
                  className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-theme-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 font-bold text-sm"
                >
                  <FaChevronLeft /> Anterior
                </button>

                <div className="hidden md:flex flex-col items-center">
                  <div className="flex gap-1 mb-1">
                    {LANDING_SECTIONS.map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentStep ? 'bg-primary-color' : generations[i] ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                    ))}
                  </div>
                  <span className="text-[10px] uppercase font-black text-theme-tertiary tracking-tighter">Secuencia de Landing</span>
                </div>

                <div className="flex gap-4">
                  {generations[currentStep] && (
                    <button
                      onClick={handleGenerateStep}
                      disabled={isGenerating}
                      className="px-6 py-2.5 rounded-xl border border-primary-color/30 text-primary-color hover:bg-primary-color/5 transition-all flex items-center gap-2 font-bold text-sm"
                    >
                      <FaMagic /> Regenerar
                    </button>
                  )}
                  <button
                    onClick={() => setCurrentStep(prev => Math.min(LANDING_SECTIONS.length - 1, prev + 1))}
                    disabled={currentStep === LANDING_SECTIONS.length - 1 || !generations[currentStep] || isGenerating}
                    className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/10 hover:border-primary-color/50 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 font-bold text-sm"
                  >
                    Siguiente <FaChevronRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
