import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';

const GROQ_API_KEY_STORAGE_KEY = 'groq_api_key';
const OPENAI_API_KEY_STORAGE_KEY = 'openai_api_key';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [openaiApiKey, setOpenaiApiKey] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const { setApiKey: setContextApiKey, setOpenaiApiKey: setContextOpenaiApiKey } = useAppContext();

  useEffect(() => {
    // Cargar API key de Groq
    const storedApiKey = localStorage.getItem(GROQ_API_KEY_STORAGE_KEY);
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setContextApiKey(storedApiKey);
    } else {
      setIsApiKeyModalOpen(true);
    }

    // Cargar API key de OpenAI
    const storedOpenaiApiKey = localStorage.getItem(OPENAI_API_KEY_STORAGE_KEY);
    if (storedOpenaiApiKey) {
      setOpenaiApiKey(storedOpenaiApiKey);
      if (setContextOpenaiApiKey) {
        setContextOpenaiApiKey(storedOpenaiApiKey);
      }
    }
  }, []);

  const saveApiKey = (key: string) => {
    localStorage.setItem(GROQ_API_KEY_STORAGE_KEY, key);
    setApiKey(key);
    setContextApiKey(key);
    setIsApiKeyModalOpen(false);
  };

  const clearApiKey = () => {
    localStorage.removeItem(GROQ_API_KEY_STORAGE_KEY);
    setApiKey(null);
    setContextApiKey('');
    setIsApiKeyModalOpen(true);
  };

  const saveOpenaiApiKey = (key: string) => {
    localStorage.setItem(OPENAI_API_KEY_STORAGE_KEY, key);
    setOpenaiApiKey(key);
    if (setContextOpenaiApiKey) {
      setContextOpenaiApiKey(key);
    }
  };

  const clearOpenaiApiKey = () => {
    localStorage.removeItem(OPENAI_API_KEY_STORAGE_KEY);
    setOpenaiApiKey(null);
    if (setContextOpenaiApiKey) {
      setContextOpenaiApiKey('');
    }
  };

  return {
    apiKey,
    openaiApiKey,
    isApiKeyModalOpen,
    saveApiKey,
    clearApiKey,
    saveOpenaiApiKey,
    clearOpenaiApiKey,
  };
};
