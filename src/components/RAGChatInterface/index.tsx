'use client';

import { useState, useEffect } from 'react';
import MessageList from '../MessageList/MessageList';
import { ChatForm } from '../ChatInterface/ChatForm';
import { chatHistoryService } from '../../services/storage/chatHistory';
import { useAppContext } from '../../contexts/AppContext';
import { chatExportService } from '../../services/export/chatExport';
import { Message } from '../ChatInterface/types';
import { useApiKey } from '../../hooks/useApiKey';
import { ApiKeyModal } from '../ApiKeyModal';

// Hook personalizado para el chat RAG
const useRAGChatLogic = (groqApiKey: string, openaiApiKey?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contextReduced, setContextReduced] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputText && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      image: selectedImage ? URL.createObjectURL(selectedImage) : undefined
    };

    // Añadir el mensaje del usuario inmediatamente a la UI
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
      
      const endpoint = `/api/agents/script`;
      console.log('[rag] Enviando mensaje', {
        endpoint,
        hasGroqKey: !!groqApiKey,
        hasOpenAIKey: !!openaiApiKey,
        messagesCount: apiMessages.length,
        estimatedTokens
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Api-Key': groqApiKey,
          'X-OpenAI-Key': openaiApiKey || ''
        },
        body: JSON.stringify({
          messages: apiMessages,
          agentId: 'script'
        })
      });

      const data = await response.json().catch(() => ({} as any));
      console.log('[rag] Respuesta del servidor', { status: response.status, ok: response.ok, data });
      if (!response.ok) {
        throw new Error((data && (data.error || data.message || data.detail)) || `HTTP ${response.status}`);
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
        : 'No obtuve una respuesta. Verifica que tu OpenAI API Key sea válida y que existan embeddings. Intenta nuevamente.';

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

  return {
    messages,
    inputText,
    selectedImage,
    isLoading,
    setInputText,
    setSelectedImage,
    handleSubmit
  };
};

export default function RAGChatInterface() {
  const { apiKey, openaiApiKey } = useAppContext();
  const { isApiKeyModalOpen, modalProvider, openApiKeyModal, closeApiKeyModal, saveApiKey, saveOpenaiApiKey } = useApiKey();
  const {
    messages,
    inputText,
    selectedImage,
    isLoading,
    setInputText,
    setSelectedImage,
    handleSubmit
  } = useRAGChatLogic(apiKey || '', openaiApiKey || undefined);

  const handleSubmitGuard = (e?: React.FormEvent) => {
    if (!apiKey) return openApiKeyModal('groq');
    if (!openaiApiKey) return openApiKeyModal('openai');
    handleSubmit(e);
  };

  const handleSaveChat = () => {
    if (messages.length > 0) {
      chatHistoryService.saveChatSession('script', messages);
      alert('Chat guardado exitosamente');
    }
  };

  // Exportar chat en diferentes formatos
  const handleExportChat = (format: 'json' | 'txt' | 'md') => {
    if (messages.length === 0) return;
    chatExportService.exportChat(messages, format, 'rag');
  };

  return (
    <div className="flex flex-col h-[90vh] bg-gray-800 rounded-xl shadow-xl">
      <div className="bg-gray-700 rounded-t-xl p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Chat con RAG</h2>
          <p className="text-gray-300 text-sm">Asistente potenciado con Retrieval Augmented Generation</p>
        </div>
        {messages.length > 0 && (
          <div className="flex space-x-2">
            <button 
              onClick={handleSaveChat}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm rounded-lg transition-colors"
              title="Guardar en la base de datos"
            >
              Guardar
            </button>
            <div className="relative group">
              <button 
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm rounded-lg transition-colors flex items-center"
                title="Exportar conversación"
              >
                Exportar
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg overflow-hidden z-10 hidden group-hover:block">
                <div className="py-1">
                  <button
                    onClick={() => handleExportChat('txt')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                  >
                    Texto plano (.txt)
                  </button>
                  <button
                    onClick={() => handleExportChat('md')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                  >
                    Markdown (.md)
                  </button>
                  <button
                    onClick={() => handleExportChat('json')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                  >
                    JSON (.json)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <MessageList messages={messages} />

      <ChatForm
        inputText={inputText}
        isLoading={isLoading}
        selectedImage={selectedImage}
        onInputChange={setInputText}
        onImageSelect={setSelectedImage}
        onSubmit={handleSubmitGuard}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        provider={(modalProvider as 'groq' | 'openai') || 'groq'}
        onSave={(key) => {
          if (modalProvider === 'openai') return saveOpenaiApiKey(key);
          return saveApiKey(key);
        }}
        onClose={closeApiKeyModal}
      />
    </div>
  );
}
