import React, { useState } from 'react';
import { FaPaperPlane, FaLink, FaImage, FaMagic } from 'react-icons/fa';

interface ChatOrchestratorProps {
  onDiscover: (input: { url?: string; imageBase64?: string }) => Promise<void>;
  isDiscovering: boolean;
  onReset: () => void;
}

const ChatOrchestrator: React.FC<ChatOrchestratorProps> = ({ onDiscover, isDiscovering, onReset }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!input.trim() || isDiscovering) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // URL Detection Logic
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const foundUrl = input.match(urlRegex)?.[0];

    if (foundUrl) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Detecté una URL: ${foundUrl}. Analizando producto...` }]);
      await onDiscover({ url: foundUrl });
    } else {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Entendido. Estoy listo para ayudarte a crear lo que necesites.' }]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isDiscovering) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setMessages(prev => [...prev, { role: 'user', content: 'He subido una imagen del producto.' }]);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Analizando imagen para extraer la estrategia...' }]);
      await onDiscover({ imageBase64: base64 });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
            <FaMagic className="text-primary-color" />
            Orchestrator <span className="text-primary-color">V2</span>
          </h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Invisible Engineering</p>
        </div>
        <button onClick={onReset} className="text-gray-500 hover:text-white transition-colors" title="Reiniciar">
          <FaMagic className="rotate-180" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <FaMagic className="text-2xl" />
            </div>
            <div>
              <p className="text-sm font-bold">Describe tu intención</p>
              <p className="text-[10px] uppercase tracking-tighter">Pega una URL o sube una imagen</p>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`p-4 rounded-2xl ${m.role === 'user' ? 'bg-primary-color/10 ml-8 border border-primary-color/20' : 'bg-white/5 mr-8 border border-white/5'}`}>
              <p className="text-sm text-gray-200">{m.content}</p>
            </div>
          ))
        )}
        {isDiscovering && (
          <div className="p-4 rounded-2xl bg-white/5 mr-8 border border-white/5 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-color border-t-transparent animate-spin rounded-full"></div>
            <p className="text-xs text-primary-color animate-pulse font-bold tracking-widest uppercase">Analizando...</p>
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
            className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 pr-12 text-sm outline-none focus:border-primary-color transition-all resize-none min-h-[100px] text-white"
            disabled={isDiscovering}
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-white transition-colors"
              disabled={isDiscovering}
            >
              <FaImage />
            </button>
            <button
              onClick={handleSend}
              className="p-2 bg-primary-color text-black rounded-lg hover:scale-105 transition-all disabled:opacity-50 disabled:grayscale"
              disabled={isDiscovering || !input.trim()}
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
