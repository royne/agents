import React from 'react';
import { FaEdit } from 'react-icons/fa';

interface CorrectionModalProps {
  isOpen: boolean;
  isGenerating: boolean;
  correctionPrompt: string;
  onClose: () => void;
  onPromptChange: (prompt: string) => void;
  onApply: () => void;
}

const CorrectionModal: React.FC<CorrectionModalProps> = ({
  isOpen,
  isGenerating,
  correctionPrompt,
  onClose,
  onPromptChange,
  onApply
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-theme-component border border-white/10 rounded-[2.5rem] shadow-2xl p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-color/5 blur-3xl rounded-full -mr-16 -mt-16"></div>

        <h3 className="text-2xl font-black text-theme-primary mb-2 flex items-center gap-3 uppercase tracking-tighter">
          <FaEdit className="text-primary-color" /> Pulir Diseño
        </h3>
        <p className="text-theme-tertiary text-xs mb-8 font-medium opacity-60">Describe los cambios específicos que deseas aplicar a esta sección.</p>

        <textarea
          placeholder="Ej: Haz el fondo un poco más oscuro y añade reflejos en el cristal..."
          rows={5}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-theme-primary focus:border-primary-color outline-none mb-8 transition-all resize-none text-sm placeholder:italic"
          value={correctionPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
        />

        <div className="flex gap-4">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="flex-1 py-5 text-theme-secondary font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors disabled:opacity-30"
          >
            Cancelar
          </button>
          <button
            onClick={onApply}
            disabled={isGenerating}
            className="flex-[2] py-5 bg-primary-color text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:shadow-[0_0_40px_rgba(18,216,250,0.3)] transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {isGenerating ? 'Procesando...' : 'Aplicar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorrectionModal;
