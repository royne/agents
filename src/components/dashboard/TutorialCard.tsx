import React from 'react';
import { FaPlayCircle } from 'react-icons/fa';

interface TutorialCardProps {
  title: string;
  description: string;
  thumbnail: string;
  onClick: () => void;
}

const TutorialCard: React.FC<TutorialCardProps> = ({ title, description, thumbnail, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="premium-card group cursor-pointer overflow-hidden flex flex-col h-full hover:border-primary-color/50 transition-all duration-300"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary-color/90 flex items-center justify-center text-white shadow-[0_0_20px_rgba(18,216,250,0.4)] transform group-hover:scale-110 transition-transform duration-300">
            <FaPlayCircle className="w-6 h-6 ml-0.5" />
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-1 flex-grow bg-white/[0.02]">
        <h3 className="text-white font-bold text-sm leading-tight group-hover:text-primary-color transition-colors truncate">
          {title}
        </h3>
        <p className="text-gray-400 text-[10px] line-clamp-2 leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </div>
  );
};

export default TutorialCard;
