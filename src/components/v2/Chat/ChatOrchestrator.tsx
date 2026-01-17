import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaLink, FaImage, FaMagic, FaSync } from 'react-icons/fa';
import { CreativePath, ProductData } from '../../../types/image-pro';

interface ChatOrchestratorProps {
  onDiscover: (input: { url?: string; imageBase64?: string }) => Promise<void>;
  isDiscovering: boolean;
  onReset: () => void;
  productData: ProductData | null;
  setProductData: (data: ProductData) => void;
  creativePaths: CreativePath[] | null;
}

const ChatOrchestrator: React.FC<ChatOrchestratorProps> = ({
  onDiscover,
  isDiscovering,
  onReset,
  productData,
  setProductData,
  creativePaths
}) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim() || isDiscovering || isThinking) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');

    // URL Detection Logic
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const foundUrl = currentInput.match(urlRegex)?.[0];

    if (foundUrl) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Detecté una URL: ${foundUrl}. Analizando producto...` }]);
      await onDiscover({ url: foundUrl });
    } else {
      // General Chat Logic via API
      setIsThinking(true);
      try {
        const response = await fetch('/api/v2/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            productData,
            creativePaths
          }),
        });

        const result = await response.json();
        if (result.success) {
          let aiContent = result.data as string;

          // Check for [UPDATE_DNA] command
          const updateMatch = aiContent.match(/\[UPDATE_DNA\]\s*(\{[\s\S]*\})/);
          if (updateMatch) {
            try {
              const newData = JSON.parse(updateMatch[1]);
              setProductData(newData);
              // Remove the tag from visual content
              aiContent = aiContent.replace(updateMatch[0], '').trim();
            } catch (e) {
              console.error('Failed to parse DNA update:', e);
            }
          }

          setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, tuve un error al procesar tu mensaje.' }]);
        }
      } catch (error) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexión con el servidor.' }]);
      } finally {
        setIsThinking(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isDiscovering || isThinking) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setMessages(prev => [...prev, { role: 'user', content: 'He subido una imagen del producto.' }]);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Analizando imagen para extraer la estrategia...' }]);
      await onDiscover({ imageBase64: base64 });
    };
    reader.readAsDataURL(file);
  };

  const resetAll = () => {
    setMessages([]);
    onReset();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0D1117]/50 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
            <FaMagic className="text-primary-color" />
            Orchestrator <span className="text-primary-color">V2</span>
          </h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Invisible Engineering</p>
        </div>
        <button
          onClick={resetAll}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-gray-500 hover:text-rose-400 transition-all active:scale-95"
          title="Reiniciar Lanzamiento"
        >
          <FaMagic className="rotate-180 text-xs" />
        </button>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
              <FaMagic className="text-2xl text-primary-color/40" />
            </div>
            <div className="max-w-[200px]">
              <p className="text-sm font-bold text-white mb-1">Inicia tu Lanzamiento</p>
              <p className="text-[9px] uppercase tracking-widest text-gray-500 leading-tight">Pega una URL o sube una imagen de tu producto</p>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                  ? 'bg-primary-color text-black font-medium rounded-tr-none'
                  : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none'
                  }`}
              >
                {m.content}
              </div>
            </div>
          ))
        )}

        {(isDiscovering || isThinking) && (
          <div className="flex justify-start animate-in fade-in">
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-primary-color rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-primary-color rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-primary-color rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <p className="text-[10px] text-primary-color font-black uppercase tracking-widest">
                {isDiscovering ? 'Analizando ADN' : 'Orquestando Respuesta'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-[#0D1117] border-t border-white/5">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
        />
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="¿Qué quieres crear hoy? (Pega una URL o describe tu producto)"
            className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 pr-12 text-sm outline-none focus:border-primary-color/50 transition-all resize-none min-h-[80px] text-white custom-scrollbar"
            disabled={isDiscovering || isThinking}
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-white transition-colors"
              disabled={isDiscovering || isThinking}
              title="Subir Imagen"
            >
              <FaImage />
            </button>
            <button
              onClick={handleSend}
              className="p-2 bg-primary-color text-black rounded-lg hover:scale-105 transition-all disabled:opacity-50 disabled:grayscale"
              disabled={isDiscovering || isThinking || !input.trim()}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatOrchestrator;
