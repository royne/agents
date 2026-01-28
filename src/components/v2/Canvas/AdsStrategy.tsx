import React from 'react';
import { FaMagic, FaRocket, FaImage, FaStop } from 'react-icons/fa';
import { LandingGenerationState, AspectRatio } from '../../../types/image-pro';
import PhoneMockup from './PhoneMockup';
import InstagramPost from '../Dashboard/InstagramPost';

interface AdsStrategyProps {
  landingState: LandingGenerationState;
  onGenerateAds?: () => void;
  setPhase?: (phase: 'landing' | 'ads') => void;
  selectedAdAspect: Record<string, AspectRatio>;
  setSelectedAdAspect: React.Dispatch<React.SetStateAction<Record<string, AspectRatio>>>;
  isGeneratingAsset: boolean;
  setPreviewSectionId: (id: string | null) => void;
  onSelectSection?: (sectionId: string) => void;
  onGenerateAdImage?: (
    conceptId: string,
    visualPrompt: string,
    aspectRatio?: AspectRatio,
    adHook?: string,
    adBody?: string,
    adCta?: string,
    isCorrection?: boolean,
    manualInstructions?: string,
    referenceUrl?: string
  ) => void;
  editingAdId: string | null;
  setEditingAdId: (id: string | null) => void;
  adEditInstructions: Record<string, string>;
  setAdEditInstructions: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onAutoGenerate?: () => void;
  onStopAutoGenerate?: () => void;
  onRefineAdConcept?: (conceptId: string, feedback?: string) => void;
  onAddAdConcept?: () => void;
  onExpandImage?: (url: string) => void;
}

const AdsStrategy: React.FC<AdsStrategyProps> = ({
  landingState,
  onGenerateAds,
  setPhase,
  selectedAdAspect,
  setSelectedAdAspect,
  isGeneratingAsset,
  setPreviewSectionId,
  onSelectSection,
  onGenerateAdImage,
  editingAdId,
  setEditingAdId,
  adEditInstructions,
  setAdEditInstructions,
  onAutoGenerate,
  onStopAutoGenerate,
  onRefineAdConcept,
  onAddAdConcept,
  onExpandImage
}) => {
  const [refiningAdId, setRefiningAdId] = React.useState<string | null>(null);

  const handleRefineCopy = async (conceptId: string) => {
    if (!onRefineAdConcept || isGeneratingAsset || refiningAdId) return;
    setRefiningAdId(conceptId);
    try {
      await onRefineAdConcept(conceptId);
    } finally {
      setRefiningAdId(null);
    }
  };

  return (
    <div className="w-full mt-2 animate-in slide-in-from-bottom duration-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Estrategia de Pauta Publicitaria</h2>
          <div className="flex items-center gap-3">
            <p className="text-white/40 text-[9px] uppercase tracking-widest font-bold">Conceptos de Alto Desempeño</p>
            {landingState.isAutoMode ? (
              <button
                onClick={onStopAutoGenerate}
                className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all group"
              >
                <FaStop className="text-[9px] group-hover:scale-110 transition-transform" /> Detener
              </button>
            ) : (
              <button
                onClick={onAutoGenerate}
                className="flex items-center gap-2 px-3 py-1 bg-primary-color/10 border border-primary-color/20 text-primary-color rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-primary-color hover:text-black transition-all group"
              >
                <FaMagic className="text-[9px] group-hover:animate-pulse" /> Generar Todo
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => onGenerateAds && landingState.phase === 'ads' ? setPhase?.('landing') : null}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase text-white/60 hover:text-white transition-colors"
        >
          Volver a Landing
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-12 items-start max-w-[900px] mx-auto">
        {/* ADS COLUMN */}
        <div className="space-y-6 w-full max-w-[480px]">
          {landingState.adConcepts?.map((concept, idx) => {
            const generation = landingState.adGenerations[concept.id];
            const currentAspect = selectedAdAspect[concept.id] || '1:1';
            const isRefining = refiningAdId === concept.id;

            return (
              <div key={concept.id} className={`p-6 bg-white/[0.03] rounded-[32px] border transition-all group/ad relative overflow-hidden ${isRefining ? 'border-primary-color animate-pulse' : 'border-white/5 hover:border-primary-color/40'}`}>
                {isRefining && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-2">
                    <div className="w-6 h-6 border-2 border-primary-color border-t-transparent animate-spin rounded-full"></div>
                    <span className="text-[8px] font-black text-primary-color uppercase tracking-widest">Refinando Copy...</span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-color/20 flex items-center justify-center text-primary-color font-black text-xs">
                      {idx + 1}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-white font-black uppercase text-[10px] tracking-widest">{concept.title}</h3>
                      <button
                        onClick={() => handleRefineCopy(concept.id)}
                        disabled={isGeneratingAsset || isRefining}
                        className="text-[8px] text-primary-color font-black uppercase tracking-widest flex items-center gap-1.5 hover:opacity-100 opacity-60 transition-all mt-1"
                      >
                        <FaMagic className="text-[8px]" /> Regenerar Copy
                      </button>
                    </div>
                  </div>

                  <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                    {(['1:1', '9:16'] as AspectRatio[]).map(aspect => (
                      <button
                        key={aspect}
                        onClick={() => setSelectedAdAspect(prev => ({ ...prev, [concept.id]: aspect }))}
                        className={`px-3 py-1 rounded-lg text-[8px] font-black transition-all ${currentAspect === aspect ? 'bg-primary-color text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                      >
                        {aspect}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Instagram Mockup Wrapper or Placeholder */}
                  {generation?.imageUrl || generation?.status === 'pending' ? (
                    <InstagramPost
                      imageUrl={generation?.imageUrl || ""}
                      hook={concept.hook}
                      cta={concept.adCta}
                      title={concept.title}
                      aspectRatio={currentAspect}
                      isLoading={generation?.status === 'pending'}
                      onExpand={onExpandImage}
                      className="!max-w-full"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-white/[0.01] rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-3 border border-white/5 border-dashed relative overflow-hidden group/empty">
                      <div className="w-12 h-12 rounded-[20px] bg-white/5 flex items-center justify-center mb-1 group-hover/empty:scale-110 transition-transform duration-500">
                        <FaRocket className="text-sm text-white/20" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Esperando Generación</span>
                        <p className="text-[7px] text-white/10 uppercase font-bold tracking-[0.2em]">Selecciona un estilo o genera de cero abajo</p>
                      </div>
                      {/* Glass effect purely for visual match */}
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/[0.02] to-transparent opacity-50"></div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5 relative group/item">
                      <span className="text-[8px] text-primary-color uppercase font-black block mb-1">Gancho (Hook)</span>
                      <p className="text-xs text-white font-medium italic line-clamp-2">"{concept.hook}"</p>
                    </div>
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5 border-dashed border-primary-color/20 relative group/item">
                      <span className="text-[8px] text-primary-color uppercase font-black block mb-1">Etiqueta Visual (CTA)</span>
                      <p className="text-[10px] text-white font-black uppercase tracking-wider">{concept.adCta || 'SALE'}</p>
                    </div>
                  </div>

                  {(!generation || generation.status === 'failed') ? (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          if (isGeneratingAsset) return;
                          setPreviewSectionId(concept.id);
                          onSelectSection?.(concept.id);
                        }}
                        disabled={isGeneratingAsset}
                        className={`flex-1 py-3 bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${isGeneratingAsset ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
                      >
                        <FaMagic /> Estilo
                      </button>
                      <button
                        onClick={() => {
                          if (isGeneratingAsset) return;
                          onGenerateAdImage?.(concept.id, concept.visualPrompt, currentAspect, concept.hook, concept.body, concept.adCta);
                        }}
                        disabled={isGeneratingAsset}
                        className={`flex-1 py-3 bg-primary-color text-black text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${isGeneratingAsset ? 'opacity-50 cursor-not-allowed' : 'shadow-primary-color/10'}`}
                      >
                        <FaRocket className={isGeneratingAsset ? 'animate-bounce' : ''} />
                        {isGeneratingAsset ? 'IA...' : 'Generar de 0'}
                      </button>
                    </div>
                  ) : generation.status === 'completed' ? (
                    <div className="space-y-3 pt-2">
                      {editingAdId === concept.id ? (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                          <textarea
                            value={adEditInstructions[concept.id] || ''}
                            onChange={(e) => setAdEditInstructions(prev => ({ ...prev, [concept.id]: e.target.value }))}
                            placeholder="Ej: pon el producto más grande, cambia el fondo..."
                            className="w-full h-20 bg-black/40 border border-primary-color/30 rounded-xl p-3 text-[10px] text-white focus:border-primary-color outline-none resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingAdId(null)}
                              className="px-4 py-2 bg-white/5 text-white text-[8px] font-black uppercase rounded-lg"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => {
                                if (isGeneratingAsset) return;
                                onGenerateAdImage?.(concept.id, concept.visualPrompt, currentAspect, concept.hook, concept.body, concept.adCta, true, adEditInstructions[concept.id]);
                                setEditingAdId(null);
                              }}
                              disabled={isGeneratingAsset}
                              className={`flex-1 py-2 bg-primary-color text-black text-[8px] font-black uppercase rounded-lg transition-all ${isGeneratingAsset ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {isGeneratingAsset ? 'Procesando...' : 'Aplicar Cambios'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              if (isGeneratingAsset) return;
                              setEditingAdId(concept.id);
                            }}
                            disabled={isGeneratingAsset}
                            className={`flex-1 py-2 bg-white/5 border border-white/5 text-white text-[8px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2 ${isGeneratingAsset ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
                          >
                            <FaMagic className="text-primary-color" /> Editar IA
                          </button>
                          <button
                            onClick={() => {
                              if (isGeneratingAsset) return;
                              onGenerateAdImage?.(concept.id, concept.visualPrompt, currentAspect, concept.hook, concept.body, concept.adCta);
                            }}
                            disabled={isGeneratingAsset}
                            className={`flex-1 py-2 bg-white/5 border border-white/5 text-white text-[8px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2 ${isGeneratingAsset ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
                          >
                            <FaRocket className={isGeneratingAsset ? 'animate-bounce' : ''} /> Alternativa
                          </button>
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="pt-4 border-t border-white/5">
                    <span className="text-[8px] text-white/30 uppercase font-black block mb-1">Cuerpo del Anuncio</span>
                    <p className="text-[11px] text-white/70 leading-relaxed italic">"{concept.body}"</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* ADD CONCEPT BUTTON - Only visible when all current ads are generated */}
          {landingState.adConcepts && landingState.adConcepts.length > 0 &&
            landingState.adConcepts.every(c => landingState.adGenerations[c.id]?.status === 'completed') && (
              <div className="pt-4 pb-10 animate-in fade-in slide-in-from-bottom-2 duration-1000">
                <button
                  onClick={onAddAdConcept}
                  disabled={isGeneratingAsset}
                  className={`w-full py-4 rounded-[24px] border border-dashed transition-all flex items-center justify-center gap-3 group/add-btn ${isGeneratingAsset
                    ? 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed opacity-50'
                    : 'bg-primary-color/[0.03] border-primary-color/20 text-primary-color/50 hover:text-primary-color hover:border-primary-color/50 hover:bg-primary-color/[0.05]'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${isGeneratingAsset ? 'bg-white/5' : 'bg-primary-color/10 group-hover/add-btn:scale-110'}`}>
                    <FaMagic className={`text-[10px] ${isGeneratingAsset ? 'animate-pulse' : ''}`} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                    {isGeneratingAsset ? 'Generando Contenido...' : 'Crear otro concepto'}
                  </span>
                </button>
              </div>
            )}
        </div>

        {/* MOCKUP COLUMN - Sticky */}
        <div className="lg:sticky lg:top-4 h-fit hidden lg:block">
          <PhoneMockup landingState={landingState} viewMode="landing" onExpandImage={onExpandImage} />
        </div>
      </div>
    </div>
  );
};

export default AdsStrategy;
