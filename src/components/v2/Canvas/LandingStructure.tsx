import React from 'react';
import { FaRocket, FaChevronRight, FaMagic, FaStop } from 'react-icons/fa';
import { LandingGenerationState } from '../../../types/image-pro';

interface LandingStructureProps {
  landingState: LandingGenerationState;
  isDesigning?: boolean;
  onSelectSection?: (sectionId: string) => void;
  setPreviewSectionId: (id: string | null) => void;
  onGenerateAds?: () => void;
  onAutoGenerate?: () => void;
  onStopAutoGenerate?: () => void;
  previewSectionId: string | null;
}

const LandingStructure: React.FC<LandingStructureProps> = ({
  landingState,
  isDesigning,
  onSelectSection,
  setPreviewSectionId,
  onGenerateAds,
  onAutoGenerate,
  onStopAutoGenerate,
  previewSectionId
}) => {
  if (!landingState.proposedStructure) return null;

  return (
    <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom duration-1000">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-black text-white">Estructura Estratégica</h2>
        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">He diseñado este flujo de conversión personalizado</p>

        {landingState.isAutoMode ? (
          <div className="pt-4 flex justify-center">
            <button
              onClick={onStopAutoGenerate}
              className="flex items-center gap-2 px-8 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all group"
            >
              <FaStop className="text-xs group-hover:scale-110 transition-transform" /> Detener Generación Automática
            </button>
          </div>
        ) : (
          <div className="pt-4 flex justify-center">
            <button
              onClick={onAutoGenerate}
              className="flex items-center gap-2 px-8 py-3 bg-primary-color border border-white/10 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary-color/20 group"
            >
              <FaMagic className="text-xs group-hover:animate-pulse" /> Generar Todo con Inteligencia Artificial
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              className={`bg-white/5 border rounded-[32px] overflow-hidden flex flex-col transition-all group/sec cursor-pointer hover:bg-white/[0.08] min-h-[160px] ${isPending
                ? 'border-primary-color/50 animate-pulse'
                : isCompleted
                  ? 'border-green-500/30'
                  : 'border-white/10 hover:border-primary-color/50'
                }`}
            >
              {isCompleted && generation.imageUrl ? (
                <div className="h-64 w-full relative overflow-hidden">
                  <img src={generation.imageUrl} className="w-full h-full object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-sm font-bold text-white mb-1">{generation.copy.headline}</h3>
                    <p className="text-[9px] text-gray-400 line-clamp-2 leading-tight uppercase tracking-wider font-bold">{section.title}</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${isPending ? 'bg-primary-color/20 text-primary-color animate-spin' : 'bg-white/5 text-gray-500 group-hover/sec:text-primary-color'}`}>
                    {isPending ? <FaRocket className="text-sm" /> : idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1 group-hover/sec:text-primary-color transition-colors">{section.title}</h3>
                    <p className="text-[10px] text-gray-500 leading-relaxed italic">"{isPending ? 'Generando assets...' : section.reasoning}"</p>
                  </div>
                  {!isPending && <FaChevronRight className="ml-auto mt-1 text-gray-700 group-hover/sec:text-primary-color transition-all" />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* BOTTOM ACTION BAR */}
      {!previewSectionId && landingState.phase === 'landing' && (
        <div className="mt-8">
          <button
            onClick={onGenerateAds}
            disabled={isDesigning}
            className="w-full py-4 bg-primary-color text-black font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
          >
            {isDesigning ? (
              <>
                <div className="w-3 h-3 border-2 border-black border-t-transparent animate-spin rounded-full"></div>
                Analizando Estrategia de Pauta...
              </>
            ) : (
              <>🚀 Lanzar Estrategia de Pauta Publicitaria</>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default LandingStructure;
