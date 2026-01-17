import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaMagic, FaImage, FaRobot, FaUser } from 'react-icons/fa';
import { ProductData, CreativePath, LandingGenerationState } from '../../../types/image-pro';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatOrchestratorProps {
  onDiscover: (input: { url?: string; imageBase64?: string }) => void;
  isDiscovering: boolean;
  onReset: () => void;
  productData: ProductData | null;
  setProductData: (data: ProductData | null) => void;
  creativePaths: CreativePath[] | null;
  landingState?: LandingGenerationState | null;
}

const ChatOrchestrator: React.FC<ChatOrchestratorProps> = ({
  onDiscover,
  isDiscovering,
  onReset,
  productData,
  setProductData,
  creativePaths,
  landingState
}) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy tu Estratega de Marketing de DropApp. ¿Qué producto vamos a lanzar hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim() || isDiscovering || isThinking) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');

    // URL detection as a shortcut
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const foundUrl = currentInput.match(urlRegex)?.[0];

    if (foundUrl) {
      setMessages(prev => [...prev, { role: 'assistant', content: `He detectado una URL. Analizando producto...` }]);
      onDiscover({ url: foundUrl });
      return;
    }

    setIsThinking(true);
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
        let aiContent = result.data as string;

        // Parse tags like [UPDATE_DNA]
        const updateMatch = aiContent.match(/\[UPDATE_DNA\]\s*(\{[\s\S]*\})/);
        if (updateMatch) {
          try {
            const newData = JSON.parse(updateMatch[1]);
            setProductData(newData);
            aiContent = aiContent.replace(updateMatch[0], '').trim();
          } catch (e) {
            console.error('Failed to parse DNA update:', e);
          }
        }

        setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Parece que tengo un problema de conexión. ¿Podemos reintentar?' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error crítico de comunicación. Revisa tu conexión.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setMessages(prev => [...prev, { role: 'user', content: 'He subido una imagen del producto.' }]);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Analizando imagen para extraer estrategia...' }]);
      onDiscover({ imageBase64: base64 });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0C10]">
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-color/10 flex items-center justify-center">
            <FaRobot className="text-primary-color" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Estratega DropApp</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">En línea</span>
            </div>
          </div>
        </div>
        <button onClick={onReset} className="p-2 text-gray-500 hover:text-rose-400 transition-colors">
          <FaMagic className="rotate-180" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${m.role === 'user'
                ? 'bg-primary-color text-black font-bold rounded-tr-none'
                : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none'
              }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-primary-color rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-primary-color rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-primary-color rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-[10px] text-primary-color font-black uppercase tracking-widest">Pensando...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-5 border-t border-white/5 bg-white/[0.02]">
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Escribe tu mensaje o pega una URL..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pr-12 text-xs text-white placeholder:text-gray-600 outline-none focus:border-primary-color/50 transition-all resize-none min-h-[60px]"
            disabled={isThinking || isDiscovering}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-white transition-colors"
              disabled={isThinking || isDiscovering}
            >
              <FaImage />
            </button>
            <button
              onClick={handleSend}
              className="p-2 bg-primary-color text-black rounded-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              disabled={isThinking || isDiscovering || !input.trim()}
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
