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

  // Exportar chat como archivo de texto
  const handleExportChat = () => {
    if (messages.length === 0) return;
    chatExportService.exportChat(messages, 'txt', 'rag');
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
            <button 
              onClick={handleExportChat}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm rounded-lg transition-colors"
              title="Descargar como archivo de texto"
            >
              Exportar
            </button>
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
