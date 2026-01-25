import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCrown, FaRocket, FaChevronRight, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import PhoneMockup from '../Canvas/PhoneMockup';
import { LandingGenerationState } from '../../../types/image-pro';

interface CreditsExhaustedModalProps {
  isOpen: boolean;
  onClose: () => void;
  landingState: LandingGenerationState;
}

const CreditsExhaustedModal: React.FC<CreditsExhaustedModalProps> = ({ isOpen, onClose, landingState }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[200]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[201] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-[1000px] h-auto max-h-[90vh] md:h-full md:max-h-[700px] bg-[#0A0C10] border border-white/10 rounded-[30px] md:rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] pointer-events-auto relative flex flex-col md:flex-row overflow-y-auto md:overflow-visible custom-scrollbar"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="fixed md:absolute top-6 right-6 md:top-8 md:right-8 p-3 text-white/30 hover:text-white transition-all z-50 hover:scale-110 active:scale-95 bg-black/20 md:bg-transparent rounded-full backdrop-blur-md md:backdrop-blur-0"
              >
                <FaTimes size={18} />
              </button>

              {/* Left Side: Content */}
              <div className="flex-1 p-8 md:p-16 flex flex-col justify-center relative overflow-hidden rounded-t-[30px] md:rounded-t-none md:rounded-l-[40px]">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary-color/5 blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10 space-y-6 md:space-y-8">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary-color/10 border border-primary-color/20 rounded-full">
                    <FaCrown className="text-primary-color text-xs" />
                    <span className="text-[10px] font-black text-primary-color uppercase tracking-[0.2em]">Oportunidad Premium</span>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                      ¡Upps, te quedaste sin creditos? <br />
                    </h2>
                    <p className="text-gray-400 text-base md:text-lg font-medium leading-relaxed max-w-sm">
                      Estás a pocos pasos de completar una estrategia ganadora. No dejes que la falta de créditos te detenga cuando lo mejor está por venir.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2 md:pt-4">
                    <Link href="/pricing" className="block">
                      <button className="w-full py-4 md:py-5 bg-gradient-to-r from-primary-color to-blue-600 text-white font-black rounded-2xl text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-[0_15px_40px_rgba(18,216,250,0.4)] hover:scale-[1.03] transition-all flex items-center justify-center gap-3 group">
                        Desbloquear Todo Ahora <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>

                  <div className="flex items-center gap-6 pt-6 md:pt-10 border-t border-white/5">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[#0A0C10] overflow-hidden bg-white/5">
                          <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" />
                        </div>
                      ))}
                    </div>
                    <p className="text-[9px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest leading-tight">
                      <span className="text-white">+500 usuarios</span> han completado <br /> su flujo hoy
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side: Visual Proof (Mockup) */}
              <div className="w-full md:w-[450px] bg-[#05070A] border-t md:border-t-0 md:border-l border-white/5 flex items-center justify-center p-8 md:p-12 relative rounded-b-[30px] md:rounded-b-none md:rounded-r-[40px] overflow-hidden">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-primary-color/5 opacity-50"></div>

                <div className="relative z-10 scale-[0.7] sm:scale-[0.8] md:scale-[0.85] lg:scale-95 origin-center py-8 md:py-0">
                  <PhoneMockup
                    landingState={landingState}
                    viewMode={landingState.phase}
                    showConversionBlur={true}
                  />

                  {/* Floating Elements for "Potential" appearance */}
                  <motion.div
                    animate={{ y: [0, -10, 0], opacity: [0, 1, 1] }}
                    initial={{ opacity: 0 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    className="absolute top-0 -right-4 md:-right-6 px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl flex items-center gap-3 z-30"
                  >
                    <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <FaRocket className="text-orange-500 text-xs" />
                    </div>
                    <div className="text-left">
                      <p className="text-[8px] font-black text-white uppercase tracking-wider">Alta Conversión</p>
                      <p className="text-[7px] text-white/50">Optimizado por IA</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreditsExhaustedModal;
