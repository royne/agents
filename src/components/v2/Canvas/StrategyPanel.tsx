import React from 'react';
import { ProductData } from '../../../types/image-pro';

interface StrategyPanelProps {
  showStrategyPanel: boolean;
  setShowStrategyPanel: (show: boolean) => void;
  data: ProductData | null;
}

const StrategyPanel: React.FC<StrategyPanelProps> = ({ showStrategyPanel, setShowStrategyPanel, data }) => {
  if (!showStrategyPanel || !data) return null;

  return (
    <div className="absolute top-24 right-8 w-72 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-right-4 fade-in duration-500 z-50 overflow-y-auto max-h-[70%]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-black text-primary-color uppercase tracking-widest">Estrategia Actual</h3>
        <button
          onClick={() => setShowStrategyPanel(false)}
          className="text-gray-500 hover:text-white"
        >
          ×
        </button>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Producto</span>
          <p className="text-sm font-bold text-white leading-tight">{data.name}</p>
        </div>

        <div className="space-y-2">
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Ángulo de Venta</span>
          <p className="text-xs font-medium text-gray-300 leading-relaxed">{data.angle}</p>
        </div>

        <div className="space-y-2">
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Buyer Persona</span>
          <p className="text-xs font-medium text-gray-300 leading-relaxed">{data.buyer}</p>
        </div>

        <div className="pt-4 border-t border-white/5">
          <p className="text-[9px] text-gray-500 italic leading-relaxed">
            Puedes pedir al estratega que cambie el ángulo o el público objetivo en cualquier momento desde el chat.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StrategyPanel;
