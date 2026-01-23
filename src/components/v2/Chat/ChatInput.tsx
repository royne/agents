import React, { useState, useRef } from 'react';
import { FaPaperPlane, FaImage } from 'react-icons/fa';

interface ChatInputProps {
  onSend: (text: string) => void;
  onUpload: (input: { url?: string; imageBase64?: string }) => void;
  disabled: boolean;
  onAddUserMessage: (content: string) => void;
  onAddAssistantMessage: (content: string) => void;
  onError?: (msg: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, onUpload, disabled, onAddUserMessage, onAddAssistantMessage, onError }) => {
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (1MB = 1048576 bytes)
    if (file.size > 1024 * 1024) {
      const errorMsg = 'La imagen es demasiado pesada. El límite es de 1MB para asegurar un procesamiento rápido.';
      if (onError) onError(errorMsg);
      else alert(errorMsg);

      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onAddUserMessage('He subido una imagen del producto.');
      onAddAssistantMessage('Analizando imagen para extraer estrategia...');
      onUpload({ imageBase64: base64 });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-5 border-t border-white/5 bg-white/[0.02]">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder="Escribe tu mensaje o pega una URL..."
          className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pr-12 text-xs text-white placeholder:text-gray-600 outline-none focus:border-primary-color/50 transition-all resize-none min-h-[60px]"
          disabled={disabled}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-white transition-colors"
            disabled={disabled}
          >
            <FaImage />
          </button>
          <button
            onClick={handleSend}
            className="p-2 bg-primary-color text-black rounded-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            disabled={disabled || !input.trim()}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
