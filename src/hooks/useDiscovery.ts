import { useState } from 'react';
import { CreativePath, ProductData } from '../types/image-pro';

export function useDiscovery() {
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [creativePaths, setCreativePaths] = useState<CreativePath[] | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discover = async (input: { url?: string; imageBase64?: string }) => {
    setIsDiscovering(true);
    setCreativePaths(null);
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

  const resetDiscovery = () => {
    setProductData(null);
    setCreativePaths(null);
    setError(null);
  };

  return {
    productData,
    creativePaths,
    isDiscovering,
    isRecommending,
    error,
    discover,
    getCreativeRecommendations,
    resetDiscovery
  };
}
