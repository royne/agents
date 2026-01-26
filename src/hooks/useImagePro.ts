import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../contexts/AppContext';
import { useApiKey } from '../hooks/useApiKey';
import { useImageUsage } from '../hooks/useImageUsage';
import { ADS_STEPS, PERSONA_PROMPTS } from '../constants/image-pro';
import { 
  GenerationMode, 
  AdsSubMode, 
  PersonaOption, 
  FaceSwapOption, 
  AspectRatio, 
  ProductData 
} from '../types/image-pro';

export function useImagePro() {
  const { googleAiKey, isSuperAdmin } = useAppContext();
  const { openApiKeyModal } = useApiKey();
  const { credits, refreshCredits } = useImageUsage();

  // Estados principales
  const [baseImageBase64, setBaseImageBase64] = useState<string | null>(null);
  const [styleImageBase64, setStyleImageBase64] = useState<string | null>(null);
  const [productData, setProductData] = useState<ProductData>({
    name: '',
    angle: '',
    buyer: '',
    details: ''
  });
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [correctionPrompt, setCorrectionPrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Estados de modos
  const [generationMode, setGenerationMode] = useState<GenerationMode>('ads');
  const [adsSubMode, setAdsSubMode] = useState<AdsSubMode>('sencillo');
  const [personaOption, setPersonaOption] = useState<PersonaOption>('generar');
  const [faceSwapOption, setFaceSwapOption] = useState<FaceSwapOption>('completo');
  const [currentAdStep, setCurrentAdStep] = useState(0);
  const [generations, setGenerations] = useState<Record<string, string>>({});
  const [isContextExpanded, setIsContextExpanded] = useState(false);

  // Efecto para ajustar ratio por defecto según modo
  useEffect(() => {
    if (generationMode === 'personas') setAspectRatio('9:16');
    else setAspectRatio('1:1');
  }, [generationMode]);

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

    let finalPrompt = '';
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
      finalPrompt = `${PERSONA_PROMPTS[personaOption as keyof typeof PERSONA_PROMPTS]}${faceSwapMode} ${userInstructions}`;
    } else {
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
          productData,
          aspectRatio,
          referenceImage: styleImageBase64,
          referenceType: generationMode === 'ads' ? 'layout' : 'style',
          isCorrection,
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
        if (generationMode === 'ads' && adsSubMode === 'completo') {
          setGenerations(prev => ({ ...prev, [ADS_STEPS[currentAdStep].id]: data.imageUrl }));
          setGeneratedImageUrl(data.imageUrl);
        } else {
          setGeneratedImageUrl(data.imageUrl);
        }
        setTimeout(() => refreshCredits(), 500);
        setIsGenerating(false);
      } else if (data.generationId) {
        startPolling(data.generationId, authToken);
      } else {
        alert(data.error || 'Error al iniciar la generación');
        setIsGenerating(false);
      }
    } catch (error) {
      console.error(error);
      alert('Se ha perdido la conexión temporalmente...');
      setIsGenerating(false);
    }
  };

  const startPolling = async (genId: string, authToken: string | undefined) => {
    let attempts = 0;
    const maxAttempts = 60;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        alert('La generación está tardando más de lo esperado...');
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
      } catch (err) {
        attempts++;
        setTimeout(poll, 15000);
      }
    };
    poll();
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
      link.download = `imagen-dropapp-${Date.now()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download error:', err);
      window.open(url, '_blank');
    }
  };

  return {
    state: {
      baseImageBase64,
      styleImageBase64,
      productData,
      aspectRatio,
      isGenerating,
      isLibraryOpen,
      isConfigModalOpen,
      isCorrectionModalOpen,
      correctionPrompt,
      generatedImageUrl,
      isHistoryModalOpen,
      generationMode,
      adsSubMode,
      personaOption,
      faceSwapOption,
      currentAdStep,
      generations,
      isContextExpanded,
      credits
    },
    actions: {
      setBaseImageBase64,
      setStyleImageBase64,
      setProductData,
      setAspectRatio,
      setIsGenerating,
      setIsLibraryOpen,
      setIsConfigModalOpen,
      setIsCorrectionModalOpen,
      setCorrectionPrompt,
      setGeneratedImageUrl,
      setIsHistoryModalOpen,
      setGenerationMode,
      setAdsSubMode,
      setPersonaOption,
      setFaceSwapOption,
      setCurrentAdStep,
      setGenerations,
      setIsContextExpanded,
      handleImageSelect,
      handleStyleImageSelect,
      handleGenerate,
      handleDownload,
      refreshCredits
    }
  };
}
