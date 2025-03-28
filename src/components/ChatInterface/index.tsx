'use client';

import MessageList from '../MessageList/MessageList';
import AgentSelector from '../AgentSelector';
import { ChatForm } from './ChatForm';
import { AGENTS } from './constants';
import { useChatLogic } from './hooks/useChatLogic';
import { ChatInterfaceProps } from './types';

export default function ChatInterface({ apiKey }: ChatInterfaceProps) {
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
  } = useChatLogic(apiKey);

  return (
    <div className="flex flex-col h-[90vh] bg-gray-800 rounded-xl shadow-xl">
      <AgentSelector
        agents={AGENTS}
        onSelect={(agent) => {
          setSelectedAgentId(agent.id);
        }}
      />

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
