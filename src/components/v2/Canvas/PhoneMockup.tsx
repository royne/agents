import React, { useState, useRef } from 'react';
import { FaRocket, FaChevronDown } from 'react-icons/fa';
import { LandingGenerationState } from '../../../types/image-pro';

import InstagramPost from '../Dashboard/InstagramPost';

interface PhoneMockupProps {
  landingState: LandingGenerationState;
  className?: string;
  viewMode?: 'landing' | 'ads';
  showConversionBlur?: boolean;
}

const PhoneMockup: React.FC<PhoneMockupProps> = ({ landingState, className, viewMode = 'landing', showConversionBlur = false }) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current && scrollRef.current.scrollTop > 20) {
      setHasScrolled(true);
    }
  };

  return (
    <div className={className || "flex flex-col items-center"}>
      <div className="w-[300px] h-[600px] bg-black rounded-[50px] p-2 border-[6px] border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden group/mockup">
        {/* Speaker/Camera Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-30 border-x border-b border-white/5"></div>

        {/* Scroll Indicator Indicator */}
        {!hasScrolled && viewMode === 'landing' && (landingState.proposedStructure?.sections?.length || 0) > 2 && (
          <div className="absolute bottom-10 inset-x-0 z-40 flex flex-col items-center pointer-events-none transition-opacity duration-700">
            <div className="flex flex-col items-center gap-1 animate-bounce">
              <div className="px-3 py-1 bg-black/80 backdrop-blur-md rounded-full border border-primary-color/30 flex items-center gap-2 shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                <span className="text-[8px] font-black text-primary-color uppercase tracking-[0.3em]">Explorar</span>
                <FaChevronDown className="text-primary-color text-[10px]" />
              </div>
              <div className="w-1 h-8 bg-gradient-to-b from-primary-color/50 to-transparent rounded-full"></div>
            </div>
          </div>
        )}

        {/* Screen Content (Scrollable) */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="w-full h-full bg-[#0a0a0a] rounded-[36px] overflow-y-auto v2-scrollbar-hidden relative"
        >
          {viewMode === 'landing' ? (
            <div className="flex flex-col">
              {landingState.proposedStructure?.sections.map((s, idx) => {
                const generation = landingState.generations[s.sectionId];
                const isPlaceholder = !generation?.imageUrl;

                return (
                  <div key={s.sectionId} className="w-full relative border-b border-white/5 last:border-0 overflow-hidden group/section">
                    {generation?.imageUrl ? (
                      <img
                        src={generation.imageUrl}
                        alt={s.title}
                        className="w-full h-full object-cover min-h-[120px] transition-transform duration-700 group-hover/section:scale-110"
                      />
                    ) : (
                      <div className={`w-full ${showConversionBlur ? 'min-h-[220px]' : 'min-h-[140px]'} bg-white/[0.02] flex flex-col items-center justify-center p-6 text-center space-y-3 relative overflow-hidden ${showConversionBlur ? 'blur-[8px] opacity-70 grayscale' : ''}`}>
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mb-1">
                          <FaRocket className="text-xs text-white/20" />
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-white/60 uppercase tracking-widest block mb-1">{s.title}</span>
                          <p className="text-[7px] text-white/30 uppercase tracking-[0.2em] font-bold line-clamp-2 px-4 italic leading-relaxed">
                            {s.reasoning}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Premium/Lock Overlay for Conversion Blur */}
                    {showConversionBlur && isPlaceholder && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 p-4">
                        <div className="w-10 h-10 rounded-full bg-primary-color/20 border border-primary-color/40 flex items-center justify-center shadow-[0_0_15px_rgba(18,216,250,0.5)] mb-4 animate-bounce">
                          <span className="text-sm">💎</span>
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Contenido Bloqueado</p>
                          <p className="text-[8px] text-white/60 font-medium leading-tight px-4">Actualiza tu plan profesional para desbloquear esta sección optimizada por IA</p>
                          <div className="mt-4 px-4 py-2 bg-primary-color text-black rounded-full shadow-[0_5px_15px_rgba(18,216,250,0.3)] hover:scale-105 transition-transform cursor-pointer">
                            <span className="text-[8px] font-black uppercase tracking-widest">Ver Planes</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col p-2 space-y-4">
              <div className="flex items-center justify-center py-4 border-b border-white/5">
                <span className="text-[10px] font-black text-primary-color uppercase tracking-widest">Feed de Anuncios</span>
              </div>
              {landingState.adConcepts?.map(concept => {
                const generation = landingState.adGenerations[concept.id];
                const isPlaceholder = !generation?.imageUrl;

                return (
                  <div key={concept.id} className="relative">
                    <div className={showConversionBlur && isPlaceholder ? 'blur-[8px] opacity-50 grayscale pointer-events-none' : ''}>
                      <InstagramPost
                        imageUrl={generation?.imageUrl || ""}
                        hook={concept.hook}
                        cta={concept.adCta}
                        title={concept.title}
                        className="!max-w-full !rounded-2xl border-white/5"
                      />
                    </div>
                    {showConversionBlur && isPlaceholder && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                        <div className="px-3 py-1 bg-primary-color text-black text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">
                          Contenido Premium
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Glass Reflection */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent opacity-30"></div>
      </div>
      <p className="mt-6 text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Vista Previa Dispositivo</p>
    </div>
  );
};

export default PhoneMockup;
