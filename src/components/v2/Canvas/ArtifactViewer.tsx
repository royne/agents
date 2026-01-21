import React, { useState, useEffect } from 'react';
import { FaDesktop, FaMobileAlt, FaExpand, FaCheckCircle, FaExclamationTriangle, FaUserAstronaut, FaBullseye, FaInfoCircle, FaMagic, FaRocket, FaChevronRight, FaEdit, FaImage } from 'react-icons/fa';
import { CreativePath, ProductData, LandingGenerationState, AspectRatio } from '../../../types/image-pro';

interface ArtifactViewerProps {
  data: ProductData | null;
  creativePaths: CreativePath[] | null;
  landingState: LandingGenerationState;
  isLoading: boolean;
  isRecommending?: boolean;
  isDesigning?: boolean;
  error: string | null;
  onConfirmDiscovery?: () => void;
  onSelectPath?: (path: CreativePath) => void;
  onSelectSection?: (sectionId: string) => void;
  onSelectReference?: (url: string) => void;
  onGenerateSection?: (sectionId: string, sectionTitle: string, isCorrection?: boolean, manualInstructions?: string, aspectRatio?: AspectRatio) => void;
  onGenerateAds?: () => void;
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
  setPhase?: (phase: 'landing' | 'ads') => void;
}

const ArtifactViewer: React.FC<ArtifactViewerProps> = ({
  data,
  creativePaths,
  landingState,
  isLoading,
  isRecommending,
  isDesigning,
  error,
  onConfirmDiscovery,
  onSelectPath,
  onSelectSection,
  onSelectReference,
  onGenerateSection,
  onGenerateAds,
  onGenerateAdImage,
  setPhase
}: ArtifactViewerProps) => {
  const [references, setReferences] = useState<any[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [previewSectionId, setPreviewSectionId] = useState<string | null>(null);
  const [adEditInstructions, setAdEditInstructions] = useState<Record<string, string>>({});
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [showStrategyPanel, setShowStrategyPanel] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editInstructions, setEditInstructions] = useState('');
  const [selectedSectionAspect, setSelectedSectionAspect] = useState<Record<string, AspectRatio>>({});

  useEffect(() => {
    console.log('[ArtifactViewer] Data Prop Updated:', data?.name, data?.angle);
  }, [data]);

  // Debug: Log structure changes
  useEffect(() => {
    if (landingState.proposedStructure) {
      console.log('[ArtifactViewer] Structure Update Detected:', landingState.proposedStructure.sections.map(s => ({ id: s.sectionId, instr: !!s.extraInstructions })));
    }
  }, [landingState.proposedStructure]);

  // Fetch references when a section is selected
  const [selectedAdAspect, setSelectedAdAspect] = useState<Record<string, AspectRatio>>({});

  useEffect(() => {
    if (landingState.selectedSectionId) {
      setLoadingRefs(true);

      const endpoint = landingState.phase === 'ads'
        ? '/api/v2/ads/references'
        : `/api/v2/landing/references?sectionId=${landingState.selectedSectionId}`;

      fetch(endpoint)
        .then(res => res.json())
        .then(res => {
          if (res.success) setReferences(res.data);
          else setReferences([]);
        })
        .catch(() => setReferences([]))
        .finally(() => setLoadingRefs(false));
    }
  }, [landingState.selectedSectionId, landingState.phase]);

  return (
    <div className="w-full max-w-5xl h-[80vh] bg-theme-component/30 backdrop-blur-3xl border border-white/10 rounded-[30px] shadow-2xl flex flex-col overflow-hidden group">
      {/* Canvas Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5 font-bold text-[10px] text-gray-500 bg-black/40 p-1 rounded-lg">
            <button className="p-1 px-3 bg-white/10 text-white rounded-md flex items-center gap-2 transition-all">
              <FaDesktop /> Desktop
            </button>
            <button
              onClick={() => setShowStrategyPanel(!showStrategyPanel)}
              className={`p-1 px-3 flex items-center gap-2 transition-all rounded-md ${showStrategyPanel ? 'bg-primary-color/20 text-primary-color font-bold' : 'hover:text-white'}`}
            >
              <FaBullseye /> Estrategia
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(isLoading || isDesigning) && <span className="text-[10px] font-black uppercase tracking-widest text-primary-color animate-pulse flex items-center gap-2">
            <div className="w-2 h-2 bg-primary-color rounded-full animate-ping"></div>
            {isRecommending ? 'Diseñando Caminos...' : isDesigning ? 'Estructurando Landing...' : 'Analizando estrategia...'}
          </span>}
          {data && !creativePaths && !isLoading && <span className="text-[10px] font-black uppercase tracking-widest text-green-400 flex items-center gap-2">
            <FaCheckCircle /> ADN Detectado
          </span>}
          {creativePaths && !landingState.proposedStructure && <span className="text-[10px] font-black uppercase tracking-widest text-primary-color flex items-center gap-2">
            <FaMagic /> Selección Creativa
          </span>}
          {landingState.proposedStructure && <span className="text-[10px] font-black uppercase tracking-widest text-primary-color flex items-center gap-2">
            <FaRocket /> Diseño de Estructura
          </span>}
          <button className="p-2 text-gray-500 hover:text-white">
            <FaExpand />
          </button>
        </div>
      </div>

      {/* Actual Content Area */}
      <div className="flex-1 bg-[#05070A] relative flex flex-col items-center justify-start overflow-y-auto v2-scrollbar p-8 pt-12">
        {isLoading || isDesigning ? (
          <div className="text-center space-y-8 animate-pulse">
            <div className="relative">
              <div className="w-32 h-32 bg-primary-color/10 rounded-full flex items-center justify-center mx-auto border border-primary-color/20 relative z-10">
                <FaMagic className="text-5xl text-primary-color/40" />
              </div>
              <div className="absolute inset-0 w-32 h-32 border-2 border-primary-color border-t-transparent animate-spin rounded-full mx-auto"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight text-white">
                {isRecommending ? 'Analizando Caminos Creativos' : isDesigning ? 'Estructurando tu Landing' : 'Extrayendo ADN del Producto'}
              </h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                {isRecommending ? 'El Director Creativo está seleccionando las mejores referencias...' : isDesigning ? 'El Arquitecto está diseñando la secuencia de conversión...' : 'Identificando identidad, audiencia y estrategia...'}
              </p>
            </div>
          </div>
        ) : landingState.selectedSectionId ? (
          <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => onSelectSection?.('')}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all"
              >
                <FaChevronRight className="rotate-180" />
              </button>
              <div>
                <h2 className="text-2xl font-black text-white">Elige la Referencia Visual</h2>
                <p className="text-xs text-primary-color uppercase tracking-widest font-bold">Sección: {landingState.selectedSectionId}</p>
              </div>
            </div>

            {loadingRefs ? (
              <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-color border-t-transparent animate-spin rounded-full"></div></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {references.map((ref, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectReference?.(ref.url)}
                    className={`relative aspect-video rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group/ref ${landingState.selectedReferenceUrl === ref.url ? 'border-primary-color shadow-[0_0_20px_rgba(18,216,250,0.3)]' : 'border-white/5 hover:border-white/20'}`}
                  >
                    <img src={ref.url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/ref:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[9px] font-black text-white uppercase tracking-widest bg-primary-color/80 px-4 py-2 rounded-lg text-black">Usar este estilo</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {landingState.selectedReferenceUrl && (
              <div className="flex flex-col items-center gap-6 pt-8">
                {/* Aspect Ratio Selector for Landing */}
                <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
                  {(['1:1', '9:16'] as AspectRatio[]).map(aspect => (
                    <button
                      key={aspect}
                      onClick={() => setSelectedSectionAspect(prev => ({ ...prev, [landingState.selectedSectionId!]: aspect }))}
                      className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${(selectedSectionAspect[landingState.selectedSectionId!] || '9:16') === aspect ? 'bg-primary-color text-black shadow-lg shadow-primary-color/20' : 'text-white/40 hover:text-white'}`}
                    >
                      {aspect === '1:1' ? <div className="w-2 h-2 border border-current rounded-sm" /> : <div className="w-2 h-3.5 border border-current rounded-sm" />}
                      {aspect}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const section = landingState.proposedStructure?.sections.find(s => s.sectionId === landingState.selectedSectionId);
                    if (section) onGenerateSection?.(section.sectionId, section.title, false, '', selectedSectionAspect[section.sectionId] || '9:16');
                    onSelectSection?.(''); // Return to list after starting
                  }}
                  className="px-12 py-4 bg-primary-color text-black font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-primary-color/20 translate-in-bottom"
                >
                  <FaRocket className="inline mr-2" /> Iniciar Generación de Assets
                </button>
              </div>
            )}
          </div>
        ) : previewSectionId && (landingState.generations[previewSectionId]?.status === 'completed' || landingState.generations[previewSectionId]?.status === 'pending') ? (
          <div key={previewSectionId} className="w-full max-w-5xl h-full flex flex-col md:flex-row gap-8 animate-in fade-in zoom-in duration-500 p-4">
            {/* Left: Huge Preview */}
            <div className="flex-1 bg-black/40 rounded-[32px] overflow-hidden border border-white/5 relative group/preview">
              {landingState.generations[previewSectionId].status === 'pending' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20 space-y-4">
                  <div className="w-12 h-12 border-4 border-primary-color border-t-transparent animate-spin rounded-full"></div>
                  <p className="text-[10px] font-black text-primary-color uppercase tracking-widest animate-pulse">Generando nueva versión...</p>
                </div>
              ) : null}
              <img
                src={landingState.generations[previewSectionId].imageUrl || 'https://via.placeholder.com/1080x1920?text=Generando...'}
                className={`w-full h-full object-contain ${landingState.generations[previewSectionId].status === 'pending' ? 'opacity-40 grayscale' : ''}`}
              />
              <div className="absolute top-4 left-4 p-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-[10px] font-black uppercase text-primary-color tracking-widest shadow-2xl">
                {landingState.generations[previewSectionId].aspectRatio || '9:16'} {(landingState.generations[previewSectionId].aspectRatio || '9:16') === '9:16' ? 'Mobile Optimized' : 'Square Format'}
              </div>
            </div>

            {/* Right: Content & Controls */}
            <div className="w-full md:w-80 flex flex-col gap-6">
              <button
                onClick={() => setPreviewSectionId(null)}
                className="flex items-center gap-3 text-gray-500 hover:text-white transition-all group/back"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/back:bg-white/10">
                  <FaChevronRight className="rotate-180" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Volver a la estructura</span>
              </button>

              <div className="space-y-6 bg-white/5 p-6 rounded-[32px] border border-white/10">
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-primary-color uppercase tracking-widest">Copy Persuasivo</span>
                  <h3 className="text-xl font-black text-white leading-tight">
                    {landingState.generations[previewSectionId].copy.headline}
                  </h3>
                </div>

                <p className="text-sm text-gray-400 leading-relaxed font-medium">
                  {landingState.generations[previewSectionId].copy.body}
                </p>

                {landingState.generations[previewSectionId].copy.cta && (
                  <div className="pt-4">
                    <button className="w-full py-4 bg-primary-color text-black font-black rounded-2xl text-[10px] uppercase tracking-widest">
                      {landingState.generations[previewSectionId].copy.cta}
                    </button>
                  </div>
                )}
              </div>

              {/* Manual Local Edit UI */}
              <div className="space-y-4">
                {editingSectionId === previewSectionId ? (
                  <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-primary-color/30 animate-in fade-in zoom-in duration-300">
                    <span className="text-[10px] font-black text-primary-color uppercase tracking-widest">Instrucciones de Edición</span>
                    <textarea
                      value={editInstructions}
                      onChange={(e) => setEditInstructions(e.target.value)}
                      placeholder="Ej: pon el fondo rosa, cambia el precio a $99..."
                      className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-primary-color outline-none resize-none v2-scrollbar"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          console.log('[ArtifactViewer] Applying Manual Edit for Section:', previewSectionId, 'Instructions:', editInstructions);
                          if (previewSectionId) {
                            onGenerateSection?.(
                              previewSectionId,
                              landingState.generations[previewSectionId]?.copy?.headline || 'Sección',
                              true,
                              editInstructions,
                              landingState.generations[previewSectionId]?.aspectRatio || '9:16'
                            );
                          }
                          setEditingSectionId(null);
                          setEditInstructions('');
                          // setPreviewSectionId(null); 
                        }}
                        disabled={!editInstructions.trim()}
                        className="flex-1 py-2 bg-primary-color text-black font-black rounded-xl text-[9px] uppercase tracking-widest disabled:opacity-50"
                      >
                        Aplicar
                      </button>
                      <button
                        onClick={() => {
                          setEditingSectionId(null);
                          setEditInstructions('');
                        }}
                        className="px-4 py-2 bg-white/5 text-gray-400 font-bold rounded-xl text-[9px] uppercase tracking-widest hover:text-white"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingSectionId(previewSectionId);
                      setEditInstructions('');
                    }}
                    className="w-full py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <FaEdit /> Editar esta imagen
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  setPreviewSectionId(null);
                  onSelectSection?.(previewSectionId);
                }}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-[10px] uppercase tracking-widest rounded-2xl transition-all"
              >
                Regenerar con otro estilo
              </button>
            </div>
          </div>
        ) : landingState.proposedStructure && landingState.phase === 'landing' ? (
          <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom duration-1000">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-black text-white">Estructura Estratégica</h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">He diseñado este flujo de conversión personalizado</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {landingState.proposedStructure!.sections.map((section, idx) => {
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
                    className={`bg-white/5 border rounded-[32px] overflow-hidden flex flex-col transition-all group/sec cursor-pointer hover:bg-white/[0.08] min-h-[160px] ${isPending ? 'border-primary-color/50 animate-pulse' : isCompleted ? 'border-green-500/30' : 'border-white/10 hover:border-primary-color/50'}`}
                  >
                    {isCompleted && generation.imageUrl ? (
                      <div className="h-64 w-full relative overflow-hidden">
                        <img src={generation.imageUrl} className="w-full h-full object-cover object-top" />

                        {/* Remove chat-driven indicators as per user request */}

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

            {/* BOTTOM ACTION BAR - TEST MODE: Button always visible if structure exists */}
            {!previewSectionId && landingState.phase === 'landing' && (
              <div className="mt-8">
                {landingState.proposedStructure && (
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
                )}
              </div>
            )}
          </div>
        ) : landingState.proposedStructure && landingState.phase === 'ads' ? (
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

                        {/* Aspect Ratio Selector */}
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
                        {/* Preview if generated */}
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
                                setPreviewSectionId(concept.id); // Reference selection mode
                                onSelectSection?.(concept.id);
                              }}
                              className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                              <FaMagic /> Con Referencia
                            </button>
                            <button
                              onClick={() => onGenerateAdImage?.(concept.id, concept.visualPrompt, currentAspect, concept.hook, concept.body, concept.adCta)}
                              className="flex-1 py-3 bg-primary-color text-black text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary-color/10 flex items-center justify-center gap-2"
                            >
                              <FaRocket /> Generar de 0
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
                                      onGenerateAdImage?.(concept.id, concept.visualPrompt, currentAspect, concept.hook, concept.body, concept.adCta, true, adEditInstructions[concept.id]);
                                      setEditingAdId(null);
                                    }}
                                    className="flex-1 py-2 bg-primary-color text-black text-[8px] font-black uppercase rounded-lg transition-all"
                                  >
                                    Aplicar Cambios
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => setEditingAdId(concept.id)}
                                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white text-[8px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                  <FaMagic className="text-primary-color" /> Editar IA
                                </button>
                                <button
                                  onClick={() => onGenerateAdImage?.(concept.id, concept.visualPrompt, currentAspect, concept.hook, concept.body, concept.adCta)}
                                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white text-[8px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                  <FaRocket /> Volver a Generar
                                </button>
                                <button
                                  onClick={() => {
                                    setPreviewSectionId(concept.id);
                                    onSelectSection?.(concept.id);
                                  }}
                                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white text-[8px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2"
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
            </div>
          </div>
        ) : creativePaths ? (
          <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom duration-1000">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-black text-white">Elige tu Camino Creativo</h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">La IA ha seleccionado 3 estrategias maestras para tu producto</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {creativePaths!.map((path, idx) => (
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
        ) : data ? (
          <div className="w-full max-w-3xl space-y-10 animate-in fade-in slide-in-from-bottom duration-1000">
            {/* Strategy Card */}
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-color/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>

              <div className="flex flex-col md:flex-row gap-8 relative z-10">
                <div className="flex-1 space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-primary-color uppercase tracking-widest mb-2 block">Producto Detectado</span>
                    <h2 className="text-3xl font-black text-white leading-tight">{data!.name}</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-primary-color/30 transition-all group/item">
                      <div className="flex items-center gap-2 mb-3">
                        <FaBullseye className="text-primary-color" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Ángulo de Venta</span>
                      </div>
                      <p className="text-sm font-bold text-gray-100 leading-relaxed">{data!.angle}</p>
                    </div>

                    <div className="bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-primary-color/30 transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <FaUserAstronaut className="text-primary-color" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Buyer Persona</span>
                      </div>
                      <p className="text-sm font-bold text-gray-100 leading-relaxed">{data!.buyer}</p>
                    </div>
                  </div>

                  <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <FaInfoCircle className="text-primary-color" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">ADN Visual y Detalles</span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{data!.details}</p>
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
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-bold tracking-tight text-white">Tu Mesa de Trabajo</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                Los activos generados aparecerán aquí. Inicia pegando una URL o subiendo una imagen del producto en el chat.
              </p>
            </div>
          </div>
        )}

        {/* Strategy Sidebar Panel */}
        {showStrategyPanel && data && (
          <div className="absolute top-24 right-8 w-72 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-right-4 fade-in duration-500 z-50 overflow-y-auto max-h-[70%]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-primary-color uppercase tracking-widest">Estrategia Actual</h3>
              <button
                onClick={() => setShowStrategyPanel(false)}
                className="text-gray-500 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Producto</span>
                <p className="text-sm font-bold text-white leading-tight">{data.name}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Ángulo de Venta</span>
                <p className="text-xs font-medium text-gray-300 leading-relaxed">{data.angle}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Buyer Persona</span>
                <p className="text-xs font-medium text-gray-300 leading-relaxed">{data.buyer}</p>
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-[9px] text-gray-500 italic leading-relaxed">
                  Puedes pedir al estratega que cambie el ángulo o el público objetivo en cualquier momento desde el chat.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtifactViewer;
