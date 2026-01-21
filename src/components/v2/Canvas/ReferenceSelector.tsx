import React from 'react';
import { FaChevronRight, FaExpand, FaRocket, FaMagic } from 'react-icons/fa';
import { LandingGenerationState, AspectRatio, ProductData } from '../../../types/image-pro';

interface ReferenceSelectorProps {
  landingState: LandingGenerationState;
  loadingRefs: boolean;
  references: any[];
  isGeneratingAsset: boolean;
  selectedAdAspect: Record<string, AspectRatio>;
  selectedSectionAspect: Record<string, AspectRatio>;
  onSelectSection?: (sectionId: string) => void;
  onSelectReference?: (url: string) => void;
  setFullScreenImageUrl: (url: string | null) => void;
  setSelectedAdAspect: React.Dispatch<React.SetStateAction<Record<string, AspectRatio>>>;
  setSelectedSectionAspect: React.Dispatch<React.SetStateAction<Record<string, AspectRatio>>>;
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
  onGenerateSection?: (sectionId: string, sectionTitle: string, isCorrection?: boolean, manualInstructions?: string, aspectRatio?: AspectRatio) => void;
}

const ReferenceSelector: React.FC<ReferenceSelectorProps> = ({
  landingState,
  loadingRefs,
  references,
  isGeneratingAsset,
  selectedAdAspect,
  selectedSectionAspect,
  onSelectSection,
  onSelectReference,
  setFullScreenImageUrl,
  setSelectedAdAspect,
  setSelectedSectionAspect,
  onGenerateAdImage,
  onGenerateSection
}) => {
  const [manualInstructions, setManualInstructions] = React.useState('');

  return (
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
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary-color border-t-transparent animate-spin rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {references.map((ref, idx) => (
            <div
              key={idx}
              className={`relative aspect-video rounded-2xl overflow-hidden border-2 transition-all group/ref ${landingState.selectedReferenceUrl === ref.url
                ? 'border-primary-color shadow-[0_0_20px_rgba(18,216,250,0.3)]'
                : 'border-white/5 hover:border-white/20'
                }`}
            >
              <img
                src={ref.url}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => onSelectReference?.(ref.url)}
              />

              <div className="absolute top-2 right-2 opacity-0 group-hover/ref:opacity-100 transition-opacity z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullScreenImageUrl(ref.url);
                  }}
                  className="p-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/20 text-white hover:bg-primary-color hover:text-black transition-all shadow-xl"
                  title="Ver pantalla completa"
                >
                  <FaExpand className="text-[10px]" />
                </button>
              </div>

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/ref:opacity-100 transition-opacity flex items-center justify-center cursor-pointer pointer-events-none">
                <span className="text-[9px] font-black text-black uppercase tracking-widest bg-primary-color/90 px-4 py-2 rounded-lg">Usar este estilo</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {landingState.selectedReferenceUrl && (
        <div className="flex flex-col items-center gap-6 pt-8">
          {/* Aspect Ratio Selector */}
          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
            {(['1:1', '9:16'] as AspectRatio[]).map(aspect => {
              const defaultAspect = landingState.phase === 'ads' ? '1:1' : '9:16';
              const currentAspect = (landingState.phase === 'ads'
                ? selectedAdAspect[landingState.selectedSectionId!]
                : selectedSectionAspect[landingState.selectedSectionId!]) || defaultAspect;

              return (
                <button
                  key={aspect}
                  onClick={() => {
                    if (landingState.phase === 'ads') {
                      setSelectedAdAspect(prev => ({ ...prev, [landingState.selectedSectionId!]: aspect }));
                    } else {
                      setSelectedSectionAspect(prev => ({ ...prev, [landingState.selectedSectionId!]: aspect }));
                    }
                  }}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${currentAspect === aspect
                    ? 'bg-primary-color text-black shadow-lg shadow-primary-color/20'
                    : 'text-white/40 hover:text-white'
                    }`}
                >
                  {aspect === '1:1' ? <div className="w-2 h-2 border border-current rounded-sm" /> : <div className="w-2 h-3.5 border border-current rounded-sm" />}
                  {aspect}
                </button>
              );
            })}
          </div>

          {/* Manual Instructions Field */}
          <div className="w-full max-w-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-primary-color uppercase tracking-widest flex items-center gap-2">
                <FaMagic className="text-[10px]" /> Instrucciones adicionales (opcional)
              </span>
            </div>
            <textarea
              value={manualInstructions}
              onChange={(e) => setManualInstructions(e.target.value)}
              placeholder="Ej: menciona que el envío es gratis, destaca el color rojo..."
              className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white focus:border-primary-color outline-none resize-none transition-all v2-scrollbar placeholder:text-white/20"
            />
          </div>

          <button
            onClick={() => {
              if (isGeneratingAsset) return;
              const defaultAspect = landingState.phase === 'ads' ? '1:1' : '9:16';

              if (landingState.phase === 'ads') {
                const concept = landingState.adConcepts?.find(c => c.id === landingState.selectedSectionId);
                if (concept) {
                  onGenerateAdImage?.(
                    concept.id,
                    concept.visualPrompt,
                    selectedAdAspect[concept.id] || defaultAspect,
                    concept.hook,
                    concept.body,
                    concept.adCta,
                    false,
                    manualInstructions,
                    landingState.selectedReferenceUrl || undefined
                  );
                }
              } else {
                const section = landingState.proposedStructure?.sections.find(s => s.sectionId === landingState.selectedSectionId);
                if (section) onGenerateSection?.(section.sectionId, section.title, false, manualInstructions, selectedSectionAspect[section.sectionId] || defaultAspect);
              }
              onSelectSection?.(''); // Return to list after starting
            }}
            disabled={isGeneratingAsset}
            className={`px-12 py-4 bg-primary-color text-black font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-2xl translate-in-bottom ${isGeneratingAsset
              ? 'opacity-50 cursor-not-allowed grayscale'
              : 'hover:scale-105 shadow-primary-color/20'
              }`}
          >
            <FaRocket className={`inline mr-2 ${isGeneratingAsset ? 'animate-bounce' : ''}`} />
            {isGeneratingAsset ? 'Procesando otros assets...' : 'Iniciar Generación de Assets'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReferenceSelector;
