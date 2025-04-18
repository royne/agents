'use client';

import MessageList from '../MessageList/MessageList';
import AgentSelector from '../AgentSelector';
import { ChatForm } from '../ChatInterface/ChatForm';
import { NON_RAG_AGENTS } from './constants';
import { useChatLogic } from '../ChatInterface/hooks/useChatLogic';
import { chatHistoryService } from '../../services/storage/chatHistory';
import { useAppContext } from '../../contexts/AppContext';

export default function AgentInterface() {
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

  const handleSaveChat = () => {
    if (messages.length > 0) {
      chatHistoryService.saveChatSession(selectedAgentId, messages);
      alert('Chat guardado exitosamente');
    }
  };

  return (
    <div className="flex flex-col h-[90vh] bg-gray-800 rounded-xl shadow-xl">
      <div className="bg-gray-700 rounded-t-xl">
        <AgentSelector
          agents={NON_RAG_AGENTS}
          onSelect={(agent) => {
            setSelectedAgentId(agent.id);
          }}
          onSaveChat={handleSaveChat}
          hasMessages={messages.length > 0}
          messages={messages}
          selectedAgentId={selectedAgentId}
        />
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
