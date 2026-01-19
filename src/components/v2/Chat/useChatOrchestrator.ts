import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { ProductData, CreativePath, LandingGenerationState } from '../../../types/image-pro';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseChatOrchestratorProps {
  onDiscover: (input: { url?: string; imageBase64?: string }) => void;
  productData: ProductData | null;
  setProductData: Dispatch<SetStateAction<ProductData | null>>;
  creativePaths: CreativePath[] | null;
  landingState?: LandingGenerationState | null;
  onUpdateSection?: (sectionId: string, extraInstructions: string) => void;
  setSuccess?: (msg: string | null) => void;
}

export function useChatOrchestrator({
  onDiscover,
  productData,
  setProductData,
  creativePaths,
  landingState,
  onUpdateSection,
  setSuccess
}: UseChatOrchestratorProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy tu Estratega de Marketing de DropApp. ¿Qué producto vamos a lanzar hoy?' }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const sendMessage = async (input: string) => {
    if (!input.trim() || isThinking) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);

    // URL detection shortcut
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const foundUrl = input.match(urlRegex)?.[0];

    if (foundUrl) {
      console.log('[useChatOrchestrator] URL detected, bypassing agent:', foundUrl);
      setMessages(prev => [...prev, { role: 'assistant', content: `He detectado una URL. Analizando producto...` }]);
      onDiscover({ url: foundUrl });
      return;
    }

    setIsThinking(true);
    console.log('[useChatOrchestrator] Sending to agent. Messages:', [...messages, userMessage].length, 'ProductData detected:', !!productData);
    
    try {
      const response = await fetch('/api/v2/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          productData,
          creativePaths,
          landingState
        }),
      });

      const result = await response.json();
      if (result.success) {
        const { text, protocol } = result.data;

        if (protocol) {
          console.log('[useChatOrchestrator] Protocol received:', protocol.action, protocol.data);
          if (protocol.action === 'UPDATE_DNA') {
            console.log('[useChatOrchestrator] Updating DNA with:', protocol.data);
            setProductData(prev => ({ ...prev, ...protocol.data } as ProductData));
            setSuccess?.('ADN de producto actualizado con éxito.');
          } else if (protocol.action === 'UPDATE_SECTION') {
            console.log('[useChatOrchestrator] Updating Section Instruction:', protocol.data.sectionId);
            onUpdateSection?.(protocol.data.sectionId, protocol.data.extraInstructions);
          } else if (protocol.action === 'REGENERATE_STRUCTURE') {
            console.log('[useChatOrchestrator] Regenerating whole structure...');
            if (landingState?.baseImageUrl) {
              onDiscover({ url: landingState.baseImageUrl });
              setSuccess?.('Re-formulando estrategia y estructura...');
            }
          }
        } else {
          console.warn('[useChatOrchestrator] No protocol found in agent response.');
        }

        setMessages(prev => [...prev, { role: 'assistant', content: text }]);
      } else {
        console.error('[useChatOrchestrator] API Error:', result.error);
        setMessages(prev => [...prev, { role: 'assistant', content: 'Parece que tengo un problema de conexión. ¿Podemos reintentar?' }]);
      }
    } catch (error) {
      console.error('[useChatOrchestrator] Critical Fetch Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error crítico de comunicación. Revisa tu conexión.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  const addAssistantMessage = (content: string) => {
    setMessages(prev => [...prev, { role: 'assistant', content }]);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, { role: 'user', content }]);
  };

  return {
    messages,
    isThinking,
    scrollRef,
    sendMessage,
    addAssistantMessage,
    addUserMessage
  };
}
