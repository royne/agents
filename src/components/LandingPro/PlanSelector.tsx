import React from 'react';
import { LandingMode } from '../../types/landing-pro';

interface PlanSelectorProps {
  landingMode: LandingMode;
  onModeChange: (mode: LandingMode) => void;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({ landingMode, onModeChange }) => {
  return (
    <div className="flex bg-theme-component border border-white/10 rounded-xl p-1 shadow-inner">
      <button
        onClick={() => onModeChange('full')}
        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${landingMode === 'full'
            ? 'bg-primary-color text-black shadow-lg shadow-primary-color/20'
            : 'text-theme-tertiary hover:text-white'
          }`}
      >
        Completo
      </button>
      <button
        onClick={() => onModeChange('flash')}
        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${landingMode === 'flash'
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
            : 'text-theme-tertiary hover:text-white'
          }`}
      >
        Flash
      </button>
      <button
        onClick={() => onModeChange('section')}
        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${landingMode === 'section'
            ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
            : 'text-theme-tertiary hover:text-white'
          }`}
      >
        Sección
      </button>
    </div>
  );
};

export default PlanSelector;
