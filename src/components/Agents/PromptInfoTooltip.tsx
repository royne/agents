import React, { useRef, useEffect } from 'react';
import { FaInfoCircle } from 'react-icons/fa';

interface PromptInfoTooltipProps {
  showTooltip: boolean;
  setShowTooltip: (show: boolean) => void;
}

const PromptInfoTooltip: React.FC<PromptInfoTooltipProps> = ({
  showTooltip,
  setShowTooltip
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Cerrar el tooltip al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowTooltip]);

  return (
    <div className="relative ml-2">
      <FaInfoCircle 
        className="text-blue-400 cursor-pointer" 
        onMouseEnter={() => setShowTooltip(true)}
        onClick={() => setShowTooltip(!showTooltip)}
      />
      {showTooltip && (
        <div 
          ref={tooltipRef}
          className="absolute z-10 w-80 p-3 bg-gray-800 text-white text-xs rounded shadow-lg border border-gray-700 left-0 top-6"
        >
          <h4 className="font-bold mb-2 text-blue-400">Estructura recomendada:</h4>
          <ol className="list-decimal pl-4 mb-2 space-y-1">
            <li><strong>Descripción breve</strong> (2-3 líneas): Define el rol y especialidad del agente</li>
            <li><strong>Tareas principales</strong> (5-8 puntos): Enumera lo que debe hacer el agente</li>
            <li><strong>Objetivo general</strong> (2-3 líneas): Define el propósito final del agente</li>
            <li><strong>Consideraciones especiales</strong> (3-5 puntos): Restricciones o enfoques específicos</li>
          </ol>
          <h4 className="font-bold mb-2 text-blue-400">Consejos:</h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>Sé específico pero conciso</li>
            <li>Usa formato estructurado (títulos, viñetas)</li>
            <li>Prioriza instrucciones clave al principio</li>
            <li>Evita redundancias</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PromptInfoTooltip;
