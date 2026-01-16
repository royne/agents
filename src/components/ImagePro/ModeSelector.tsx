import React from 'react';
import { FaImage, FaBullhorn, FaUserFriends } from 'react-icons/fa';
import { GenerationMode } from '../../types/image-pro';

interface ModeSelectorProps {
  activeMode: GenerationMode;
  onSelect: (mode: GenerationMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ activeMode, onSelect }) => {
  return (
    <div id="tour-image-modes" className="flex bg-theme-component border border-white/10 rounded-2xl p-1.5 mb-8 w-fit mx-auto shadow-xl">
      <button
        onClick={() => onSelect('libre')}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeMode === 'libre' ? 'bg-primary-color text-black shadow-lg shadow-primary-color/20' : 'text-theme-tertiary hover:text-white'}`}
      >
        <FaImage /> Imagen Libre
      </button>
      <button
        onClick={() => onSelect('ads')}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeMode === 'ads' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-theme-tertiary hover:text-white'}`}
      >
        <FaBullhorn /> Ads
      </button>
      <button
        onClick={() => onSelect('personas')}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeMode === 'personas' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-theme-tertiary hover:text-white'}`}
      >
        <FaUserFriends /> Personas
      </button>
    </div>
  );
};

export default ModeSelector;
