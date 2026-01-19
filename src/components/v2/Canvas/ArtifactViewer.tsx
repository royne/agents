import React, { useState, useEffect } from 'react';
import { FaDesktop, FaMobileAlt, FaExpand, FaCheckCircle, FaExclamationTriangle, FaUserAstronaut, FaBullseye, FaInfoCircle, FaMagic, FaRocket, FaChevronRight } from 'react-icons/fa';
import { CreativePath, ProductData, LandingGenerationState } from '../../../types/image-pro';

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
  onGenerateSection?: (sectionId: string, sectionTitle: string, isCorrection?: boolean) => void;
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
  onGenerateSection
}) => {
  const [references, setReferences] = useState<any[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [previewSectionId, setPreviewSectionId] = useState<string | null>(null);
  const [showStrategyPanel, setShowStrategyPanel] = useState(false);

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
  useEffect(() => {
    if (landingState.selectedSectionId) {
      setLoadingRefs(true);
      fetch(`/api/v2/landing/references?sectionId=${landingState.selectedSectionId}`)
        .then(res => res.json())
        .then(res => {
          if (res.success) setReferences(res.data);
          else setReferences([]);
        })
        .catch(() => setReferences([]))
        .finally(() => setLoadingRefs(false));
    }
  }, [landingState.selectedSectionId]);

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
              <div className="flex justify-center pt-8">
                <button
                  onClick={() => {
                    const section = landingState.proposedStructure?.sections.find(s => s.sectionId === landingState.selectedSectionId);
                    if (section) onGenerateSection?.(section.sectionId, section.title);
                    onSelectSection?.(''); // Return to list after starting
                  }}
                  className="px-12 py-4 bg-primary-color text-black font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-primary-color/20 translate-in-bottom"
                >
                  <FaRocket className="inline mr-2" /> Iniciar Generación de Assets
                </button>
              </div>
            )}
          </div>
        ) : previewSectionId && landingState.generations[previewSectionId]?.status === 'completed' ? (
          <div key={previewSectionId} className="w-full max-w-5xl h-full flex flex-col md:flex-row gap-8 animate-in fade-in zoom-in duration-500 p-4">
            {/* Left: Huge Preview */}
            <div className="flex-1 bg-black/40 rounded-[32px] overflow-hidden border border-white/5 relative group/preview">
              <img
                src={landingState.generations[previewSectionId].imageUrl}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-4 left-4 p-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-[10px] font-black uppercase text-primary-color tracking-widest shadow-2xl">
                9:16 Mobile Optimized
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

              {/* Direct Edit Button (From Chat) */}
              {landingState.proposedStructure?.sections.find(s => s.sectionId.toLowerCase() === previewSectionId.toLowerCase())?.extraInstructions ? (
                <div className="space-y-2">
                  <p className="text-[9px] text-primary-color font-black uppercase text-center animate-pulse">¡Instrucciones del Chat listas!</p>
                  <button
                    onClick={() => {
                      const section = landingState.proposedStructure?.sections.find(s => s.sectionId.toLowerCase() === previewSectionId.toLowerCase());
                      if (section) onGenerateSection?.(section.sectionId, section.title, true); // true = isCorrection
                      setPreviewSectionId(null);
                    }}
                    className="w-full py-5 bg-primary-color text-black font-extrabold text-[12px] uppercase tracking-widest rounded-3xl transition-all shadow-[0_0_30px_rgba(18,216,250,0.4)] hover:scale-[1.03] active:scale-95 border-2 border-white/30 flex items-center justify-center gap-3"
                  >
                    <FaMagic className="text-lg animate-pulse" /> APLICAR CAMBIOS DEL CHAT
                  </button>
                </div>
              ) : (
                /* Show a subtle Edit button even if no pending instruction, to allow manual re-generation without carousel if desired? 
                   Actually, the user specifically wants the chat-triggered one. */
                null
              )}

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
        ) : landingState.proposedStructure ? (
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

                        {/* Edit Indicator Badge & Quick Action */}
                        {section.extraInstructions && (
                          <div className="absolute top-4 right-4 flex flex-col items-end gap-3 z-20 animate-in fade-in zoom-in duration-300">
                            <div className="px-3 py-1 bg-primary-color text-black text-[10px] font-black uppercase tracking-tighter rounded-full shadow-[0_0_20px_rgba(18,216,250,0.5)] border border-white/20 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                              Edición Lista
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onGenerateSection?.(section.sectionId, section.title, true);
                              }}
                              className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-wider rounded-2xl shadow-2xl hover:bg-primary-color hover:scale-105 transition-all flex items-center gap-2 border-2 border-primary-color/20"
                            >
                              <FaMagic className="animate-spin-slow" /> Aplicar Edición (Chat)
                            </button>
                          </div>
                        )}

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

            <div className="bg-primary-color/5 border border-primary-color/10 p-4 rounded-xl text-center">
              <p className="text-[9px] text-primary-color font-bold uppercase tracking-widest">Haz clic en una sección para elegir su estilo visual y empezar la generación</p>
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
                    <span className="text-[9px] font-black text-primary-color uppercase tracking-widest mb-1 block">{path.package.style}</span>
                    <h3 className="text-lg font-bold text-white mb-2">{path.package.name}</h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed mb-4">{path.package.description}</p>
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
