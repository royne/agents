'use client';

import MessageList from '../MessageList/MessageList';
import { ChatForm } from '../ChatInterface/ChatForm';
import { useChatLogic } from '../ChatInterface/hooks/useChatLogic';
import { chatHistoryService } from '../../services/storage/chatHistory';
import { useAppContext } from '../../contexts/AppContext';
import { useEffect } from 'react';
import { chatExportService } from '../../services/export/chatExport';

export default function RAGChatInterface() {
  const { apiKey } = useAppContext();
  const {
    messages,
    selectedAgentId,
    inputText,
    selectedImage,
    isLoading,
    setSelectedAgentId,
    setInputText,
    setSelectedImage,
    handleSubmit
  } = useChatLogic(apiKey || '');

  // Forzar el uso del agente 'script' (RAG) al montar el componente
  useEffect(() => {
    setSelectedAgentId('script');
  }, [setSelectedAgentId]);

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
        onSubmit={handleSubmit}
      />
    </div>
  );
}
