import { useState } from 'react';
import { Message } from '../types';
import { chatHistoryService } from '../../../services/storage/chatHistory';
import { useAppContext } from '../../../contexts/AppContext';

export const useChatLogic = (apiKey: string, openaiApiKey?: string) => {
  const { authData } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState('research');
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contextReduced, setContextReduced] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText && !selectedImage || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      image: selectedImage ? URL.createObjectURL(selectedImage) : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      // Convertir mensajes a formato API
      const apiMessages = chatHistoryService.convertToApiMessages([...messages, userMessage]);
      
      // Estimar tokens antes de enviar
      const estimatedTokens = chatHistoryService.estimateMessagesTokens(apiMessages);
      const willReduceContext = estimatedTokens > 8000; // Mismo valor que MAX_CONTEXT_TOKENS
      const endpoint = `/api/agents/${selectedAgentId}`;
      console.log('[chat] Enviando mensaje', {
        selectedAgentId,
        endpoint,
        hasApiKey: !!apiKey,
        messagesCount: apiMessages.length,
        estimatedTokens
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: apiMessages,
          agentId: selectedAgentId,
          company_id: authData?.company_id
        })
      });

      const data = await response.json().catch(() => ({}));
      console.log('[chat] Respuesta del servidor', { status: response.status, ok: response.ok, data });
      if (!response.ok) {
        throw new Error((data && (data.error || data.message)) || `HTTP ${response.status}`);
      }

      // Si se detectó que se reducirá el contexto, mostrar un mensaje al usuario
      if (willReduceContext && !contextReduced) {
        const systemMessage: Message = {
          id: Date.now().toString(),
          text: "⚠️ La conversación se está volviendo muy larga. Se han eliminado algunos mensajes antiguos para mantener el rendimiento. La IA podría perder parte del contexto anterior.",
          isUser: false,
          timestamp: new Date(),
          isSystemMessage: true
        };
        
        setMessages(prev => [...prev, systemMessage]);
        setContextReduced(true);
      }

      const aiText = typeof data.response === 'string' && data.response.trim().length > 0
        ? data.response
        : 'No obtuve una respuesta del modelo. Intenta nuevamente o cambia de modelo en la configuración.';

      const aiMessage: Message = {
        id: Date.now().toString(),
        text: aiText,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      
      // Mensaje de error para el usuario
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Ha ocurrido un error al procesar tu mensaje. Por favor, intenta de nuevo.",
        isUser: false,
        timestamp: new Date(),
        isSystemMessage: true,
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Resetear el estado de reducción de contexto cuando se cambia de agente
  const handleAgentChange = (agentId: string) => {
    setSelectedAgentId(agentId);
    setMessages([]);
    setContextReduced(false);
  };

  return {
    messages,
    selectedAgentId,
    inputText,
    selectedImage,
    isLoading,
    contextReduced,
    setSelectedAgentId: handleAgentChange,
    setInputText,
    setSelectedImage,
    handleSubmit
  };
};
