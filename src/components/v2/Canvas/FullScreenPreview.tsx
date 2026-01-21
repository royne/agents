import React from 'react';
import { FaCheckCircle, FaChevronRight } from 'react-icons/fa';

interface FullScreenPreviewProps {
  fullScreenImageUrl: string | null;
  setFullScreenImageUrl: (url: string | null) => void;
  onSelectReference?: (url: string) => void;
}

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({
  fullScreenImageUrl,
  setFullScreenImageUrl,
  onSelectReference
}) => {
  if (!fullScreenImageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
      onClick={() => setFullScreenImageUrl(null)}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl"></div>

      <div
        className="relative w-full max-w-6xl h-full flex flex-col items-center justify-center gap-6 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full flex-1 min-h-0 bg-white/5 rounded-[32px] overflow-hidden border border-white/10 shadow-2xl">
          <img
            src={fullScreenImageUrl}
            className="w-full h-full object-contain"
            alt="Reference Preview"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              onSelectReference?.(fullScreenImageUrl);
              setFullScreenImageUrl(null);
            }}
            className="px-8 py-4 bg-primary-color text-black font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary-color/20 flex items-center gap-2"
          >
            <FaCheckCircle /> Seleccionar este estilo
          </button>

          <button
            onClick={() => setFullScreenImageUrl(null)}
            className="px-8 py-4 bg-white/10 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all"
          >
            Cerrar Vista
          </button>
        </div>
      </div>

      {/* Close button top right */}
      <button
        className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all z-[110]"
        onClick={() => setFullScreenImageUrl(null)}
      >
        <FaChevronRight className="rotate-180" />
      </button>
    </div>
  );
};

export default FullScreenPreview;
