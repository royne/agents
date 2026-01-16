import React from 'react';
import { FaEdit } from 'react-icons/fa';

interface RefinementModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  onPromptChange: (value: string) => void;
  onApply: () => void;
}

const RefinementModal: React.FC<RefinementModalProps> = ({
  isOpen,
  onClose,
  prompt,
  onPromptChange,
  onApply
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-theme-component border border-gray-800 rounded-3xl shadow-2xl p-8">
        <h3 className="text-xl font-bold text-theme-primary mb-4 flex items-center gap-2">
          < FaEdit className="text-primary-color" /> ¿Qué deseas ajustar?
        </h3>
        <textarea
          placeholder="Ej: Haz el fondo un poco más oscuro y añade reflejos en el cristal..."
          rows={4}
          className="w-full bg-theme-primary border border-gray-700 rounded-2xl p-4 text-theme-primary focus:border-primary-color outline-none mb-6"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
        />
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 text-theme-secondary font-medium">Cancelar</button>
          <button onClick={onApply} className="flex-[2] py-3 bg-primary-color text-black font-bold rounded-xl shadow-lg">Aplicar Ajustes</button>
        </div>
      </div>
    </div>
  );
};

export default RefinementModal;
