import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ProductData, CreativePath, LandingGenerationState, AspectRatio } from '../types/image-pro';

export function useDiscovery() {
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [creativePaths, setCreativePaths] = useState<CreativePath[] | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [isDesigning, setIsDesigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Landing Generation State
  const [landingState, setLandingState] = useState<LandingGenerationState>({
    phase: 'landing',
    proposedStructure: null,
    selectedSectionId: null,
    selectedReferenceUrl: null,
    generations: {},
    adGenerations: {},
    adConcepts: []
  });

  // Auto-clear success after 4 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Polling helper
  const pollGenerationStatus = async (generationId: string, type: 'landing' | 'ad', id: string, aspectRatio: AspectRatio) => {
    console.log(`[useDiscovery] Starting polling for ${type}:`, id, 'generationId:', generationId);
    
    let attempts = 0;
    const maxAttempts = 20; // 5 minutes (reasonable for AI)
    const interval = 15000; // 15 seconds (match V1)

    const check = async () => {
      try {
        const response = await fetch(`/api/image-pro/status?id=${generationId}&_t=${Date.now()}`);
        const result = await response.json();

        if (result.done) {
          if (result.success) {
            console.log(`[useDiscovery] Polling SUCCESS for ${type}:`, id);
            if (type === 'landing') {
              setLandingState(prev => ({
                ...prev,
                generations: {
                  ...prev.generations,
                  [id]: { 
                    status: 'completed', 
                    imageUrl: result.imageUrl, 
                    copy: result.metadata?.copy || { headline: '', body: '' },
                    aspectRatio
                  }
                }
              }));
              // Clear instructions only on success
              updateSectionInstructions(id, '');
            } else {
              setLandingState(prev => ({
                ...prev,
                adGenerations: {
                  ...prev.adGenerations,
                  [id]: { imageUrl: result.imageUrl, status: 'completed', aspectRatio }
                }
              }));
            }
          } else {
            console.error(`[useDiscovery] Polling FAILED for ${type}:`, id, result.error);
            setError(result.error || 'Generation failed');
            setLandingState(prev => ({
              ...prev,
              [type === 'landing' ? 'generations' : 'adGenerations']: {
                ...prev[type === 'landing' ? 'generations' : 'adGenerations'],
                [id]: { ...prev[type === 'landing' ? 'generations' : 'adGenerations'][id], status: 'failed' }
              }
            }));
          }
          return true; // Stop polling
        }
      } catch (err) {
        console.error('[useDiscovery] Polling check error:', err);
      }
      return false; // Continue polling
    };

    const runPolling = async () => {
      // First check deferred by interval as per V1 strategy to avoid server saturation
      await new Promise(r => setTimeout(r, interval));
      
      while (attempts < maxAttempts) {
        attempts++;
        const isDone = await check();
        if (isDone) return;
        await new Promise(r => setTimeout(r, interval));
      }
      
      console.error(`[useDiscovery] Polling TIMEOUT for ${type}:`, id);
      setError('Generation timed out. Please try again.');
      setLandingState(prev => ({
        ...prev,
        [type === 'landing' ? 'generations' : 'adGenerations']: {
          ...prev[type === 'landing' ? 'generations' : 'adGenerations'],
          [id]: { ...prev[type === 'landing' ? 'generations' : 'adGenerations'][id], status: 'failed' }
        }
      }));
    };

    runPolling();
  };

  const discover = async (input: { url?: string; imageBase64?: string }) => {
    setIsDiscovering(true);
    setCreativePaths(null);
    setLandingState({ 
      phase: 'landing',
      proposedStructure: null, 
      selectedSectionId: null, 
      selectedReferenceUrl: null, 
      generations: {},
      adGenerations: {},
      baseImageUrl: input.url || input.imageBase64 
    });
    setError(null);
    try {
      const response = await fetch('/api/v2/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const result = await response.json();

      if (result.success) {
        setProductData(result.data);
      } else {
        setError(result.error || 'Failed to discover product.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to discovery service.');
    } finally {
      setIsDiscovering(false);
    }
  };

  const getCreativeRecommendations = async () => {
    if (!productData) return;
    
    setIsRecommending(true);
    setError(null);
    try {
      const response = await fetch('/api/v2/creative/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productData }),
      });

      const result = await response.json();

      if (result.success) {
        setCreativePaths(result.data);
      } else {
        setError(result.error || 'Failed to get creative recommendations.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to creative director.');
    } finally {
      setIsRecommending(false);
    }
  };

  const generateLandingProposal = async (creativePath: CreativePath) => {
    if (!productData) return;
    setIsDesigning(true);
    setError(null);
    try {
      const response = await fetch('/api/v2/landing/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productData, creativePath }),
      });
      const result = await response.json();
      if (result.success) {
        setLandingState(prev => ({ ...prev, proposedStructure: result.data }));
      } else {
        setError(result.error || 'Failed to generate landing proposal.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to landing designer.');
    } finally {
      setIsDesigning(false);
    }
  };

  const selectSection = (sectionId: string) => {
    setLandingState(prev => ({ 
      ...prev, 
      selectedSectionId: sectionId, 
      selectedReferenceUrl: null 
    }));
  };

  const selectReference = (url: string) => {
    setLandingState(prev => ({ ...prev, selectedReferenceUrl: url }));
  };

  const updateSectionInstructions = (sectionId: string, extraInstructions: string) => {
    console.log('[useDiscovery] updateSectionInstructions called for:', sectionId, 'New Instructions:', extraInstructions);
    setLandingState(prev => {
      if (!prev.proposedStructure) {
        console.warn('[useDiscovery] No proposedStructure found, cannot update instructions.');
        return prev;
      }
      
      const updatedSections = prev.proposedStructure.sections.map(s => {
        const match = s.sectionId.toLowerCase() === sectionId.toLowerCase();
        if (match) console.log('[useDiscovery] MATCH FOUND for section:', s.sectionId);
        return match ? { ...s, extraInstructions } : s;
      });

      const found = updatedSections.some(s => s.sectionId.toLowerCase() === sectionId.toLowerCase());
      if (!found) console.error('[useDiscovery] NO MATCH FOUND for ID:', sectionId, 'Available IDs:', prev.proposedStructure.sections.map(s => s.sectionId));

      return {
        ...prev,
        proposedStructure: {
          ...prev.proposedStructure,
          sections: updatedSections
        }
      };
    });
  };

  const generateSection = async (sectionId: string, sectionTitle: string, isCorrection: boolean = false, manualInstructions?: string, aspectRatio: AspectRatio = '9:16') => {
    console.log('[useDiscovery] generateSection CALLED:', { sectionId, sectionTitle, isCorrection, manualInstructions, aspectRatio });
    
    if (!productData || !landingState.proposedStructure) {
      console.warn('[useDiscovery] generateSection ABORTED: Missing productData or proposedStructure');
      return;
    }

    if (!landingState.selectedReferenceUrl && !isCorrection) {
      console.warn('[useDiscovery] generateSection ABORTED: Missing selectedReferenceUrl (and not a correction)');
      return;
    }

    // Set status to pending
    setLandingState(prev => ({
      ...prev,
      generations: {
        ...prev.generations,
        [sectionId]: { copy: { headline: '', body: '' }, imageUrl: '', status: 'pending', aspectRatio }
      }
    }));

    const extraInstructions = manualInstructions || landingState.proposedStructure.sections.find(s => s.sectionId.toLowerCase() === sectionId.toLowerCase())?.extraInstructions;
    console.log('[useDiscovery] Using extraInstructions:', extraInstructions);

    try {
      const creativePath = creativePaths?.[0]; // Defaulting to first for now, ideally pass selected
      if (!creativePath) throw new Error('No creative path selected');

      // IDENTITY: Always use the original product photo
      const identityImageUrl = landingState.baseImageUrl;
      
      // CONTINUITY: Use the immediately preceding generated section for style consistency
      let continuityImageUrl = identityImageUrl;
      const completedGenerations = Object.values(landingState.generations)
        .filter(g => g.status === 'completed' && g.imageUrl)
        .map(g => g.imageUrl);
      
      if (completedGenerations.length > 0) {
        continuityImageUrl = completedGenerations[completedGenerations.length - 1];
      }

      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      // REFERENCE: If it's a correction, use the CURRENT image as structural reference.
      // If it's a new generation, use the selected reference URL from the catalog.
      const currentGeneration = landingState.generations[sectionId];
      const effectiveReferenceUrl = (isCorrection && currentGeneration?.imageUrl) 
        ? currentGeneration.imageUrl 
        : landingState.selectedReferenceUrl;

      const response = await fetch('/api/v2/landing/generate-section', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          productData,
          creativePath,
          sectionId,
          sectionTitle,
          extraInstructions,
          isCorrection, // New: Pass isCorrection flag
          referenceUrl: effectiveReferenceUrl,
          previousImageUrl: identityImageUrl, // Real Identity Anchor
          continuityImage: continuityImageUrl, // Style Reference
          aspectRatio // New: selected formatting
        }),
      });

      const result = await response.json();

      if (result.success && result.data.generationId) {
        // Start Polling instead of waiting for result
        pollGenerationStatus(result.data.generationId, 'landing', sectionId, aspectRatio);
      } else {
        const errorMsg = result.error || 'Error al iniciar la generación';
        setError(errorMsg);
        
        setLandingState(prev => ({
          ...prev,
          generations: {
            ...prev.generations,
            [sectionId]: { 
              ...prev.generations[sectionId], 
              status: 'failed' 
            }
          }
        }));

        setTimeout(() => setError(null), 6000);
      }
    } catch (err: any) {
      console.error('[useDiscovery] Fetch error:', err);
      setError(err.message || 'Error de conexión');
      
      setLandingState(prev => ({
        ...prev,
        generations: {
          ...prev.generations,
          [sectionId]: { 
            ...prev.generations[sectionId],
            status: 'failed' 
          }
        }
      }));
      
      setTimeout(() => setError(null), 6000);
    }
  };

  const getAdConcepts = async () => {
    if (!productData || !landingState.proposedStructure) return;
    
    setIsDesigning(true); // Re-using designing flag for loading state
    setError(null);
    try {
      const response = await fetch('/api/v2/ads/concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productData, landingStructure: landingState.proposedStructure }),
      });

      const result = await response.json();
      if (result.success) {
        setLandingState(prev => ({ ...prev, adConcepts: result.data, phase: 'ads' }));
      } else {
        setError(result.error || 'Failed to generate ad concepts.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to ads specialist.');
    } finally {
      setIsDesigning(false);
    }
  };

  const setPhase = (phase: 'landing' | 'ads') => {
    setLandingState(prev => ({ ...prev, phase }));
  };

  const generateAdImage = async (
    conceptId: string, 
    visualPrompt: string, 
    aspectRatio: AspectRatio = '1:1', 
    adHook?: string, 
    adBody?: string, 
    adCta?: string,
    isCorrection: boolean = false,
    manualInstructions?: string,
    referenceUrl?: string
  ) => {
    if (!productData) return;

    setLandingState(prev => ({
      ...prev,
      adGenerations: {
        ...prev.adGenerations,
        [conceptId]: { imageUrl: '', status: 'pending', aspectRatio }
      }
    }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      const response = await fetch('/api/v2/ads/generate-image', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${authToken}` 
        },
        body: JSON.stringify({
          productData,
          conceptId,
          visualPrompt: manualInstructions || visualPrompt,
          adHook,
          adBody,
          adCta,
          referenceUrl,
          previousImageUrl: isCorrection ? landingState.adGenerations[conceptId]?.imageUrl || landingState.baseImageUrl : landingState.baseImageUrl,
          isCorrection,
          aspectRatio
        }),
      });

      const result = await response.json();
      if (result.success && result.data.generationId) {
        // Start Polling
        pollGenerationStatus(result.data.generationId, 'ad', conceptId, aspectRatio);
      } else {
        throw new Error(result.error || 'Failed to start ad generation');
      }
    } catch (err: any) {
      setLandingState(prev => ({
        ...prev,
        adGenerations: {
          ...prev.adGenerations,
          [conceptId]: { ...prev.adGenerations[conceptId], status: 'failed' }
        }
      }));
      setError(err.message || 'Error generating ad image.');
    }
  };

  const resetDiscovery = () => {
    setProductData(null);
    setCreativePaths(null);
    setLandingState({ 
      phase: 'landing', 
      proposedStructure: null, 
      selectedSectionId: null, 
      selectedReferenceUrl: null, 
      generations: {},
      adGenerations: {},
      adConcepts: [] 
    });
    setError(null);
  };

  return {
    productData,
    creativePaths,
    landingState,
    isDiscovering,
    isRecommending,
    isDesigning,
    error,
    success,
    discover,
    getCreativeRecommendations,
    generateLandingProposal,
    selectSection,
    selectReference,
    updateSectionInstructions,
    generateSection,
    generateAdImage,
    getAdConcepts,
    setPhase,
    resetDiscovery,
    setProductData,
    setError,
    setSuccess
  };
}
