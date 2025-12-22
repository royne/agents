'use client';

import MessageList from '../MessageList/MessageList';
import AgentSelector from '../AgentSelector';
import { ChatForm } from './ChatForm';
import { AGENTS } from './constants';
import { useChatLogic } from './hooks/useChatLogic';
import { chatHistoryService } from '../../services/storage/chatHistory';
import { useAppContext } from '../../contexts/AppContext';
import { useApiKey } from '../../hooks/useApiKey';
import { ApiKeyModal } from '../ApiKeyModal';

export default function ChatInterface() {
  const { apiKey, openaiApiKey } = useAppContext();
  const { isApiKeyModalOpen, modalProvider, openApiKeyModal, closeApiKeyModal, saveApiKey, saveOpenaiApiKey } = useApiKey();
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
  } = useChatLogic(apiKey || '', openaiApiKey || undefined);

  const handleSubmitGuard = (e?: React.FormEvent) => {
    if (!apiKey) {
      openApiKeyModal('groq');
      return;
    }
    handleSubmit(e);
  };

  const handleSaveChat = () => {
    if (messages.length > 0) {
      chatHistoryService.saveChatSession(selectedAgentId, messages);
      alert('Chat guardado exitosamente');
    }
  };

  return (
    <div className="flex flex-col h-[90vh] bg-theme-component rounded-xl shadow-xl">
      <div className="bg-theme-component-hover rounded-t-xl">
        <AgentSelector
          agents={AGENTS}
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
