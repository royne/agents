import React from 'react';
import NextImage from 'next/image';

const BrandLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050608] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Luces de fondo ambientales */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-color/10 rounded-full blur-[120px] opacity-30"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] opacity-20"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Contenedor del Logo con Brillo */}
        <div className="relative group mb-12">
          <div className="absolute -inset-8 bg-gradient-to-br from-primary-color/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>

          <div className="relative p-1 rounded-[2rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-3xl animate-logo-pulse">
            <div className="bg-[#050608] rounded-[1.8rem] p-6 shadow-2xl overflow-hidden relative">
              {/* Línea de escaneo interna */}
              <div className="absolute inset-0 w-full h-1/2 bg-gradient-to-b from-transparent via-primary-color/5 to-transparent animate-[scan-line_2s_infinite]"></div>

              <div className="relative w-20 h-20">
                <NextImage
                  src="/droplab.png"
                  alt="DROPAPP"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Texto de Carga Minimalista */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-color animate-[bounce_1s_infinite_0ms]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-[bounce_1s_infinite_200ms]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary-color animate-[bounce_1s_infinite_400ms]"></div>
          </div>
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] ml-2">
            Iniciando Protocolos
          </span>
        </div>
      </div>

      {/* Branding Inferior */}
      <div className="absolute bottom-12 text-center">
        <div className="text-[9px] font-bold text-white/10 uppercase tracking-[0.3em]">
          Digital Engine <span className="text-primary-color/30">by RAC</span>
        </div>
      </div>
    </div>
  );
};

export default BrandLoader;
