import React from 'react';
import { FaRocket, FaEdit, FaImage, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { LandingSection, LandingMode } from '../../types/landing-pro';

interface LandingPreviewProps {
  currentSection: LandingSection;
  landingMode: LandingMode;
  currentStep: number;
  activeSections: LandingSection[];
  generations: Record<string, string>;
  isGenerating: boolean;
  onGenerate: () => void;
  onStepChange: (idx: number) => void;
  onCorrectionOpen: () => void;
}

const LandingPreview: React.FC<LandingPreviewProps> = ({
  currentSection,
  landingMode,
  currentStep,
  activeSections,
  generations,
  isGenerating,
  onGenerate,
  onStepChange,
  onCorrectionOpen
}) => {
  const imageUrl = generations[currentSection.id];

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `landing-${currentSection.id}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download error:', err);
      // Fallback
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div className="lg:col-span-8 space-y-6">
      <div className="soft-card overflow-hidden min-h-[600px] flex flex-col relative bg-gray-900 shadow-2xl">
        <div className="p-4 border-b border-white/5 bg-gray-900/50 flex items-center justify-between">
          <span className="text-sm font-medium text-theme-secondary flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${imageUrl ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            Vista Previa: <span className="text-white font-bold">{currentSection.title}</span>
          </span>

          {imageUrl && !isGenerating && (
            <div className="flex gap-4">
              <button
                onClick={onCorrectionOpen}
                className="text-theme-secondary text-xs font-bold hover:text-primary-color transition-colors flex items-center gap-2"
              >
                <FaEdit /> Pulir esta imagen
              </button>
              <button
                onClick={handleDownload}
                className="bg-primary-color text-black px-4 py-1.5 rounded-full text-[10px] font-black hover:scale-105 transition-all shadow-lg flex items-center gap-2"
              >
                DESCARGAR
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center p-8 relative bg-[#07090E]">
          {imageUrl && !isGenerating ? (
            <div className="relative group max-w-full">
              <img
                src={imageUrl}
                alt={currentSection.title}
                className="rounded-2xl shadow-2xl border border-white/5 max-h-[500px]"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl"></div>
            </div>
          ) : (
            <div className="text-center space-y-4 max-w-sm">
              <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto opacity-30">
                <FaImage className="text-4xl text-theme-tertiary" />
              </div>
              <p className="text-theme-tertiary text-sm font-medium opacity-60">Haz clic en generar para ver el diseño de esta sección.</p>
            </div>
          )}

          {isGenerating && (
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md flex flex-col items-center justify-center z-10">
              <div className="w-16 h-16 border-4 border-primary-color border-t-transparent animate-spin rounded-full mb-6 shadow-[0_0_40px_rgba(18,216,250,0.3)]"></div>
              <p className="text-primary-color font-black text-xs uppercase tracking-[0.3em] animate-pulse">Diseñando Sección...</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-gray-900/50 flex flex-col items-center gap-6">
          <button
            id="tour-generate-button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full max-w-md py-5 bg-primary-color text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:shadow-[0_0_40px_rgba(18,216,250,0.3)] transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-3 group"
          >
            {isGenerating ? (
              'Generando...'
            ) : (
              <>
                <FaRocket className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                {imageUrl ? 'Regenerar Sección' : 'Iniciar Generación'}
              </>
            )}
          </button>

          <div className="flex items-center justify-between w-full mt-2">
            <button
              onClick={() => onStepChange(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0 || isGenerating}
              className="flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold text-theme-secondary hover:text-white transition-all disabled:opacity-20 hover:bg-white/5"
            >
              <FaChevronLeft className="text-[10px]" /> Paso Anterior
            </button>
            <div className="flex gap-2">
              {activeSections.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-primary-color shadow-[0_0_10px_rgba(18,216,250,0.5)]' : 'w-2 bg-white/10'}`}></div>
              ))}
            </div>
            <button
              onClick={() => onStepChange(Math.min(activeSections.length - 1, currentStep + 1))}
              disabled={currentStep === activeSections.length - 1 || (landingMode !== 'section' && !generations[currentSection.id]) || isGenerating}
              className="flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold text-theme-secondary hover:text-white transition-all disabled:opacity-20 hover:bg-white/5"
            >
              Siguiente Paso <FaChevronRight className="text-[10px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPreview;
