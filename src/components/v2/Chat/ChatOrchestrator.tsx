import React from 'react';
import { ProductData, CreativePath, LandingGenerationState } from '../../../types/image-pro';
import { useChatOrchestrator } from './useChatOrchestrator';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

interface ChatOrchestratorProps {
  onDiscover: (input: { url?: string; imageBase64?: string }) => void;
  isDiscovering: boolean;
  onReset: () => void;
  productData: ProductData | null;
  setProductData: React.Dispatch<React.SetStateAction<ProductData | null>>;
  creativePaths: CreativePath[] | null;
  landingState?: LandingGenerationState | null;
  onUpdateSection?: (sectionId: string, extraInstructions: string) => void;
  setSuccess?: (msg: string | null) => void;
  setError?: (msg: string | null) => void;
}

const ChatOrchestrator: React.FC<ChatOrchestratorProps> = ({
  onDiscover,
  isDiscovering,
  onReset,
  productData,
  setProductData,
  creativePaths,
  landingState,
  onUpdateSection,
  setSuccess,
  setError
}) => {
  const {
    messages,
    isThinking,
    scrollRef,
    sendMessage,
    addUserMessage,
    addAssistantMessage
  } = useChatOrchestrator({
    onDiscover,
    productData,
    setProductData,
    creativePaths,
    landingState,
    onUpdateSection,
    setSuccess
  });

  return (
    <div id="tour-v2-chat" className="flex flex-col h-full bg-[#0A0C10] shadow-2xl relative">
      <ChatHeader onReset={onReset} />

      <ChatMessages
        messages={messages}
        isThinking={isThinking}
        scrollRef={scrollRef}
      />

      <ChatInput
        onSend={sendMessage}
        onUpload={onDiscover}
        disabled={isThinking || isDiscovering}
        onAddUserMessage={addUserMessage}
        onAddAssistantMessage={addAssistantMessage}
        onError={setError}
      />
    </div>
  );
};

export default ChatOrchestrator;
