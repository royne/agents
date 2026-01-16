import React from 'react';
import { FaEdit, FaRocket, FaImage, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { ADS_STEPS } from '../../constants/image-pro';
import { useImagePro } from '../../hooks/useImagePro';

interface ImagePreviewProps {
  state: ReturnType<typeof useImagePro>['state'];
  actions: ReturnType<typeof useImagePro>['actions'];
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ state, actions }) => {
  const {
    generationMode,
    adsSubMode,
    currentAdStep,
    generations,
    generatedImageUrl,
    isGenerating
  } = state;

  const currentResult = (generationMode === 'ads' && adsSubMode === 'completo')
    ? generations[ADS_STEPS[currentAdStep].id]
    : generatedImageUrl;

  return (
    <div className="space-y-6">
      {/* STEPPER PARA ADS COMPLETO */}
      {generationMode === 'ads' && adsSubMode === 'completo' && (
        <div className="flex items-center gap-4 bg-theme-component/50 p-4 rounded-2xl border border-white/5 shadow-inner">
          {ADS_STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => actions.setCurrentAdStep(idx)}
              className={`flex-1 flex items-center gap-3 p-3 rounded-xl border transition-all ${currentAdStep === idx ? 'border-blue-500 bg-blue-500/10' : generations[step.id] ? 'border-green-500/30 bg-green-500/5 opacity-60' : 'border-white/5 opacity-30'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${currentAdStep === idx ? 'bg-blue-500 text-white' : generations[step.id] ? 'bg-green-500 text-white' : 'bg-gray-800'}`}>
                {idx + 1}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter text-white">{step.title}</span>
            </button>
          ))}
        </div>
      )}

      <div className="soft-card overflow-hidden min-h-[600px] flex flex-col relative">
        <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
          <span className="text-sm font-medium text-theme-secondary flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${currentResult ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            {generationMode === 'ads' && adsSubMode === 'completo' ? `Resultado: Ad ${currentAdStep + 1}` : 'Vista Previa'}
          </span>

          {currentResult && (
            <div className="flex gap-4">
              <button
                onClick={() => actions.setIsCorrectionModalOpen(true)}
                className="text-theme-secondary text-xs font-bold hover:text-primary-color transition-colors flex items-center gap-2"
              >
                <FaEdit /> Pulir esta imagen
              </button>
              <button
                onClick={actions.handleDownload}
                className="bg-primary-color text-black px-4 py-1.5 rounded-full text-[10px] font-black hover:scale-105 transition-all shadow-lg flex items-center gap-2"
              >
                <FaRocket className="rotate-180" /> DESCARGAR
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center p-8 relative bg-[#07090E]">
          {currentResult ? (
            <div className="relative group max-w-full">
              <img
                src={currentResult}
                alt="Generada"
                className="rounded-2xl shadow-2xl border border-white/5 max-h-[500px]"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl"></div>
            </div>
          ) : (
            <div className="text-center space-y-4 max-w-sm">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto opacity-50">
                <FaImage className="text-4xl text-theme-tertiary" />
              </div>
              <p className="text-theme-tertiary">Selecciona el modo y haz clic en generar para ver la magia.</p>
            </div>
          )}

          {isGenerating && (
            <div className="absolute inset-0 bg-theme-primary/80 backdrop-blur-md flex flex-col items-center justify-center z-10 transition-all">
              <div className="w-16 h-16 border-4 border-primary-color border-t-transparent animate-spin rounded-full mb-4 shadow-[0_0_30px_rgba(18,216,250,0.3)]"></div>
              <p className="text-primary-color font-bold text-lg animate-pulse uppercase tracking-widest text-xs">Generando...</p>
            </div>
          )}
        </div>

        {/* BARRA DE NAVEGACIÓN ADS COMPLETO */}
        {generationMode === 'ads' && adsSubMode === 'completo' && (
          <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex justify-between items-center">
            <button
              onClick={() => actions.setCurrentAdStep(prev => Math.max(0, prev - 1))}
              disabled={currentAdStep === 0}
              className="flex items-center gap-2 text-xs font-bold text-theme-secondary disabled:opacity-20"
            >
              <FaChevronLeft /> Anterior
            </button>
            <div className="flex gap-2">
              {ADS_STEPS.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all ${i === currentAdStep ? 'w-6 bg-blue-500' : 'w-2 bg-white/10'}`}></div>
              ))}
            </div>
            <button
              onClick={() => actions.setCurrentAdStep(prev => Math.min(ADS_STEPS.length - 1, prev + 1))}
              disabled={currentAdStep === ADS_STEPS.length - 1 || !generations[ADS_STEPS[currentAdStep].id]}
              className="flex items-center gap-2 text-xs font-bold text-theme-secondary disabled:opacity-20"
            >
              Siguiente Paso <FaChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePreview;
