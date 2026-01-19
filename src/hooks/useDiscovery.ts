import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CreativePath, ProductData, LandingLayoutProposal, LandingGenerationState } from '../types/image-pro';

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
    proposedStructure: null,
    selectedSectionId: null,
    selectedReferenceUrl: null,
    generations: {}
  });

  // Auto-clear success after 4 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const discover = async (input: { url?: string; imageBase64?: string }) => {
    setIsDiscovering(true);
    setCreativePaths(null);
    setLandingState({ 
      proposedStructure: null, 
      selectedSectionId: null, 
      selectedReferenceUrl: null, 
      generations: {},
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

  const generateSection = async (sectionId: string, sectionTitle: string, isCorrection: boolean = false, manualInstructions?: string) => {
    console.log('[useDiscovery] generateSection CALLED:', { sectionId, sectionTitle, isCorrection, manualInstructions });
    
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
        [sectionId]: { copy: { headline: '', body: '' }, imageUrl: '', status: 'pending' }
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
          continuityImage: continuityImageUrl // Style Reference
        }),
      });

      const result = await response.json();

      if (result.success) {
        setLandingState(prev => ({
          ...prev,
          generations: {
            ...prev.generations,
            [sectionId]: { 
              status: 'completed', 
              imageUrl: result.data.imageUrl, 
              copy: result.data.copy 
            }
          }
        }));
        
        if (isCorrection) {
          updateSectionInstructions(sectionId, '');
        }
      } else {
        const errorMsg = result.error || 'Error al generar la sección';
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

  const resetDiscovery = () => {
    setProductData(null);
    setCreativePaths(null);
    setLandingState({ proposedStructure: null, selectedSectionId: null, selectedReferenceUrl: null, generations: {} });
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
    resetDiscovery,
    setProductData,
    setError,
    setSuccess
  };
}
