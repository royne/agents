import React from 'react';
import { FaRocket } from 'react-icons/fa';
import { LandingGenerationState } from '../../../types/image-pro';

interface PhoneMockupProps {
  landingState: LandingGenerationState;
}

const PhoneMockup: React.FC<PhoneMockupProps> = ({ landingState }) => {
  return (
    <div className="sticky top-24 flex flex-col items-center">
      <div className="w-[300px] h-[600px] bg-black rounded-[50px] p-4 border-[6px] border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden group/mockup">
        {/* Speaker/Camera Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-30 border-x border-b border-white/5"></div>

        {/* Screen Content (Scrollable) */}
        <div className="w-full h-full bg-[#0a0a0a] rounded-[36px] overflow-y-auto v2-scrollbar-hidden relative">
          <div className="flex flex-col">
            {landingState.proposedStructure?.sections.map(s => {
              const generation = landingState.generations[s.sectionId];
              return (
                <div key={s.sectionId} className="w-full relative border-b border-white/5 last:border-0 overflow-hidden">
                  {generation?.imageUrl ? (
                    <img
                      src={generation.imageUrl}
                      alt={s.title}
                      className="w-full h-auto object-cover min-h-[120px]"
                    />
                  ) : (
                    <div className="w-full min-h-[140px] bg-white/[0.02] flex flex-col items-center justify-center p-6 text-center space-y-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mb-1">
                        <FaRocket className="text-xs text-white/20" />
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-white/60 uppercase tracking-widest block mb-1">{s.title}</span>
                        <p className="text-[7px] text-white/30 uppercase tracking-[0.2em] font-bold line-clamp-2 px-4 italic leading-relaxed">
                          {s.reasoning}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/5 animate-pulse"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/5 animate-pulse delay-75"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/5 animate-pulse delay-150"></div>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 text-[6px] font-black text-white/80 uppercase tracking-widest">
                    {s.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Glass Reflection */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent opacity-50"></div>
      </div>
      <p className="mt-6 text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Vista Previa Dispositivo</p>
    </div>
  );
};

export default PhoneMockup;
