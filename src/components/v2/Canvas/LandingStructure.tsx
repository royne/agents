import React from 'react';
import { FaRocket, FaChevronRight, FaMagic, FaStop } from 'react-icons/fa';
import { LandingGenerationState } from '../../../types/image-pro';
import PhoneMockup from './PhoneMockup';

interface LandingStructureProps {
  landingState: LandingGenerationState;
  isDesigning?: boolean;
  onSelectSection?: (sectionId: string) => void;
  setPreviewSectionId: (id: string | null) => void;
  onGenerateAds?: () => void;
  onAutoGenerate?: () => void;
  onStopAutoGenerate?: () => void;
  previewSectionId: string | null;
  onExpandImage?: (url: string) => void;
}

const LandingStructure: React.FC<LandingStructureProps> = ({
  landingState,
  isDesigning,
  onSelectSection,
  setPreviewSectionId,
  onGenerateAds,
  onAutoGenerate,
  onStopAutoGenerate,
  previewSectionId,
  onExpandImage
}) => {
  if (!landingState.proposedStructure) return null;

  return (
    <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-10 animate-in fade-in slide-in-from-bottom duration-1000">

      {/* LEFT COLUMN: SECTIONS LIST */}
      <div className="flex-1 space-y-8">
        <div className="text-left space-y-2 mb-8">
          <h2 className="text-3xl font-black text-white tracking-tight">Diseño de Estructura</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Flujo de conversión personalizado para tu producto</p>

          {landingState.isAutoMode ? (
            <div className="pt-4 flex justify-start">
              <button
                onClick={onStopAutoGenerate}
                className="flex items-center gap-2 px-8 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all group"
              >
                <FaStop className="text-xs group-hover:scale-110 transition-transform" /> Detener Generación Automática
              </button>
            </div>
          ) : (
            <div className="pt-4 flex justify-start">
              <button
                onClick={onAutoGenerate}
                className="flex items-center gap-2 px-8 py-3 bg-primary-color border border-white/10 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary-color/20 group"
              >
                <FaMagic className="text-xs group-hover:animate-pulse" /> Generar Todo con Inteligencia Artificial
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {landingState.proposedStructure.sections.map((section, idx) => {
            const generation = landingState.generations[section.sectionId];
            const isPending = generation?.status === 'pending';
            const isCompleted = generation?.status === 'completed';

            return (
              <div
                key={idx}
                onClick={() => {
                  if (isPending) return;
                  if (isCompleted) setPreviewSectionId(section.sectionId);
                  else onSelectSection?.(section.sectionId);
                }}
                className={`bg-white/[0.03] border rounded-[28px] overflow-hidden flex flex-col transition-all group/sec cursor-pointer hover:bg-white/[0.06] min-h-[140px] ${isPending
                  ? 'border-primary-color/50 animate-pulse bg-primary-color/5'
                  : isCompleted
                    ? 'border-green-500/20'
                    : 'border-white/5 hover:border-primary-color/40'
                  }`}
              >
                {isCompleted && generation.imageUrl ? (
                  <div className="h-48 w-full relative overflow-hidden flex flex-row">
                    <div className="w-48 h-full shrink-0 relative overflow-hidden border-r border-white/5">
                      <img src={generation.imageUrl} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover/sec:scale-110" />
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-primary-color text-[8px] font-black uppercase tracking-[0.2em]">Sección {idx + 1}</span>
                        <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest">Generado</span>
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1 group-hover/sec:text-primary-color transition-colors">{section.title}</h3>
                      <p className="text-[10px] text-gray-500 leading-relaxed italic mb-2">"{section.reasoning}"</p>
                      <div className="pt-2 border-t border-white/5">
                        <p className="text-[9px] text-white/60 font-black uppercase tracking-wider line-clamp-1">{generation.copy.headline}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${isPending ? 'bg-primary-color/20 text-primary-color animate-spin' : 'bg-white/5 text-gray-600 group-hover/sec:text-primary-color group-hover/sec:bg-primary-color/10 transition-all shadow-inner'}`}>
                      {isPending ? <FaRocket className="text-sm" /> : idx + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1 group-hover/sec:text-primary-color transition-colors">{section.title}</h3>
                      <p className="text-[10px] text-gray-500 leading-relaxed italic max-w-md">"{isPending ? 'Generando assets estratégicos...' : section.reasoning}"</p>
                    </div>
                    {!isPending && <FaChevronRight className="ml-auto text-gray-700 group-hover/sec:text-primary-color group-hover/sec:translate-x-1 transition-all" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* BOTTOM ACTION BAR */}
        {!previewSectionId && landingState.phase === 'landing' && (
          <div className="pt-8">
            <button
              onClick={onGenerateAds}
              disabled={isDesigning}
              className="w-full py-5 bg-white/5 border border-white/10 text-white hover:bg-primary-color hover:text-black font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 group"
            >
              {isDesigning ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-color border-t-transparent animate-spin rounded-full"></div>
                  Analizando Estrategia de Pauta...
                </>
              ) : (
                <>🚀 Lanzar Estrategia de Pauta Publicitaria <FaChevronRight className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: PREVIEW MOCKUP */}
      <div className="w-full lg:w-[320px] shrink-0 mt-10 lg:mt-0">
        <div className="lg:sticky lg:top-1 flex flex-col items-center">
          <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 backdrop-blur-3xl shadow-2xl flex flex-col items-center w-full max-w-[340px] lg:max-w-none">
            <PhoneMockup
              landingState={landingState}
              viewMode="landing"
              onExpandImage={onExpandImage}
            />
          </div>

          <div className="mt-6 flex flex-col items-center gap-2 opacity-50">
            <div className="flex items-center gap-2 text-[8px] font-black text-white uppercase tracking-[0.3em]">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              Sincronización en Vivo
            </div>
            <p className="text-[7px] text-gray-500 text-center uppercase tracking-widest font-bold">Las imágenes generadas aparecen <br />aquí automáticamente</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LandingStructure;
