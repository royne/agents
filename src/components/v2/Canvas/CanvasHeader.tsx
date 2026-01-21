import React from 'react';
import { FaDesktop, FaBullseye, FaCheckCircle, FaMagic, FaRocket, FaExpand } from 'react-icons/fa';
import { ProductData, CreativePath, LandingGenerationState } from '../../../types/image-pro';

interface CanvasHeaderProps {
  data: ProductData | null;
  creativePaths: CreativePath[] | null;
  landingState: LandingGenerationState;
  isLoading: boolean;
  isRecommending?: boolean;
  isDesigning?: boolean;
  showStrategyPanel: boolean;
  setShowStrategyPanel: (show: boolean) => void;
}

const CanvasHeader: React.FC<CanvasHeaderProps> = ({
  data,
  creativePaths,
  landingState,
  isLoading,
  isRecommending,
  isDesigning,
  showStrategyPanel,
  setShowStrategyPanel
}) => {
  return (
    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
      <div className="flex items-center gap-4">
        <div className="flex gap-1.5 font-bold text-[10px] text-gray-500 bg-black/40 p-1 rounded-lg">
          <button className="p-1 px-3 bg-white/10 text-white rounded-md flex items-center gap-2 transition-all">
            <FaDesktop /> Desktop
          </button>
          <button
            onClick={() => setShowStrategyPanel(!showStrategyPanel)}
            className={`p-1 px-3 flex items-center gap-2 transition-all rounded-md ${showStrategyPanel
                ? 'bg-primary-color/20 text-primary-color font-bold'
                : 'hover:text-white'
              }`}
          >
            <FaBullseye /> Estrategia
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {(isLoading || isDesigning) && (
          <span className="text-[10px] font-black uppercase tracking-widest text-primary-color animate-pulse flex items-center gap-2">
            <div className="w-2 h-2 bg-primary-color rounded-full animate-ping"></div>
            {isRecommending
              ? 'Diseñando Caminos...'
              : isDesigning
                ? 'Estructurando Landing...'
                : 'Analizando estrategia...'}
          </span>
        )}
        {data && !creativePaths && !isLoading && (
          <span className="text-[10px] font-black uppercase tracking-widest text-green-400 flex items-center gap-2">
            <FaCheckCircle /> ADN Detectado
          </span>
        )}
        {creativePaths && !landingState.proposedStructure && (
          <span className="text-[10px] font-black uppercase tracking-widest text-primary-color flex items-center gap-2">
            <FaMagic /> Selección Creativa
          </span>
        )}
        {landingState.proposedStructure && (
          <span className="text-[10px] font-black uppercase tracking-widest text-primary-color flex items-center gap-2">
            <FaRocket /> Diseño de Estructura
          </span>
        )}
        <button className="p-2 text-gray-500 hover:text-white">
          <FaExpand />
        </button>
      </div>
    </div>
  );
};

export default CanvasHeader;
