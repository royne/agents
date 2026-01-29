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
    { role: 'assistant', content: '¡Hola! Soy tu Estratega de Marketing de DropApp. Para comenzar, por favor sube una imagen del producto que vamos a lanzar.' }
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

    // PHASE 2 SHORT-CIRCUIT: If structure exists, do NOT use AI.
    if (landingState?.proposedStructure) {
      console.log('[useChatOrchestrator] Structure detected, skipping AI call for phase 2.');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '¡Entendido! Para realizar cambios específicos en el diseño, imágenes o textos de las secciones, por favor utiliza el botón **"Editar esta imagen"** directamente en la sección correspondiente del Canvas. Desde mi rol estratégico ya he definido la estructura optimizada para conversión.' 
      }]);
      return;
    }

    setIsThinking(true);
    console.log('[useChatOrchestrator] Sending to agent. Messages:', [...messages, userMessage].length, 'ProductData detected:', !!productData);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // Sincronizado con Vercel (25s)

      // 1. DATA DIET & ISOLATION: Enviamos solo los campos de TEXTO del ADN.
      // Así evitamos fugar Base64 pesados que causan timeouts.
      const cleanDNA = productData ? {
        name: productData.name,
        angle: productData.angle,
        buyer: productData.buyer,
        details: productData.details
      } : null;

      // 2. LEAN STATE: Quitamos imágenes del estado de landing si existe.
      const leanLandingState = landingState ? {
        ...landingState,
        baseImageUrl: undefined,
        generations: {}, // No las necesitamos para el refinamiento estratégico
        adGenerations: {}
      } : null;

      const response = await fetch('/api/v2/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          productData: cleanDNA,
          creativePaths: [], // No los enviamos para ahorrar payload
          landingState: leanLandingState
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const result = await response.json();
      
      if (result.success) {
        const { text, delta, protocol } = result.data;

        // 3. ACTUALIZACIÓN POR DELTA (Modular):
        // Si el agente devuelve un delta (cambios), los aplicamos quirúrgicamente.
        if (delta) {
          console.log('[useChatOrchestrator] Delta received:', delta);
          setProductData(prev => {
            if (!prev) return prev;
            const updated = { ...prev };
            if (delta.name?.updated) updated.name = delta.name.value;
            if (delta.angle?.updated) updated.angle = delta.angle.value;
            if (delta.buyer?.updated) updated.buyer = delta.buyer.value;
            if (delta.details?.updated) updated.details = delta.details.value;
            return updated;
          });
          setSuccess?.('Estrategia actualizada correctamente.');
        }

        // Mantener compatibilidad con protocolos antiguos por si acaso
        if (protocol && !delta) {
          if (protocol.action === 'UPDATE_DNA') {
            setProductData(prev => ({ ...prev, ...protocol.data } as ProductData));
          } else if (protocol.action === 'UPDATE_SECTION') {
            onUpdateSection?.(protocol.data.sectionId, protocol.data.extraInstructions);
          }
        }

        setMessages(prev => [...prev, { role: 'assistant', content: text }]);
      } else {
        throw new Error(result.error || 'API Error');
      }
    } catch (error: any) {
      console.error('[useChatOrchestrator] Critical Error:', error.message);
      
      // 4. MECANISMO DE ROLLBACK:
      // Si falla, eliminamos el último mensaje del usuario para evitar el "Death Loop" de Gemini.
      setMessages(prev => prev.slice(0, -1));
      
      const errorMsg = error.name === 'AbortError' 
        ? 'El servidor tardó demasiado en responder. He limpiado el historial para que puedas reintentar con una instrucción más corta.' 
        : 'Error de comunicación. El historial se ha restaurado para evitar bloqueos.';
      
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
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
