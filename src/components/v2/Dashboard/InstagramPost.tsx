import React from 'react';
import { FaEllipsisH, FaHeart, FaComment, FaPaperPlane, FaBookmark } from 'react-icons/fa';

interface InstagramPostProps {
  imageUrl: string;
  hook?: string;
  cta?: string;
  title?: string;
  isLoading?: boolean;
  aspectRatio?: '1:1' | '9:16';
  className?: string;
}

const InstagramPost: React.FC<InstagramPostProps> = ({
  imageUrl,
  hook = "Descubre la nueva forma de escalar tu e-commerce con DropApp.",
  cta = "SHOP NOW",
  title = "Concepto de Ad",
  isLoading = false,
  aspectRatio = '1:1',
  className = ""
}) => {
  return (
    <div className={`w-full max-w-[400px] bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in duration-500 group/igpost ${className}`}>
      {/* Header */}
      <div className="p-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center p-0.5">
              <div className="w-full h-full rounded-full bg-primary-color/20 flex items-center justify-center text-[10px] font-black text-primary-color">DA</div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-white leading-none">DropApp.lat</span>
            <span className="text-[9px] text-white/50 leading-none mt-1">Publicidad</span>
          </div>
        </div>
        <FaEllipsisH className="text-white/40 text-xs" />
      </div>

      {/* Image Container */}
      <div className={`w-full bg-black/40 relative overflow-hidden ${aspectRatio === '1:1' ? 'aspect-square' : 'aspect-[9/16]'}`}>
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-primary-color border-t-transparent animate-spin rounded-full"></div>
            <span className="text-[10px] font-bold text-primary-color uppercase tracking-widest animate-pulse">Generando...</span>
          </div>
        ) : (
          <img
            src={imageUrl || "https://via.placeholder.com/400x400?text=Cargando+Referencia..."}
            alt={title}
            className="w-full h-full object-cover transition-all duration-700 group-hover/igpost:scale-110"
          />
        )}

        {/* CTA Button Overlay (Instagram style) */}
        {!isLoading && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-lg border border-white/20 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-tight">
              <span>{cta}</span>
              <span className="text-[10px]">›</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-white/90">
          <FaHeart className="text-lg hover:text-red-500 transition-colors cursor-pointer" />
          <FaComment className="text-lg hover:text-primary-color transition-colors cursor-pointer" />
          <FaPaperPlane className="text-lg hover:text-primary-color transition-colors cursor-pointer" />
        </div>
        <FaBookmark className="text-lg text-white/90 cursor-pointer" />
      </div>

      {/* Content */}
      <div className="px-3 pb-4 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
          <span>8.432 me gusta</span>
        </div>
        <div className="text-[11px] leading-relaxed">
          <span className="font-bold text-white mr-2">dropapp.lat</span>
          <span className="text-white/80 line-clamp-2">{hook}</span>
        </div>
        <div className="text-[10px] text-white/40 pt-1 uppercase font-bold tracking-tighter">
          Ver los 42 comentarios
        </div>
      </div>
    </div>
  );
};

export default InstagramPost;
