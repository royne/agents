import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';

export const useApiKey = () => {
  const { authData } = useAppContext();
  const [apiKey, setApiKey] = useState<string | null>('CONFIGURED');
  const [openaiApiKey, setOpenaiApiKey] = useState<string | null>('CONFIGURED');
  const [googleAiKey, setGoogleAiKey] = useState<string | null>('CONFIGURED');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalProvider, setModalProvider] = useState<'groq' | 'openai' | 'google' | null>(null);

  useEffect(() => {
    if (!authData?.isAuthenticated) return;
    setApiKey('CONFIGURED');
    setOpenaiApiKey('CONFIGURED');
    setGoogleAiKey('CONFIGURED');
  }, [authData?.isAuthenticated]);

  const openApiKeyModal = (provider: 'groq' | 'openai' | 'google') => {
    // Ya no permitimos abrir el modal para editar llaves si están centralizadas
    console.log(`Las llaves de ${provider} están configuradas globalmente en el servidor.`);
    // setIsApiKeyModalOpen(true);
    // setModalProvider(provider);
    // setError(null);
  };

  const closeApiKeyModal = () => {
    setIsApiKeyModalOpen(false);
    setModalProvider(null);
  };

  const saveApiKey = async (key: string) => {
    setLoading(true);
    // Operación desactivada
    setLoading(false);
  };

  const clearApiKey = async () => {
    setLoading(true);
    // Operación desactivada
    setLoading(false);
  };

  const saveOpenaiApiKey = async (key: string) => {
    setLoading(true);
    // Operación desactivada
    setLoading(false);
  };

  const clearOpenaiApiKey = async () => {
    setLoading(true);
    // Operación desactivada
    setLoading(false);
  };

  const saveGoogleAiKey = async (key: string) => {
    setLoading(true);
    // Operación desactivada
    setLoading(false);
  };

  const clearGoogleAiKey = async () => {
    setLoading(true);
    // Operación desactivada
    setLoading(false);
  };

  return {
    apiKey,
    openaiApiKey,
    isApiKeyModalOpen,
    modalProvider,
    openApiKeyModal,
    closeApiKeyModal,
    saveApiKey,
    clearApiKey,
    saveOpenaiApiKey,
    clearOpenaiApiKey,
    googleAiKey,
    saveGoogleAiKey,
    clearGoogleAiKey,
    loading,
    error,
  };
};
