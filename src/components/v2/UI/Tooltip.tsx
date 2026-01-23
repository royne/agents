import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 0.2
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom':
        return 'top-full mt-2 left-1/2 -translate-x-1/2';
      case 'left':
        return 'right-full mr-2 top-1/2 -translate-y-1/2';
      case 'right':
        return 'left-full ml-2 top-1/2 -translate-y-1/2';
      case 'top':
      default:
        return 'bottom-full mb-2 left-1/2 -translate-x-1/2';
    }
  };

  const getInitialAnim = () => {
    switch (position) {
      case 'bottom': return { opacity: 0, y: -10, x: '-50%' };
      case 'left': return { opacity: 0, x: 10, y: '-50%' };
      case 'right': return { opacity: 0, x: -10, y: '-50%' };
      default: return { opacity: 0, y: 10, x: '-50%' };
    }
  };

  return (
    <div
      className="relative flex items-center justify-center cursor-help"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={getInitialAnim()}
            animate={{ opacity: 1, y: position === 'left' || position === 'right' ? '-50%' : 0, x: position === 'top' || position === 'bottom' ? '-50%' : 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, delay: isVisible ? delay : 0 }}
            className={`absolute z-[100] px-4 py-3 rounded-2xl bg-[#0A0C10]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(18,216,250,0.05)] min-w-[220px] pointer-events-none ${getPositionStyles()}`}
          >
            <div className="text-[11px] font-medium text-white/80 leading-relaxed text-left">
              {content}
            </div>
            {/* Arrow */}
            <div className={`absolute w-2 h-2 bg-[#0A0C10] border-white/10 rotate-45 pointer-events-none ${position === 'bottom' ? '-top-1 left-1/2 -translate-x-1/2 border-l border-t' :
              position === 'left' ? '-right-1 top-1/2 -translate-y-1/2 border-r border-t' :
                position === 'right' ? '-left-1 top-1/2 -translate-y-1/2 border-l border-b' :
                  ' -bottom-1 left-1/2 -translate-x-1/2 border-r border-b'
              }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
