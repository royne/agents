import React from 'react';
import { FaRocket, FaBullseye, FaMagic } from 'react-icons/fa';
import { CreativePath } from '../../../types/image-pro';

interface PathSelectorProps {
  creativePaths: CreativePath[];
  onSelectPath?: (path: CreativePath) => void;
}

const PathSelector: React.FC<PathSelectorProps> = ({ creativePaths, onSelectPath }) => {
  return (
    <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom duration-1000">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-black text-white">Elige tu Camino Creativo</h2>
        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">La IA ha seleccionado 3 estrategias maestras para tu producto</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {creativePaths.map((path, idx) => (
          <div
            key={idx}
            onClick={() => onSelectPath?.(path)}
            className="bg-white/5 border border-white/10 hover:border-primary-color/50 rounded-3xl p-6 flex flex-col gap-4 transition-all group/card cursor-pointer hover:bg-white/[0.07] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/card:opacity-30 transition-opacity">
              <FaRocket className="text-4xl" />
            </div>

            <div>
              <span className="text-[9px] font-black text-primary-color uppercase tracking-widest mb-1 block">{path.package?.style || 'ESTILO ESTRATÉGICO'}</span>
              <h3 className="text-lg font-bold text-white mb-2">{path.package?.name || 'Sin Nombre'}</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed mb-4">{path.package?.description || 'Cargando detalles de la estrategia...'}</p>
            </div>

            <div className="mt-auto pt-4 border-t border-white/5">
              <div className="flex items-start gap-2 mb-4">
                <FaBullseye className="text-primary-color mt-0.5 shrink-0" />
                <p className="text-[10px] font-medium text-gray-300 italic">"{path.justification}"</p>
              </div>
              <button className="w-full py-3 bg-white/5 group-hover/card:bg-primary-color group-hover/card:text-black text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all">
                Seleccionar Estilo
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <button onClick={() => window.location.reload()} className="text-[10px] text-gray-500 hover:text-white uppercase tracking-widest font-bold flex items-center gap-2">
          <FaMagic /> Probar otros ángulos
        </button>
      </div>
    </div>
  );
};

export default PathSelector;
