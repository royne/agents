import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';

const API_KEY_STORAGE_KEY = 'groq_api_key';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const { setApiKey: setContextApiKey } = useAppContext();

  useEffect(() => {
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    console.log('API Key:', storedApiKey);
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  const saveApiKey = (key: string) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    setApiKey(key);
    setContextApiKey(key);
    setIsApiKeyModalOpen(false);
  };

  const clearApiKey = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setApiKey(null);
    setIsApiKeyModalOpen(true);
  };

  return {
    apiKey,
    isApiKeyModalOpen,
    saveApiKey,
    clearApiKey,
  };
};
