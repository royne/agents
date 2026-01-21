import React from 'react';
import { FaChevronRight, FaEdit } from 'react-icons/fa';
import { LandingGenerationState, AspectRatio } from '../../../types/image-pro';

interface SectionPreviewProps {
  previewSectionId: string;
  landingState: LandingGenerationState;
  isGeneratingAsset: boolean;
  editingSectionId: string | null;
  editInstructions: string;
  setPreviewSectionId: (id: string | null) => void;
  setEditingSectionId: (id: string | null) => void;
  setEditInstructions: (val: string) => void;
  onGenerateSection?: (sectionId: string, sectionTitle: string, isCorrection?: boolean, manualInstructions?: string, aspectRatio?: AspectRatio) => void;
  onSelectSection?: (sectionId: string) => void;
}

const SectionPreview: React.FC<SectionPreviewProps> = ({
  previewSectionId,
  landingState,
  isGeneratingAsset,
  editingSectionId,
  editInstructions,
  setPreviewSectionId,
  setEditingSectionId,
  setEditInstructions,
  onGenerateSection,
  onSelectSection
}) => {
  const generation = landingState.generations[previewSectionId];
  if (!generation) return null;

  return (
    <div key={previewSectionId} className="w-full max-w-5xl h-full flex flex-col md:flex-row gap-8 animate-in fade-in zoom-in duration-500 p-4">
      {/* Left: Huge Preview */}
      <div className="flex-1 bg-black/40 rounded-[32px] overflow-hidden border border-white/5 relative group/preview">
        {generation.status === 'pending' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary-color border-t-transparent animate-spin rounded-full"></div>
            <p className="text-[10px] font-black text-primary-color uppercase tracking-widest animate-pulse">Generando nueva versión...</p>
          </div>
        ) : null}
        <img
          src={generation.imageUrl || 'https://via.placeholder.com/1080x1920?text=Generando...'}
          className={`w-full h-full object-contain ${generation.status === 'pending' ? 'opacity-40 grayscale' : ''}`}
        />
        <div className="absolute top-4 left-4 p-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-[10px] font-black uppercase text-primary-color tracking-widest shadow-2xl">
          {generation.aspectRatio || '9:16'} {(generation.aspectRatio || '9:16') === '9:16' ? 'Mobile Optimized' : 'Square Format'}
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
              {generation.copy.headline}
            </h3>
          </div>

          <p className="text-sm text-gray-400 leading-relaxed font-medium">
            {generation.copy.body}
          </p>

          {generation.copy.cta && (
            <div className="pt-4">
              <button className="w-full py-4 bg-primary-color text-black font-black rounded-2xl text-[10px] uppercase tracking-widest">
                {generation.copy.cta}
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
                    if (previewSectionId) {
                      onGenerateSection?.(
                        previewSectionId,
                        generation.copy?.headline || 'Sección',
                        true,
                        editInstructions,
                        generation.aspectRatio || '9:16'
                      );
                    }
                    setEditingSectionId(null);
                    setEditInstructions('');
                  }}
                  disabled={!editInstructions.trim() || isGeneratingAsset}
                  className="flex-1 py-2 bg-primary-color text-black font-black rounded-xl text-[9px] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingAsset ? 'Esperando...' : 'Aplicar'}
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
            if (isGeneratingAsset) return;
            setPreviewSectionId(null);
            onSelectSection?.(previewSectionId);
          }}
          disabled={isGeneratingAsset}
          className={`w-full py-4 bg-white/5 text-white border border-white/10 font-bold text-[10px] uppercase tracking-widest rounded-2xl transition-all ${isGeneratingAsset ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
        >
          {isGeneratingAsset ? 'Generación en curso...' : 'Regenerar con otro estilo'}
        </button>
      </div>
    </div>
  );
};

export default SectionPreview;
