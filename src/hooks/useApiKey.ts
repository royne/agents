import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';

export const useApiKey = () => {
  const { apiKey: ctxGroqKey, openaiApiKey: ctxOpenaiKey, setApiKey: setContextApiKey, setOpenaiApiKey: setContextOpenaiApiKey, authData } = useAppContext();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [openaiApiKey, setOpenaiApiKey] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalProvider, setModalProvider] = useState<'groq' | 'openai' | null>(null);

  useEffect(() => {
    if (!authData?.isAuthenticated) return;
    setApiKey(ctxGroqKey || null);
    setOpenaiApiKey(ctxOpenaiKey || null);
    // Importante: NO abrir modal automáticamente; se abrirá bajo demanda al usar Chat/RAG
  }, [authData?.isAuthenticated, ctxGroqKey, ctxOpenaiKey]);

  const openApiKeyModal = (provider: 'groq' | 'openai') => {
    setModalProvider(provider);
    setIsApiKeyModalOpen(true);
    setError(null);
  };

  const closeApiKeyModal = () => {
    setIsApiKeyModalOpen(false);
    setModalProvider(null);
  };

  const saveApiKey = async (key: string) => {
    setLoading(true);
    try {
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');
      const { error } = await supabase
        .from('profiles')
        .update({ groq_api_key: key })
        .eq('user_id', session.user.id);
      if (error) throw error;
      setApiKey(key);
      setContextApiKey(key);
      closeApiKeyModal();
    } finally {
      setLoading(false);
    }
  };

  const clearApiKey = async () => {
    setLoading(true);
    try {
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');
      const { error } = await supabase
        .from('profiles')
        .update({ groq_api_key: null })
        .eq('user_id', session.user.id);
      if (error) throw error;
      setApiKey(null);
      setContextApiKey('');
      // No abrir modal automáticamente
    } finally {
      setLoading(false);
    }
  };

  const saveOpenaiApiKey = async (key: string) => {
    setLoading(true);
    try {
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');
      const { error } = await supabase
        .from('profiles')
        .update({ openai_api_key: key })
        .eq('user_id', session.user.id);
      if (error) throw error;
      setOpenaiApiKey(key);
      if (setContextOpenaiApiKey) setContextOpenaiApiKey(key);
      closeApiKeyModal();
    } finally {
      setLoading(false);
    }
  };

  const clearOpenaiApiKey = async () => {
    setLoading(true);
    try {
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');
      const { error } = await supabase
        .from('profiles')
        .update({ openai_api_key: null })
        .eq('user_id', session.user.id);
      if (error) throw error;
      setOpenaiApiKey(null);
      if (setContextOpenaiApiKey) setContextOpenaiApiKey('');
    } finally {
      setLoading(false);
    }
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
    loading,
    error,
  };
};
