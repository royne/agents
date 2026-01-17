import React from 'react';
import { FaDesktop, FaMobileAlt, FaExpand, FaCheckCircle, FaExclamationTriangle, FaUserAstronaut, FaBullseye, FaInfoCircle, FaMagic } from 'react-icons/fa';
import { ProductData } from '../../../types/image-pro';

interface ArtifactViewerProps {
  data: ProductData | null;
  isLoading: boolean;
  error: string | null;
}

const ArtifactViewer: React.FC<ArtifactViewerProps> = ({ data, isLoading, error }) => {
  return (
    <div className="w-full max-w-5xl h-[80vh] bg-theme-component/30 backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-2xl flex flex-col overflow-hidden group">
      {/* Canvas Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5 font-bold text-[10px] text-gray-500 bg-black/40 p-1 rounded-lg">
            <button className="p-1 px-3 bg-white/10 text-white rounded-md flex items-center gap-2 transition-all">
              <FaDesktop /> Desktop
            </button>
            <button className="p-1 px-3 hover:text-white transition-colors flex items-center gap-2">
              <FaMobileAlt /> Mobile
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLoading && <span className="text-[10px] font-black uppercase tracking-widest text-primary-color animate-pulse flex items-center gap-2">
            <div className="w-2 h-2 bg-primary-color rounded-full animate-ping"></div>
            Analizando estrategia...
          </span>}
          {data && <span className="text-[10px] font-black uppercase tracking-widest text-green-400 flex items-center gap-2">
            <FaCheckCircle /> Estrategia Lista
          </span>}
          <button className="p-2 text-gray-500 hover:text-white">
            <FaExpand />
          </button>
        </div>
      </div>

      {/* Actual Content Area */}
      <div className="flex-1 bg-[#05070A] relative flex flex-col items-center justify-center overflow-y-auto custom-scrollbar p-12">
        {isLoading ? (
          <div className="text-center space-y-8 animate-pulse">
            <div className="relative">
              <div className="w-32 h-32 bg-primary-color/10 rounded-full flex items-center justify-center mx-auto border border-primary-color/20 relative z-10">
                <FaMagic className="text-5xl text-primary-color/40" />
              </div>
              <div className="absolute inset-0 w-32 h-32 border-2 border-primary-color border-t-transparent animate-spin rounded-full mx-auto"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight text-white">Extrayendo ADN del Producto</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Identificando identidad, audiencia y estrategia...</p>
            </div>
          </div>
        ) : data ? (
          <div className="w-full max-w-3xl space-y-10 animate-in fade-in slide-in-from-bottom duration-1000">
            {/* Strategy Card */}
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
                <button className="flex-1 py-4 bg-primary-color text-black font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary-color/20">
                  Confirmar y Crear Lanzamiento
                </button>
                <button className="px-6 py-4 bg-white/5 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all">
                  Ajustar
                </button>
              </div>
            </div>
          </div>
        ) : error ? (
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
        ) : (
          <div className="text-center space-y-8 animate-in fade-in zoom-in duration-1000">
            <div className="relative">
              <div className="w-32 h-32 bg-primary-color/5 rounded-full flex items-center justify-center mx-auto border border-primary-color/10 group-hover:scale-110 transition-transform duration-700">
                <FaMagic className="text-4xl text-primary-color/30" />
              </div>
              <div className="absolute inset-0 border-2 border-primary-color/20 border-dashed rounded-full animate-[spin_10s_linear_infinite]"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight text-white">Tu Mesa de Trabajo</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                Los activos generados aparecerán aquí. Inicia pegando una URL o subiendo una imagen del producto en el chat.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtifactViewer;
