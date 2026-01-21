import React from 'react';
import { FaBullseye, FaUserAstronaut, FaInfoCircle } from 'react-icons/fa';
import { ProductData } from '../../../types/image-pro';

interface DiscoveryPanelProps {
  data: ProductData;
  onConfirmDiscovery?: () => void;
}

const DiscoveryPanel: React.FC<DiscoveryPanelProps> = ({ data, onConfirmDiscovery }) => {
  return (
    <div className="w-full max-w-3xl space-y-10 animate-in fade-in slide-in-from-bottom duration-1000">
      <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-color/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>

        <div className="flex flex-col md:flex-row gap-8 relative z-10">
          <div className="flex-1 space-y-6">
            <div>
              <span className="text-[10px] font-black text-primary-color uppercase tracking-widest mb-2 block">Producto Detectado</span>
              <h2 className="text-3xl font-black text-white leading-tight">{data.name}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-primary-color/30 transition-all group/item">
                <div className="flex items-center gap-2 mb-3">
                  <FaBullseye className="text-primary-color" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Ángulo de Venta</span>
                </div>
                <p className="text-sm font-bold text-gray-100 leading-relaxed">{data.angle}</p>
              </div>

              <div className="bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-primary-color/30 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <FaUserAstronaut className="text-primary-color" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Buyer Persona</span>
                </div>
                <p className="text-sm font-bold text-gray-100 leading-relaxed">{data.buyer}</p>
              </div>
            </div>

            <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <FaInfoCircle className="text-primary-color" />
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">ADN Visual y Detalles</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{data.details}</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex gap-4">
          <button
            onClick={onConfirmDiscovery}
            className="flex-1 py-4 bg-primary-color text-black font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary-color/20"
          >
            Confirmar y Crear Lanzamiento
          </button>
          <button className="px-6 py-4 bg-white/5 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all">
            Ajustar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryPanel;
