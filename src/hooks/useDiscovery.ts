import { useState } from 'react';
import { ProductData } from '../types/image-pro';

export function useDiscovery() {
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discover = async (input: { url?: string; imageBase64?: string }) => {
    setIsDiscovering(true);
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

  const resetDiscovery = () => {
    setProductData(null);
    setError(null);
  };

  return {
    productData,
    isDiscovering,
    error,
    discover,
    resetDiscovery
  };
}
