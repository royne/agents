import React from 'react';
import { FaMagic, FaRocket, FaImage } from 'react-icons/fa';
import { LandingGenerationState, AspectRatio } from '../../../types/image-pro';
import PhoneMockup from './PhoneMockup';

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
  setAdEditInstructions
}) => {
  return (
    <div className="w-full mt-8 animate-in slide-in-from-bottom duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Estrategia de Pauta Publicitaria</h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">3 Conceptos de Alto Desempeño para Facebook Ads</p>
        </div>
        <button
          onClick={() => onGenerateAds && landingState.phase === 'ads' ? setPhase?.('landing') : null}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase text-white/60 hover:text-white transition-colors"
        >
          Volver a Landing
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* ADS COLUMN */}
        <div className="space-y-6">
          {landingState.adConcepts?.map((concept, idx) => {
            const generation = landingState.adGenerations[concept.id];
            const currentAspect = selectedAdAspect[concept.id] || '1:1';

            return (
              <div key={concept.id} className="p-6 bg-white/5 rounded-[32px] border border-white/5 hover:border-primary-color/40 transition-all group/ad">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-color/20 flex items-center justify-center text-primary-color font-black text-xs">
                      {idx + 1}
                    </div>
                    <h3 className="text-white font-black uppercase text-xs tracking-widest">{concept.title}</h3>
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
                  {generation?.status === 'completed' && (
                    <div className={`w-full overflow-hidden rounded-2xl border border-white/10 ${generation.aspectRatio === '1:1' ? 'aspect-square' : 'aspect-[9/16]'}`}>
                      <img src={generation.imageUrl} className="w-full h-full object-cover" alt="Generated Ad" />
                    </div>
                  )}

                  {generation?.status === 'pending' && (
                    <div className="w-full aspect-square bg-black/40 rounded-2xl flex flex-col items-center justify-center space-y-3 animate-pulse">
                      <div className="w-8 h-8 border-2 border-primary-color border-t-transparent animate-spin rounded-full"></div>
                      <span className="text-[8px] font-black text-primary-color uppercase tracking-widest">Generando Asset...</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                      <span className="text-[8px] text-primary-color uppercase font-black block mb-1">Gancho (Hook)</span>
                      <p className="text-sm text-white font-medium italic">"{concept.hook}"</p>
                    </div>
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5 border-dashed border-primary-color/20">
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
                        <FaMagic /> Con Referencia
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
                        {isGeneratingAsset ? 'Procesando...' : 'Generar de 0'}
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
                            <FaRocket className={isGeneratingAsset ? 'animate-bounce' : ''} /> Volver a Generar
                          </button>
                          <button
                            onClick={() => {
                              if (isGeneratingAsset) return;
                              setPreviewSectionId(concept.id);
                              onSelectSection?.(concept.id);
                            }}
                            disabled={isGeneratingAsset}
                            className={`flex-1 py-2 bg-white/5 border border-white/5 text-white text-[8px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2 ${isGeneratingAsset ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
                          >
                            <FaImage /> Nueva Referencia
                          </button>
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="pt-4 border-t border-white/5">
                    <span className="text-[8px] text-white/30 uppercase font-black block mb-1">Cuerpo del Anuncio</span>
                    <p className="text-xs text-white/80 leading-relaxed">{concept.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* MOCKUP COLUMN */}
        <PhoneMockup landingState={landingState} />
      </div>
    </div>
  );
};

export default AdsStrategy;
