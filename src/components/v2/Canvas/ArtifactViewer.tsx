import React, { useState, useEffect } from 'react';
import { FaMagic } from 'react-icons/fa';
import { CreativePath, ProductData, LandingGenerationState, AspectRatio } from '../../../types/image-pro';

// Sub-components
import CanvasHeader from './CanvasHeader';
import CanvasLoading from './CanvasLoading';
import CanvasError from './CanvasError';
import PathSelector from './PathSelector';
import DiscoveryPanel from './DiscoveryPanel';
import LandingStructure from './LandingStructure';
import ReferenceSelector from './ReferenceSelector';
import SectionPreview from './SectionPreview';
import AdsStrategy from './AdsStrategy';
import StrategyPanel from './StrategyPanel';
import FullScreenPreview from './FullScreenPreview';

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
  onAutoGenerate?: () => void;
  onStopAutoGenerate?: () => void;
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
  onAutoGenerate,
  onStopAutoGenerate,
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
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState<string | null>(null);
  const [selectedAdAspect, setSelectedAdAspect] = useState<Record<string, AspectRatio>>({});

  // Global generation state check
  const isGeneratingAsset = Object.values(landingState.generations).some(g => g.status === 'pending') ||
    Object.values(landingState.adGenerations).some(g => g.status === 'pending');

  // Fetch references when a section is selected
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
      <CanvasHeader
        data={data}
        creativePaths={creativePaths}
        landingState={landingState}
        isLoading={isLoading}
        isRecommending={isRecommending}
        isDesigning={isDesigning}
        showStrategyPanel={showStrategyPanel}
        setShowStrategyPanel={setShowStrategyPanel}
      />

      <div className="flex-1 bg-[#05070A] relative flex flex-col items-center justify-start overflow-y-auto v2-scrollbar p-8 pt-12">
        {isLoading || isDesigning ? (
          <CanvasLoading isRecommending={isRecommending} isDesigning={isDesigning} />
        ) : landingState.selectedSectionId ? (
          <ReferenceSelector
            landingState={landingState}
            loadingRefs={loadingRefs}
            references={references}
            isGeneratingAsset={isGeneratingAsset}
            selectedAdAspect={selectedAdAspect}
            selectedSectionAspect={selectedSectionAspect}
            onSelectSection={onSelectSection}
            onSelectReference={onSelectReference}
            setFullScreenImageUrl={setFullScreenImageUrl}
            setSelectedAdAspect={setSelectedAdAspect}
            setSelectedSectionAspect={setSelectedSectionAspect}
            onGenerateAdImage={onGenerateAdImage}
            onGenerateSection={onGenerateSection}
          />
        ) : previewSectionId && (landingState.generations[previewSectionId]?.status === 'completed' || landingState.generations[previewSectionId]?.status === 'pending') ? (
          <SectionPreview
            previewSectionId={previewSectionId}
            landingState={landingState}
            isGeneratingAsset={isGeneratingAsset}
            editingSectionId={editingSectionId}
            editInstructions={editInstructions}
            setPreviewSectionId={setPreviewSectionId}
            setEditingSectionId={setEditingSectionId}
            setEditInstructions={setEditInstructions}
            onGenerateSection={onGenerateSection}
            onSelectSection={onSelectSection}
          />
        ) : landingState.proposedStructure && landingState.phase === 'landing' ? (
          <LandingStructure
            landingState={landingState}
            isDesigning={isDesigning}
            onSelectSection={onSelectSection}
            setPreviewSectionId={setPreviewSectionId}
            onGenerateAds={onGenerateAds}
            onAutoGenerate={onAutoGenerate}
            onStopAutoGenerate={onStopAutoGenerate}
            previewSectionId={previewSectionId}
          />
        ) : landingState.proposedStructure && landingState.phase === 'ads' ? (
          <AdsStrategy
            landingState={landingState}
            onGenerateAds={onGenerateAds}
            setPhase={setPhase}
            selectedAdAspect={selectedAdAspect}
            setSelectedAdAspect={setSelectedAdAspect}
            isGeneratingAsset={isGeneratingAsset}
            setPreviewSectionId={setPreviewSectionId}
            onSelectSection={onSelectSection}
            onGenerateAdImage={onGenerateAdImage}
            onAutoGenerate={onAutoGenerate}
            onStopAutoGenerate={onStopAutoGenerate}
            editingAdId={editingAdId}
            setEditingAdId={setEditingAdId}
            adEditInstructions={adEditInstructions}
            setAdEditInstructions={setAdEditInstructions}
          />
        ) : creativePaths ? (
          <PathSelector creativePaths={creativePaths} onSelectPath={onSelectPath} />
        ) : data ? (
          <DiscoveryPanel data={data} onConfirmDiscovery={onConfirmDiscovery} />
        ) : error ? (
          <CanvasError error={error} />
        ) : (
          <div className="text-center space-y-8 animate-in fade-in zoom-in duration-1000 pt-24">
            <div className="relative">
              <div className="w-32 h-32 bg-primary-color/5 rounded-full flex items-center justify-center mx-auto border border-primary-color/10 group-hover:scale-110 transition-transform duration-700">
                <FaMagic className="text-4xl text-primary-color/30" />
              </div>
              <div className="absolute inset-0 border-2 border-primary-color/20 border-dashed rounded-full animate-[spin_10s_linear_infinite]"></div>
            </div>
            <div className="space-y-4 text-center">
              <h3 className="text-3xl font-black tracking-tighter text-white">Tu Mesa de Trabajo</h3>
              <p className="text-base text-gray-400 mt-4 max-w-sm mx-auto leading-relaxed">
                Los activos generados aparecerán aquí. Inicia subiendo una <span className="text-primary-color font-bold">Imagen</span> de tu producto en el chat de la izquierda.
              </p>
            </div>
          </div>
        )}

        <StrategyPanel showStrategyPanel={showStrategyPanel} setShowStrategyPanel={setShowStrategyPanel} data={data} />
        <FullScreenPreview fullScreenImageUrl={fullScreenImageUrl} setFullScreenImageUrl={setFullScreenImageUrl} onSelectReference={onSelectReference} />
      </div>
    </div>
  );
};

export default ArtifactViewer;
