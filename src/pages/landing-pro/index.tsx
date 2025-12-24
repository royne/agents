import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  FaMagic, FaRocket, FaEdit, FaImage, FaChevronRight, FaChevronLeft,
  FaCertificate, FaUsers, FaBook, FaTrash, FaCube, FaListUl,
  FaFlagCheckered, FaDollarSign, FaExchangeAlt, FaStar, FaCheckCircle
} from 'react-icons/fa';
import ImageUploader from '../../components/ImageGen/ImageUploader';
import { useAppContext } from '../../contexts/AppContext';
import { useApiKey } from '../../hooks/useApiKey';
import { supabase } from '../../lib/supabase';
import Head from 'next/head';

// Definición de las secciones de la Landing con PROMPTS OPTIMIZADOS Y AISLADOS
const LANDING_SECTIONS = [
  {
    id: 'hero',
    title: 'Hero / Gancho',
    description: 'Captura la atención con un mensaje poderoso que conecta con el dolor del cliente.',
    icon: FaMagic,
    prompt: 'IMPACTFUL HERO SECTION: Create a cinematic advertisement. Focus ONLY on the emotional hook. DO NOT include pricing or detailed features. The product is the STARRING HERO.'
  },
  {
    id: 'oferta',
    title: 'Oferta Irresistible',
    description: 'Presenta tu producto con un precio y valor que el cliente no puede rechazar.',
    icon: FaDollarSign,
    prompt: 'IRRESISTIBLE OFFER: Studio shot focus on the deal. This is the ONLY section that should clearly show pricing and bundles. Bold, commercial aesthetic.'
  },
  {
    id: 'transformacion',
    title: 'Antes y Después',
    description: 'Muestra la transformación que tu producto genera en la vida del cliente.',
    icon: FaExchangeAlt,
    prompt: 'TRANSFORMATION (Before & After): ISOLATED SECTION. DO NOT include pricing tables or offer details from previous steps. Focus strictly on the "Problem vs Solution" visual comparison.'
  },
  {
    id: 'beneficios',
    title: 'Beneficios',
    description: 'Lista los beneficios clave que resuelven los problemas de tu audiencia.',
    icon: FaStar,
    prompt: 'DYNAMIC BENEFITS: High-end lifestyle. DO NOT replicate the Hero or Offer layout. Focus on 3 key benefits in action. No prices.'
  },
  {
    id: 'comparativa',
    title: 'Tabla Comparativa',
    description: 'Compara tu producto vs alternativas para mostrar superioridad.',
    icon: FaListUl,
    prompt: 'COMPETITIVE ADVANTAGE: Visual comparison of quality. Clean, professional. Do not bring content from the Benefits or Offer section.'
  },
  {
    id: 'autoridad',
    title: 'Prueba de Autoridad',
    description: 'Certificaciones, estudios y credenciales que validan tu producto.',
    icon: FaCertificate,
    prompt: 'AUTHORITY & TRUST: Professional environment. Lab or expert setting. Focus on validation. No marketing hooks or prices.'
  },
  {
    id: 'testimonios',
    title: 'Testimonios',
    description: 'Historias reales de clientes satisfechos que generan confianza.',
    icon: FaUsers,
    prompt: 'SOCIAL PROOF: Authentic human emotion. The product integrated into real life. Do not include authority seals or pricing here.'
  },
  {
    id: 'instrucciones',
    title: 'Cómo Usar',
    description: 'Instrucciones claras que eliminan objeciones sobre complejidad.',
    icon: FaBook,
    prompt: 'HOW IT WORKS: Macro details of use. Educational feel. strictly functional visual. No testimonials or offers.'
  },
  {
    id: 'componentes',
    title: 'Componentes / Calidad',
    description: 'Explosión visual de ingredientes o materiales. Usaremos etiquetas flotantes para resaltar la calidad.',
    icon: FaCube,
    prompt: 'PRODUCT ANATOMY: Cinematic exploded view. The product is surrounded by its raw premium ingredients (herbs, oils, or materials) floating in high-definition. ADD ELEGANT GRAPHIC CALLOUTS or floating text labels pointing to each component. Professional studio lighting with sharp focus.'
  },
  {
    id: 'cierre',
    title: 'Cierre / Acción',
    description: 'El empujón final. Crea urgencia sutil y resalta el gran beneficio de tomar acción ahora.',
    icon: FaFlagCheckered,
    prompt: 'POWERFUL CLOSING CTA: High-end lifestyle shot showing the "Final Transformation". The product is presented as the ultimate solution. Include subtle visual elements of exclusivity or limited time (like a premium "Limited Edition" seal or a focus on the action of clicking). Vibe: Empowerment and immediate positive change.'
  }
];

// IDs de las secciones para el modo Flash (Rápido)
const FLASH_SECTION_IDS = ['hero', 'oferta', 'beneficios', 'testimonios', 'cierre'];

const MARKETING_LAYOUTS = [
  { id: 'impact', name: 'Impacto Visual', desc: 'Producto central grande y épico', prompt: 'COMPOSITION: Large hero product strictly centered. Cinematic wide shot. Minimalist background to emphasize scale.' },
  { id: 'split', name: 'Comparativa', desc: 'Lado a lado (Antes/Después)', prompt: 'COMPOSITION: Vertical split screen. Product on the right, problem visualization on the left. High contrast.' },
  { id: 'details', name: 'Grid Beneficios', desc: 'Enfoque en texturas y detalles', prompt: 'COMPOSITION: Macro focus on product parts with soft bokeh background. Dynamic floating elements around.' },
  { id: 'trust', name: 'Prueba Social', desc: 'Producto integrado en vida real', prompt: 'COMPOSITION: Lifestyle integration. Human hands interacting with product. Rule of thirds placement.' }
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
  const [styleImageBase64, setStyleImageBase64] = useState<string | null>(null);
  const [generations, setGenerations] = useState<Record<string, string>>({}); // Cambiado a Record<string, string> para usar IDs como llaves
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
  const [landingMode, setLandingMode] = useState<'full' | 'flash'>('full');

  // Estados de Edición y Plantillas
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [correctionPrompt, setCorrectionPrompt] = useState('');
  const [globalTemplates, setGlobalTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);

  // Cargar desde LocalStorage y Plantillas al iniciar
  useEffect(() => {
    // Cargar progreso
    const saved = localStorage.getItem('ecomlab_landing_pro');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.productData) setProductData(parsed.productData);
        if (parsed.currentStep !== undefined) setCurrentStep(parsed.currentStep);
        if (parsed.generations) setGenerations(parsed.generations);
        if (parsed.baseImageBase64) setBaseImageBase64(parsed.baseImageBase64);
        if (parsed.styleImageBase64) setStyleImageBase64(parsed.styleImageBase64);
        if (parsed.selectedTemplate) setSelectedTemplate(parsed.selectedTemplate);
        if (parsed.selectedLayout) setSelectedLayout(parsed.selectedLayout);
        if (parsed.landingMode) setLandingMode(parsed.landingMode);
      } catch (e) {
        console.error('Error al cargar datos guardados', e);
      }
    }

    // Cargar plantillas de inspiración
    const fetchTemplates = async () => {
      const { data } = await supabase.from('image_pro_templates').select('*');
      if (data) setGlobalTemplates(data);
    };
    fetchTemplates();
  }, []);

  // Guardar en LocalStorage con manejo de Cuota
  useEffect(() => {
    const saveToLocalStorage = () => {
      const dataToSave = {
        productData,
        currentStep,
        generations,
        baseImageBase64,
        styleImageBase64,
        selectedTemplate,
        selectedLayout,
        landingMode
      };

      try {
        localStorage.setItem('ecomlab_landing_pro', JSON.stringify(dataToSave));
      } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          console.warn('LocalStorage lleno. Intentando optimizar espacio...');
          const currentSectionId = activeSections[currentStep]?.id || 'error';
          const optimizedGenerations = { [currentSectionId]: generations[currentSectionId] };
          const optimizedData = { ...dataToSave, generations: optimizedGenerations };
          try {
            localStorage.setItem('ecomlab_landing_pro', JSON.stringify(optimizedData));
          } catch (innerError) {
            console.error('Optimización falló.');
            localStorage.setItem('ecomlab_landing_pro', JSON.stringify({
              productData, currentStep, selectedTemplate
            }));
          }
        }
      }
    };

    saveToLocalStorage();
  }, [productData, currentStep, generations, baseImageBase64, styleImageBase64, selectedTemplate, selectedLayout, landingMode]);

  // Secciones activas según el modo
  const activeSections = landingMode === 'full'
    ? LANDING_SECTIONS
    : LANDING_SECTIONS.filter(s => FLASH_SECTION_IDS.includes(s.id));

  const currentSection = activeSections[currentStep];

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

  const handleStyleImageSelect = async (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      setStyleImageBase64(base64);
    } else {
      setStyleImageBase64(null);
    }
  };

  const handleGenerateStep = async (isCorrection: boolean = false) => {
    if (!googleAiKey) {
      openApiKeyModal('google');
      return;
    }

    if (!productData.name || !baseImageBase64) {
      alert('Por favor, completa el nombre del producto y sube una imagen base.');
      return;
    }

    setIsGenerating(true);
    if (isCorrection) setIsCorrectionModalOpen(false);

    const section = activeSections[currentStep];
    const activeLayout = MARKETING_LAYOUTS.find(l => l.id === selectedLayout);

    // LOGICA DE REFERENCIAS AVANZADA (Producto vs Estilo vs Layout):
    let productIdRef = baseImageBase64;
    let styleRef = null;
    let referenceType = 'style'; // Por defecto es Estilo

    // Prioridad 1: Imagen de Estilo Personalizada (Branding)
    if (styleImageBase64) {
      styleRef = styleImageBase64;
      referenceType = 'style';
    }
    // Prioridad 2: Estructura de Marketing Directa (Layout)
    else if (selectedLayout) {
      referenceType = 'layout';
      // Nota: Si hay layout, el prompt ya incluye la instrucción de composición
    }
    // Prioridad 3: Plantilla de Inspiración Global (Estilo)
    else if (selectedTemplate) {
      styleRef = selectedTemplate.url;
      referenceType = 'style';
    }

    if (isCorrection) {
      productIdRef = generations[section.id];
      styleRef = null;
    }
    // Prioridad 4: Consistencia Visual (Paso Anterior - SOLO ESTILO)
    else if (currentStep > 0) {
      const prevSection = activeSections[currentStep - 1];
      if (generations[prevSection.id]) {
        styleRef = generations[prevSection.id];
        referenceType = 'style';
      }
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
          productData: {
            ...productData,
            details: `${productData.details} | Section: ${section.title} | Instructions: ${section.description} | ${activeLayout ? activeLayout.prompt : ''}`
          },
          aspectRatio: '9:16',
          referenceImage: styleRef,
          referenceType,
          prompt: isCorrection ? correctionPrompt : section.prompt,
          isCorrection,
          previousImageUrl: productIdRef
        })
      });

      const data = await response.json();
      if (data.success) {
        setGenerations(prev => ({ ...prev, [section.id]: data.imageUrl }));
        if (isCorrection) setCorrectionPrompt('');
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
    if (confirm('¿Estás seguro de que deseas reiniciar todo el proyecto?')) {
      setGenerations({});
      setCurrentStep(0);
      setProductData({ name: '', angle: '', buyer: '', details: '' });
      setBaseImageBase64(null);
      setStyleImageBase64(null);
      setSelectedLayout(null);
      setLandingMode('full');
      localStorage.removeItem('ecomlab_landing_pro');
      window.location.reload();
    }
  };

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
              <h1 className="text-3xl font-bold text-theme-primary tracking-tight tracking-tighter">Landing <span className="text-primary-color drop-shadow-[0_0_10px_rgba(18,216,250,0.5)]">PRO</span></h1>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-theme-secondary opacity-80 uppercase text-[10px] font-black tracking-widest leading-none">Generador de Marketing Secuencial</p>
              <span className="bg-primary-color/10 text-primary-color text-[10px] px-2 py-0.5 rounded-full font-bold">V1.5</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Selector de Modo */}
            <div className="flex bg-theme-component border border-white/10 rounded-xl p-1 shadow-inner">
              <button
                onClick={() => Object.keys(generations).length > 0 ? (confirm('Cambiar de modo podría afectar tu progreso actual. ¿Deseas continuar?') && setLandingMode('full')) : setLandingMode('full')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${landingMode === 'full' ? 'bg-primary-color text-black shadow-lg shadow-primary-color/20' : 'text-theme-tertiary hover:text-white'}`}
              >
                Completo
              </button>
              <button
                onClick={() => Object.keys(generations).length > 0 ? (confirm('Cambiar de modo podría afectar tu progreso actual. ¿Deseas continuar?') && setLandingMode('flash')) : setLandingMode('flash')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${landingMode === 'flash' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-theme-tertiary hover:text-white'}`}
              >
                Flash
              </button>
            </div>

            <button
              onClick={resetProject}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:text-rose-400 transition-all text-theme-tertiary text-sm flex items-center gap-2 font-bold"
            >
              <FaTrash /> Reiniciar Proyecto
            </button>
            <div className="px-5 py-2.5 rounded-xl bg-theme-component border border-white/10 text-theme-secondary font-black flex items-center gap-2 shadow-inner">
              <span className="text-primary-color text-lg">{currentStep + 1}</span> / {activeSections.length} <span className="text-[10px] opacity-40">PASOS</span>
            </div>
          </div>
        </div>

        {/* Stepper Visual con Estética Premium */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-4 no-scrollbar">
          {activeSections.map((section, idx) => {
            const Icon = section.icon;
            const isCompleted = generations[section.id] !== undefined;
            const isActive = idx === currentStep;

            return (
              <div
                key={section.id}
                onClick={() => isCompleted || idx === currentStep ? setCurrentStep(idx) : null}
                className={`flex-shrink-0 flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer group ${isActive ? 'border-primary-color bg-primary-color/10 shadow-[0_0_25px_rgba(18,216,250,0.15)] ring-1 ring-primary-color/30' :
                  isCompleted ? 'border-green-500/30 bg-green-500/5 text-green-500 hover:border-green-500/60' : 'border-white/5 bg-white/5 opacity-40 hover:opacity-100 hover:border-white/20'
                  }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-primary-color text-black scale-110' : isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'}`}>
                  {isCompleted ? <FaCheckCircle className="text-lg" /> : <Icon className="text-lg" />}
                </div>
                {isActive && (
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-tighter opacity-50">Sección {idx + 1}</span>
                    <span className="text-xs font-bold whitespace-nowrap leading-none">{section.title}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Lado Izquierdo: Configuración de Identidad */}
          <div className="lg:col-span-4 space-y-6">
            <div className="soft-card p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-color/5 blur-2xl rounded-full -mr-8 -mt-8"></div>

              <h2 className="text-lg font-bold text-theme-primary mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary-color rounded-full"></div>
                Nucleo de Identidad
              </h2>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-theme-secondary uppercase tracking-[0.15em] flex justify-between">
                    <span>1. Foto Producto Real</span>
                    <span className="text-primary-color font-bold">Obligatorio</span>
                  </label>
                  <ImageUploader onImageSelect={handleImageSelect} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-theme-secondary uppercase tracking-[0.15em] flex justify-between">
                    <span>2. Referencia de Estilo / Branding</span>
                    <span className="text-theme-tertiary opacity-40 italic">Opcional</span>
                  </label>
                  <div className="relative group">
                    <ImageUploader onImageSelect={handleStyleImageSelect} />
                    {styleImageBase64 && (
                      <button
                        onClick={() => setStyleImageBase64(null)}
                        className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-theme-tertiary opacity-50 italic">Sube una imagen con el "mood", colores o iluminación que deseas imitar.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-theme-secondary uppercase tracking-[0.15em]">¿Cómo se llama?</label>
                  <input
                    type="text"
                    placeholder="Ej: Reloj Nebula One"
                    className="w-full bg-theme-component border border-white/5 rounded-xl p-4 text-theme-primary focus:border-primary-color outline-none transition-all placeholder:opacity-30"
                    value={productData.name}
                    onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-theme-secondary uppercase tracking-[0.15em]">Ángulo de Marketing</label>
                  <textarea
                    placeholder="Ej: El único reloj que predice tu nivel de estrés..."
                    rows={3}
                    className="w-full bg-theme-component border border-white/5 rounded-xl p-4 text-theme-primary focus:border-primary-color outline-none resize-none transition-all placeholder:opacity-30"
                    value={productData.angle}
                    onChange={(e) => setProductData({ ...productData, angle: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Generación, Contexto y Selección */}
          <div className="lg:col-span-8 space-y-6">
            {/* Visualizador de Generación Principal */}
            <div className="soft-card overflow-hidden min-h-[650px] flex flex-col relative group/main">
              {/* Overlay de Carga */}
              {isGenerating && (
                <div className="absolute inset-0 bg-theme-primary/90 backdrop-blur-md flex flex-col items-center justify-center z-30 transition-all duration-500">
                  <div className="relative">
                    <div className="w-24 h-24 border-2 border-primary-color/20 rounded-full"></div>
                    <div className="absolute inset-0 w-24 h-24 border-t-2 border-primary-color animate-spin rounded-full shadow-[0_0_30px_rgba(18,216,250,0.5)]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <currentSection.icon className="text-2xl text-primary-color animate-pulse" />
                    </div>
                  </div>
                  <div className="mt-8 text-center">
                    <p className="text-primary-color font-black text-xl tracking-[0.3em] uppercase mb-2">Diseñando</p>
                    <p className="text-white font-bold opacity-60 uppercase text-xs tracking-widest">{currentSection.title}</p>
                  </div>
                </div>
              )}

              <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${generations[currentSection.id] ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 animate-pulse'}`}></div>
                  <span className="text-[10px] font-black text-theme-primary uppercase tracking-[0.2em]">{currentSection.title}</span>
                </div>

                {generations[currentSection.id] && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => setIsCorrectionModalOpen(true)}
                      className="text-theme-secondary text-xs font-bold hover:text-primary-color transition-colors flex items-center gap-2"
                    >
                      <FaEdit className="text-sm" /> Pulir esta imagen
                    </button>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = generations[currentSection.id];
                        link.download = `landing-${currentSection.id}.png`;
                        link.click();
                      }}
                      className="bg-primary-color text-black px-4 py-1.5 rounded-full text-[10px] font-black hover:scale-105 transition-all shadow-lg shadow-primary-color/20 flex items-center gap-2"
                    >
                      <FaRocket className="rotate-180" /> DESCARGAR
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center p-10 relative bg-[#07090E]">
                {generations[currentSection.id] ? (
                  <div className="relative group max-w-full">
                    <img
                      src={generations[currentSection.id]}
                      alt={currentSection.title}
                      className="rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 max-h-[580px] object-contain"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl pointer-events-none"></div>
                  </div>
                ) : (
                  <div className="text-center space-y-8 max-w-sm">
                    <div className="w-28 h-28 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto border border-white/10 shadow-inner group-hover/main:border-primary-color/30 transition-all duration-700">
                      <currentSection.icon className="text-5xl text-theme-tertiary opacity-30 group-hover/main:opacity-100 group-hover/main:text-primary-color transition-all duration-700" />
                    </div>
                    <div>
                      <h4 className="text-white font-black text-2xl mb-3 tracking-tight">Crea el {currentSection.title}</h4>
                      <p className="text-theme-secondary text-sm leading-relaxed opacity-60 font-medium">Usaremos tu imagen base y aplicaremos una estrategia de **Marketing de Respuesta Directa** para esta sección.</p>
                    </div>
                    <button
                      onClick={() => handleGenerateStep(false)}
                      disabled={isGenerating || !productData.name || !baseImageBase64}
                      className="w-full py-5 bg-primary-color text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:shadow-[0_0_50px_rgba(18,216,250,0.4)] hover:scale-[1.02] transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-4 group/btn"
                    >
                      <FaRocket className="group-hover/btn:-translate-y-1 transition-transform" />
                      <span>Iniciar Generación</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Barra de Control Step-by-Step */}
              <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  disabled={currentStep === 0 || isGenerating}
                  className="px-6 py-3 rounded-2xl border border-white/10 hover:bg-white/5 text-theme-secondary transition-all disabled:opacity-10 disabled:cursor-not-allowed flex items-center gap-2 font-black text-xs uppercase tracking-widest"
                >
                  <FaChevronLeft /> Volver
                </button>

                <div className="flex gap-2">
                  {activeSections.map((section, i) => (
                    <div
                      key={section.id}
                      className={`h-1.5 transition-all duration-500 rounded-full ${i === currentStep ? 'w-8 bg-primary-color' : generations[section.id] ? 'w-4 bg-green-500/50' : 'w-2 bg-white/10'}`}
                    ></div>
                  ))}
                </div>

                <div className="flex gap-4">
                  {generations[currentSection.id] && (
                    <button
                      onClick={() => handleGenerateStep(false)}
                      disabled={isGenerating}
                      className="px-6 py-3 rounded-2xl border border-primary-color/20 text-primary-color hover:bg-primary-color/5 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-color/5"
                    >
                      <FaMagic /> Regenerar
                    </button>
                  )}
                  <button
                    onClick={() => setCurrentStep(prev => Math.min(activeSections.length - 1, prev + 1))}
                    disabled={currentStep === activeSections.length - 1 || !generations[currentSection.id] || isGenerating}
                    className={`px-8 py-3 rounded-2xl transition-all flex items-center gap-3 font-black text-xs uppercase tracking-widest ${!generations[currentSection.id] ? 'bg-white/5 text-white/20' : 'bg-white text-black hover:scale-105'}`}
                  >
                    Próximo Paso <FaChevronRight />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid de Paneles de Apoyo Inferiores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Panel de Contexto de Sección */}
              <div className="bg-gradient-to-br from-primary-color/10 via-transparent to-transparent border border-primary-color/20 p-6 rounded-3xl relative overflow-hidden group">
                <div className="absolute -bottom-4 -right-4 text-7xl opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                  <currentSection.icon />
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-primary-color text-black rounded-xl">
                    <currentSection.icon className="text-lg" />
                  </div>
                  <div>
                    <h3 className="text-primary-color font-black text-sm uppercase tracking-widest leading-none">Paso {currentStep + 1}</h3>
                    <span className="text-white font-bold text-lg">{currentSection.title}</span>
                  </div>
                </div>
                <p className="text-theme-secondary text-sm leading-relaxed opacity-80 font-medium italic">
                  "{currentSection.description}"
                </p>
              </div>

              {/* Estructuras Sugeridas (Templates de Layout) */}
              {!generations[currentSection.id] && (
                <div className="soft-card p-5 border-blue-500/10">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-[10px] font-black text-theme-tertiary uppercase tracking-widest block">Estructuras de Marketing</label>
                    {selectedLayout && (
                      <button
                        onClick={() => setSelectedLayout(null)}
                        className="text-[9px] font-bold text-primary-color uppercase tracking-tighter hover:opacity-70"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {MARKETING_LAYOUTS.map((layout) => (
                      <button
                        key={layout.id}
                        onClick={() => setSelectedLayout(selectedLayout === layout.id ? null : layout.id)}
                        className={`p-3 rounded-xl border transition-all text-left group relative overflow-hidden ${selectedLayout === layout.id
                          ? 'bg-primary-color/10 border-primary-color ring-1 ring-primary-color/30'
                          : 'bg-white/5 border-white/10 hover:border-white/30'
                          }`}
                      >
                        {selectedLayout === layout.id && (
                          <div className="absolute top-0 right-0 p-1.5 bg-primary-color text-black rounded-bl-lg">
                            <FaCheckCircle className="text-[10px]" />
                          </div>
                        )}
                        <p className={`text-[10px] font-bold mb-1 transition-colors ${selectedLayout === layout.id ? 'text-primary-color' : 'text-white group-hover:text-primary-color'}`}>{layout.name}</p>
                        <p className="text-[8px] text-theme-tertiary opacity-60 leading-tight">{layout.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Corrección Estilo Premium */}
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsCorrectionModalOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-theme-component border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-color/10 rounded-2xl">
                  <FaEdit className="text-primary-color text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Perfeccionar Imagen</h3>
                  <p className="text-xs text-theme-tertiary font-bold tracking-widest uppercase opacity-60">Sección: {currentSection.title}</p>
                </div>
              </div>
              <button onClick={() => setIsCorrectionModalOpen(false)} className="text-theme-tertiary hover:text-white transition-all text-xl">✕</button>
            </div>

            <div className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-primary-color uppercase tracking-[0.3em]">Instrucciones de Ajuste</label>
                <textarea
                  placeholder="Ej: Haz el fondo más elegante, añade reflejos dorados y mejora la nitidez del logo..."
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white focus:border-primary-color outline-none transition-all placeholder:opacity-30 resize-none font-medium"
                  value={correctionPrompt}
                  onChange={(e) => setCorrectionPrompt(e.target.value)}
                />
              </div>

              <div className="bg-primary-color/5 p-4 rounded-2xl border border-primary-color/10 flex items-start gap-4">
                <div className="p-2 bg-primary-color text-black rounded-lg mt-1"><FaMagic className="text-xs" /></div>
                <p className="text-xs text-theme-secondary leading-relaxed">
                  **Tip:** Sé específico con la iluminación y los materiales. Imagen 3 Pro responde mejor a instrucciones visuales concretas como "luz suave de atardecer" o "textura de cristal pulido".
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsCorrectionModalOpen(false)}
                  className="flex-1 py-5 text-theme-tertiary font-black uppercase tracking-widest hover:text-white transition-all"
                >
                  Descartar
                </button>
                <button
                  onClick={() => handleGenerateStep(true)}
                  className="flex-[2] py-5 bg-primary-color text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:shadow-[0_0_40px_rgba(18,216,250,0.3)] transition-all hover:scale-[1.02]"
                >
                  Aplicar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
