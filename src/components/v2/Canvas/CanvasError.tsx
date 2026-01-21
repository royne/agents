import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

interface CanvasErrorProps {
  error: string;
}

const CanvasError: React.FC<CanvasErrorProps> = ({ error }) => {
  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
        <FaExclamationTriangle className="text-3xl text-rose-500" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white">Error de Identificación</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-xs">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
};

export default CanvasError;
