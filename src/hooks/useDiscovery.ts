import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ProductData, CreativePath, LandingGenerationState, AspectRatio } from '../types/image-pro';
import { useAppContext } from '../contexts/AppContext';

export function useDiscovery() {
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [creativePaths, setCreativePaths] = useState<CreativePath[] | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [isDesigning, setIsDesigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { syncUserData } = useAppContext();

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

  /**
   * AUTOPILOT ORCHESTRATOR (Reactive)
   * This effect watches the state and triggers the next queue item only when
   * nothing is pending, ensuring strictly sequential execution.
   */
  useEffect(() => {
    if (!landingState.isAutoMode || !landingState.autoModeQueue) return;

    // Check if anything is currently pending
    const isAnyPending = Object.values(landingState.generations).some(g => g.status === 'pending') ||
                         Object.values(landingState.adGenerations).some(g => g.status === 'pending');
    
    if (isAnyPending) return; // Wait for the current task to finish

    // If we have items in the queue, trigger next
    if (landingState.autoModeQueue.length > 0) {
      console.log('[Autopilot] Orchestrator: Ready for next task. Queue size:', landingState.autoModeQueue.length);
      const timer = setTimeout(() => {
        processAutoQueue(landingState);
      }, 1000); // Small cooldown for stability
      return () => clearTimeout(timer);
    } 
    
    // If queue is empty, turn off auto mode
    if (landingState.autoModeQueue.length === 0) {
      console.log('[Autopilot] Orchestrator: Queue finished.');
      setLandingState(prev => ({ ...prev, isAutoMode: false }));
    }
  }, [landingState.isAutoMode, landingState.autoModeQueue, landingState.generations, landingState.adGenerations]);

  // Polling helper
  const pollGenerationStatus = async (generationId: string, type: 'landing' | 'ad', id: string, aspectRatio: AspectRatio) => {
    console.log(`[useDiscovery] Starting polling for ${type}:`, id, 'generationId:', generationId);
    
    let attempts = 0;
    const maxAttempts = 7; // Total 70 seconds
    const interval = 10000; // 10 seconds

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
                  status: 'completed' as const, 
                  imageUrl: result.imageUrl, 
                  copy: result.metadata?.copy || { headline: '', body: '' },
                  aspectRatio
                }
              }
            }));
            // Clear instructions only on success
            updateSectionInstructions(id, '');
            // Sync credits reactively
            syncUserData();
          } else {
            setLandingState(prev => ({
              ...prev,
              adGenerations: {
                ...prev.adGenerations,
                [id]: { imageUrl: result.imageUrl, status: 'completed' as const, aspectRatio }
              }
            }));
            // Sync credits reactively
            syncUserData();
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
      // Small initial delay before first check
      await new Promise(r => setTimeout(r, 10000));
      
      while (attempts < maxAttempts) {
        attempts++;
        const isDone = await check();
        if (isDone) return;
        if (attempts < maxAttempts) await new Promise(r => setTimeout(r, interval));
      }
      
      console.error(`[useDiscovery] Polling TIMEOUT (60s limit) for ${type}:`, id);
      setError('La generación está tardando más de lo esperado. Por favor reintenta en unos momentos.');
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
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      const response = await fetch('/api/v2/discovery', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(input),
      });

      const result = await response.json();

      if (result.success) {
        setProductData(result.data);
        // Sync credits after project initialization
        syncUserData();
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

  const generateSection = async (sectionId: string, sectionTitle: string, isCorrection: boolean = false, manualInstructions?: string, aspectRatio: AspectRatio = '9:16', referenceUrl?: string) => {
    console.log('[useDiscovery] generateSection CALLED:', { sectionId, sectionTitle, isCorrection, manualInstructions, aspectRatio, referenceUrl });
    
    if (!productData || !landingState.proposedStructure) {
      console.warn('[useDiscovery] generateSection ABORTED: Missing productData or proposedStructure', { productData: !!productData, structure: !!landingState.proposedStructure });
      return;
    }

    if (!landingState.selectedReferenceUrl && !isCorrection && !referenceUrl) {
      console.warn('[useDiscovery] generateSection ABORTED: Missing selectedReferenceUrl (and not a correction or manual ref)');
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
      if (!creativePath) {
        console.error('[useDiscovery] generateSection ERROR: No creative path available');
        throw new Error('No creative path selected');
      }

      // IDENTITY: Always use the original product photo
      const identityImageUrl = landingState.baseImageUrl;
      
      // CONTINUITY: Use the structurally preceding generated section for style consistency
      let continuityImageUrl = identityImageUrl;
      if (landingState.proposedStructure) {
        const sections = landingState.proposedStructure.sections;
        const currentIndex = sections.findIndex(s => s.sectionId === sectionId);
        // Look backwards from currentIndex in the structure
        for (let i = currentIndex - 1; i >= 0; i--) {
          const prevSectionId = sections[i].sectionId;
          const prevGen = landingState.generations[prevSectionId];
          if (prevGen?.status === 'completed' && prevGen.imageUrl) {
            continuityImageUrl = prevGen.imageUrl;
            console.log('[useDiscovery] Continuity reference found in previous structural section:', prevSectionId);
            break;
          }
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      // REFERENCE: If it's a correction, use the CURRENT image as structural reference.
      // If it's a new generation, use the selected reference URL from the catalog.
      const currentGeneration = landingState.generations[sectionId];
      const effectiveReferenceUrl = referenceUrl 
        ? referenceUrl 
        : (isCorrection && currentGeneration?.imageUrl) 
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

    console.log('[useDiscovery] generateAdImage CALLED:', {
      conceptId,
      hasReference: !!referenceUrl,
      referenceUrl,
      isCorrection,
      aspectRatio
    });

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

  /**
   * AUTOPILOT ORCHESTRATOR (Independent Extension)
   */
  const processAutoQueue = async (currentState: LandingGenerationState) => {
    const { autoModeQueue, phase, isAutoMode } = currentState;
    console.log('[Autopilot] Processing queue:', { isAutoMode, queueLength: autoModeQueue?.length, next: autoModeQueue?.[0] });
    
    if (!isAutoMode || !autoModeQueue || autoModeQueue.length === 0) {
      console.log('[Autopilot] Queue empty or disabled. Stopping.');
      setLandingState(prev => ({ ...prev, isAutoMode: false }));
      return;
    }

    const nextId = autoModeQueue[0];
    const remainingQueue = autoModeQueue.slice(1);

    // Set pending status IMMEDIATELY for UI feedback
    setLandingState(prev => ({ 
      ...prev, 
      autoModeQueue: remainingQueue,
      [phase === 'landing' ? 'generations' : 'adGenerations']: {
        ...prev[phase === 'landing' ? 'generations' : 'adGenerations'],
        [nextId]: { 
          status: 'pending', 
          imageUrl: '', 
          copy: { headline: 'Generando...', body: '' },
          aspectRatio: phase === 'landing' ? '9:16' : '1:1'
        }
      }
    }));

    if (phase === 'landing') {
      const section = currentState.proposedStructure?.sections.find(s => s.sectionId === nextId);
      if (section) {
        let referenceUrl = currentState.selectedReferenceUrl;
        
        if (!referenceUrl) {
          console.log('[Autopilot] No reference selected, fetching random one for section:', nextId);
          try {
            const res = await fetch(`/api/v2/landing/references?sectionId=${nextId}`);
            const data = await res.json();
            if (data.success && data.data?.length) {
              const randomIndex = Math.floor(Math.random() * data.data.length);
              referenceUrl = data.data[randomIndex].url; // FIX: Was .imageUrl
              console.log('[Autopilot] Smart Reference selected:', referenceUrl);
            }
          } catch (e) {
            console.error('[Autopilot] Error fetching smart reference:', e);
          }
        }

        console.log('[Autopilot] Triggering generation for section:', nextId);
        setTimeout(() => {
          generateSection(nextId, section.title, false, '', '9:16', referenceUrl || undefined);
        }, 500);
      } else {
        console.warn('[Autopilot] Section not found in structure:', nextId);
        // Skip if not found
        setTimeout(() => processAutoQueue({ ...currentState, autoModeQueue: remainingQueue }), 500);
      }
    } else {
      const concept = currentState.adConcepts?.find(c => c.id === nextId);
      if (concept) {
        console.log('[Autopilot] Triggering generation for ad:', nextId);
        setTimeout(() => {
          // In Autopilot mode for Ads, we generate "from scratch" (no referenceUrl)
          // as per user request to maximize variety.
          generateAdImage(concept.id, concept.visualPrompt, '1:1', concept.hook, concept.body, concept.adCta, false, '', undefined);
        }, 500);
      } else {
        console.warn('[Autopilot] Ad concept not found:', nextId);
        setTimeout(() => processAutoQueue({ ...currentState, autoModeQueue: remainingQueue }), 500);
      }
    }
  };

  const startAutoGeneration = async () => {
    console.log('[Autopilot] Starting Autopilot...');
    
    if (!landingState.proposedStructure && landingState.phase === 'landing') {
      console.error('[Autopilot] Cannot start: No proposed structure');
      return;
    }
    if (landingState.phase === 'ads' && !landingState.adConcepts?.length) {
      console.error('[Autopilot] Cannot start: No ad concepts');
      return;
    }

    setError(null);
    const queue = landingState.phase === 'landing'
      ? (landingState.proposedStructure?.sections
          .map(s => s.sectionId)
          .filter(id => landingState.generations[id]?.status !== 'completed') || [])
      : (landingState.adConcepts
          ?.map(c => c.id)
          .filter(id => landingState.adGenerations[id]?.status !== 'completed') || []);

    console.log('[Autopilot] Queue built:', queue);

    setLandingState({
      ...landingState,
      isAutoMode: true,
      autoModeQueue: queue
    });
    
    console.log('[Autopilot] Mode activated. Orchestrator useEffect will take over.');
  };

  const stopAutoGeneration = () => {
    console.log('[Autopilot] Stopping generation manually...');
    setLandingState(prev => ({
      ...prev,
      isAutoMode: false,
      autoModeQueue: []
    }));
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
    setSuccess,
    startAutoGeneration,
    stopAutoGeneration
  };
}
