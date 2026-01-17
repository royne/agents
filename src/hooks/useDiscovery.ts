import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { CreativePath, ProductData, LandingLayoutProposal, LandingGenerationState } from '../types/image-pro';

export function useDiscovery() {
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [creativePaths, setCreativePaths] = useState<CreativePath[] | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [isDesigning, setIsDesigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Landing Generation State
  const [landingState, setLandingState] = useState<LandingGenerationState>({
    proposedStructure: null,
    selectedSectionId: null,
    selectedReferenceUrl: null,
    generations: {}
  });

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
    setLandingState(prev => ({ ...prev, selectedSectionId: sectionId, selectedReferenceUrl: null }));
  };

  const selectReference = (url: string) => {
    setLandingState(prev => ({ ...prev, selectedReferenceUrl: url }));
  };

  const generateSection = async (sectionId: string, sectionTitle: string) => {
    if (!productData || !landingState.proposedStructure || !landingState.selectedReferenceUrl) return;

    // Set status to pending
    setLandingState(prev => ({
      ...prev,
      generations: {
        ...prev.generations,
        [sectionId]: { copy: { headline: '', body: '' }, imageUrl: '', status: 'pending' }
      }
    }));

    try {
      const creativePath = creativePaths?.[0]; // Defaulting to first for now, ideally pass selected
      if (!creativePath) throw new Error('No creative path selected');

      // Find previous image for continuity (Identity first, then history)
      let previousImageUrl = landingState.baseImageUrl;
      
      const previousImages = Object.values(landingState.generations)
        .filter(g => g.status === 'completed' && g.imageUrl)
        .map(g => g.imageUrl);
      
      if (previousImages.length > 0) {
        previousImageUrl = previousImages[previousImages.length - 1];
      }

      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;

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
          referenceUrl: landingState.selectedReferenceUrl,
          previousImageUrl: landingState.baseImageUrl, // Identity
          continuityImage: previousImageUrl // Last generated section for style consistency
        }),
      });

      const result = await response.json();

      if (result.success) {
        setLandingState(prev => ({
          ...prev,
          generations: {
            ...prev.generations,
            [sectionId]: { 
              copy: result.data.copy, 
              imageUrl: result.data.imageUrl, 
              status: 'completed' 
            }
          }
        }));
      } else {
        setLandingState(prev => ({
          ...prev,
          generations: {
            ...prev.generations,
            [sectionId]: { 
              copy: { headline: '', body: '' }, 
              imageUrl: '', 
              status: 'failed' 
            }
          }
        }));
        setError(result.error || 'Failed to generate section.');
      }
    } catch (err: any) {
      setLandingState(prev => ({
        ...prev,
        generations: {
          ...prev.generations,
          [sectionId]: { 
            copy: { headline: '', body: '' }, 
            imageUrl: '', 
            status: 'failed' 
          }
        }
      }));
      setError(err.message || 'Error connecting to generation service.');
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
    discover,
    getCreativeRecommendations,
    generateLandingProposal,
    selectSection,
    selectReference,
    generateSection,
    resetDiscovery,
    setProductData
  };
}
