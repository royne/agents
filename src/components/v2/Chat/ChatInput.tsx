import React, { useState, useRef } from 'react';
import { FaPaperPlane, FaImage } from 'react-icons/fa';
import { processImageForUpload } from '../../../utils/imageProcessor';

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onAddUserMessage('He subido una imagen del producto.');
    onAddAssistantMessage('Optimizando y analizando imagen...');

    try {
      // 1. Procesar imagen en el cliente (WebP + Redimensión) -> Máximo 800px para sostenibilidad
      const optimizedBlob = await processImageForUpload(file, 800);

      // 2. Convertir a Base64 para envío ligero a la API (Evita payloads gigantes en Vercel)
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // 3. Iniciar descubrimiento con el base64 optimizado (~80KB)
        onUpload({ imageBase64: base64 });
      };
      reader.readAsDataURL(optimizedBlob);

    } catch (err: any) {
      console.error('[ChatInput] Error en procesamiento local:', err);
      const errorMsg = err.message || 'Error al procesar la imagen.';
      if (onError) onError(errorMsg);
      else alert(errorMsg);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
