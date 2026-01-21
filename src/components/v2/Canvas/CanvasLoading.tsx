import React from 'react';
import { FaMagic } from 'react-icons/fa';

interface CanvasLoadingProps {
  isRecommending?: boolean;
  isDesigning?: boolean;
}

const CanvasLoading: React.FC<CanvasLoadingProps> = ({ isRecommending, isDesigning }) => {
  return (
    <div className="text-center space-y-8 animate-pulse">
      <div className="relative">
        <div className="w-32 h-32 bg-primary-color/10 rounded-full flex items-center justify-center mx-auto border border-primary-color/20 relative z-10">
          <FaMagic className="text-5xl text-primary-color/40" />
        </div>
        <div className="absolute inset-0 w-32 h-32 border-2 border-primary-color border-t-transparent animate-spin rounded-full mx-auto"></div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold tracking-tight text-white">
          {isRecommending ? 'Analizando Caminos Creativos' : isDesigning ? 'Estructurando tu Landing' : 'Extrayendo ADN del Producto'}
        </h3>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
          {isRecommending
            ? 'El Director Creativo está seleccionando las mejores referencias...'
            : isDesigning
              ? 'El Arquitecto está diseñando la secuencia de conversión...'
              : 'Identificando identidad, audiencia y estrategia...'}
        </p>
      </div>
    </div>
  );
};

export default CanvasLoading;
