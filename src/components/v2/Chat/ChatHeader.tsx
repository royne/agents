import React from 'react';
import { FaRobot, FaMagic } from 'react-icons/fa';

interface ChatHeaderProps {
  onReset: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onReset }) => {
  return (
    <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-color/10 flex items-center justify-center shadow-lg shadow-primary-color/5">
          <FaRobot className="text-primary-color" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">Estratega DropApp</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">En línea</span>
          </div>
        </div>
      </div>
      <button
        onClick={onReset}
        title="Reiniciar Estrategia"
        className="p-2 text-gray-500 hover:text-rose-400 transition-colors bg-white/5 hover:bg-white/10 rounded-lg"
      >
        <FaMagic className="rotate-180 text-xs" />
      </button>
    </div>
  );
};

export default ChatHeader;
