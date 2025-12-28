import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../contexts/AppContext';
import { useApiKey } from '../hooks/useApiKey';
import { useImageUsage } from '../hooks/useImageUsage';
import { LANDING_SECTIONS, FLASH_SECTION_IDS, MARKETING_LAYOUTS } from '../constants/landing-pro';
import { LandingMode, ProductData } from '../types/landing-pro';

export function useLandingPro() {
  const { googleAiKey, isSuperAdmin } = useAppContext();
  const { openApiKeyModal } = useApiKey();
  const { credits, refreshCredits } = useImageUsage();

  // Estados principales
  const [currentStep, setCurrentStep] = useState(0);
  const [productData, setProductData] = useState<ProductData>({
    name: '',
    angle: '',
    buyer: '',
    details: ''
  });
  const [baseImageBase64, setBaseImageBase64] = useState<string | null>(null);
  const [styleImageBase64, setStyleImageBase64] = useState<string | null>(null);
  const [generations, setGenerations] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [landingMode, setLandingMode] = useState<LandingMode>('full');

  // Estados de Edición y Plantillas
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [correctionPrompt, setCorrectionPrompt] = useState('');
  const [globalTemplates, setGlobalTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [isSectionSelectorOpen, setIsSectionSelectorOpen] = useState(false);

  // Secciones activas según el modo
  const activeSections = landingMode === 'flash'
    ? LANDING_SECTIONS.filter(s => FLASH_SECTION_IDS.includes(s.id))
    : LANDING_SECTIONS;

  const currentSection = activeSections[currentStep];

  // Cargar desde LocalStorage y Plantillas al iniciar
  useEffect(() => {
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

    const fetchTemplates = async () => {
      const { data } = await supabase.from('image_pro_templates').select('*');
      if (data) setGlobalTemplates(data);
    };
    fetchTemplates();
  }, []);

  // Guardar en LocalStorage
  useEffect(() => {
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
        const currentSectionId = currentSection?.id || 'error';
        const optimizedGenerations = { [currentSectionId]: generations[currentSectionId] };
        localStorage.setItem('ecomlab_landing_pro', JSON.stringify({ ...dataToSave, generations: optimizedGenerations }));
      }
    }
  }, [productData, currentStep, generations, baseImageBase64, styleImageBase64, selectedTemplate, selectedLayout, landingMode, currentSection]);

  const changeMode = (newMode: LandingMode) => {
    if (Object.keys(generations).length > 0) {
      if (!confirm('Cambiar de modo podría afectar tu progreso visual. ¿Deseas continuar?')) {
        return;
      }
    }
    const nextSections = newMode === 'flash'
      ? LANDING_SECTIONS.filter(s => FLASH_SECTION_IDS.includes(s.id))
      : LANDING_SECTIONS;

    setLandingMode(newMode);
    if (currentStep >= nextSections.length) {
      setCurrentStep(0);
    }
  };

  const handleImageSelect = async (file: File | string | null) => {
    if (file instanceof File) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      setBaseImageBase64(base64);
    } else {
      setBaseImageBase64(file as string | null);
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
    } else {
      setStyleImageBase64(file as string | null);
    }
  };

  const handleStepChange = (idx: number) => {
    if (isGenerating) return;
    if (landingMode === 'section') {
      setCurrentStep(idx);
      return;
    }
    if (idx <= currentStep) {
      setCurrentStep(idx);
    } else {
      const previousStepsCompleted = activeSections.slice(0, idx).every(s => generations[s.id]);
      if (previousStepsCompleted) {
        setCurrentStep(idx);
      } else {
        alert('Debes completar las secciones anteriores en orden para asegurar la consistencia del diseño.');
      }
    }
  };

  const handleGenerateStep = async (isCorrection = false) => {
    if (credits < 10 && !isSuperAdmin()) {
      alert(`Necesitas al menos 10 créditos para generar una sección. Tu saldo actual es de ${credits}.`);
      return;
    }

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

    let productIdRef = baseImageBase64;
    let styleRef = null;
    let referenceType: 'style' | 'layout' = 'style';
    let continuityImage = undefined;

    // 1. Preferencia Explícita del Usuario (Plantilla, Biblioteca o Subida)
    if (selectedLayout) {
      referenceType = 'layout';
      if (styleImageBase64) styleRef = styleImageBase64;
      else if (selectedTemplate) styleRef = selectedTemplate.url;
    } else if (styleImageBase64) {
      styleRef = styleImageBase64;
      referenceType = 'style';
    } else if (selectedTemplate) {
      styleRef = selectedTemplate.url;
      referenceType = 'style';
    }

    // 2. Lógica de Continuidad (Encadenamiento)
    // Si no es corrección y estamos en paso > 0, usamos la imagen anterior para estilo
    if (!isCorrection && currentStep > 0) {
      const prevSectionId = activeSections[currentStep - 1].id;
      if (generations[prevSectionId]) {
        continuityImage = generations[prevSectionId];
      }
    }

    // 3. Caso especial: Si es corrección, el producto es la imagen actual
    if (isCorrection) {
      productIdRef = generations[section.id];
      styleRef = null; // No usamos referencia externa en corrección a menos que se quiera explícitamente
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
          mode: 'landing',
          subMode: landingMode,
          productData,
          aspectRatio: '9:16',
          referenceImage: styleRef,
          referenceType,
          prompt: isCorrection
            ? correctionPrompt
            : `SECTION: ${section.title} | ${section.prompt} | DESCRIPTION: ${section.description} | CUSTOM CONTEXT: ${productData.details} | ${activeLayout ? `LAYOUT GOAL: ${activeLayout.prompt}` : ''}`,
          isCorrection,
          previousImageUrl: productIdRef,
          continuityImage,
          debug: false 
        })
      });

      const data = await response.json();

      if (data.success) {
        setGenerations(prev => ({ ...prev, [section.id]: data.imageUrl }));
        if (isCorrection) setCorrectionPrompt('');
        refreshCredits();
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

  return {
    state: {
      currentStep,
      productData,
      baseImageBase64,
      styleImageBase64,
      generations,
      isGenerating,
      selectedLayout,
      isLibraryOpen,
      landingMode,
      activeSections,
      currentSection,
      isCorrectionModalOpen,
      correctionPrompt,
      globalTemplates,
      selectedTemplate,
      isContextOpen,
      isSectionSelectorOpen
    },
    actions: {
      setCurrentStep,
      setProductData,
      setBaseImageBase64,
      setStyleImageBase64,
      setGenerations,
      setIsGenerating,
      setSelectedLayout,
      setIsLibraryOpen,
      setLandingMode,
      changeMode,
      handleImageSelect,
      handleStyleImageSelect,
      handleStepChange,
      handleGenerateStep,
      resetProject,
      setIsCorrectionModalOpen,
      setCorrectionPrompt,
      setSelectedTemplate,
      setIsContextOpen,
      setIsSectionSelectorOpen
    }
  };
}
