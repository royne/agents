import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRocket, FaImage, FaFilm, FaFileAlt, FaTimes, FaGlobe } from 'react-icons/fa';
import Link from 'next/link';

interface CreationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreationSelectorModal: React.FC<CreationSelectorModalProps> = ({ isOpen, onClose }) => {
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[500px] bg-[#0A0C10] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors z-10"
              >
                <FaTimes />
              </button>

              <div className="p-8">
                {/* Section 1: AI Guided */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <FaRocket className="text-primary-color text-sm" />
                    <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Creación Guiada por IA</h3>
                  </div>

                  <Link href="/v2">
                    <button className="w-full p-6 bg-gradient-to-r from-primary-color to-[#0066FF] rounded-2xl flex items-center justify-between group hover:scale-[1.02] transition-all duration-300 shadow-[0_10px_30px_rgba(18,216,250,0.2)]">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
                          <span className="text-2xl">🤖</span>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-white uppercase tracking-wider">Estrategia Completa con IA</p>
                          <p className="text-[10px] text-white/60 font-medium">Anuncios, landins y textos en segundos</p>
                        </div>
                      </div>
                    </button>
                  </Link>

                  <p className="mt-4 text-[11px] text-white/50 leading-relaxed font-black">
                    Genera anuncios, landing pages y textos en el flujo automatizado en chat.
                  </p>
                </div>

                <div className="w-full h-px bg-white/5 mb-8" />

                {/* Section 2: Manual Tools */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-primary-color text-xl">+</span>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Herramientas Manuales (V1)</h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Link href="/image-pro" className="h-full">
                      <button className="w-full p-3 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.08] transition-all flex flex-col items-center gap-2 group text-center h-full justify-center">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 group-hover:text-primary-color transition-colors">
                          <FaImage className="text-sm" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-white uppercase tracking-wider">Imagen PRO</p>
                          <p className="text-[7px] text-white/40 leading-tight">Diseño gráfico individual</p>
                        </div>
                      </button>
                    </Link>

                    <Link href="/video-pro" className="h-full">
                      <button className="w-full p-3 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.08] transition-all flex flex-col items-center gap-2 group text-center h-full justify-center">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 group-hover:text-primary-color transition-colors">
                          <FaFilm className="text-sm" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-white uppercase tracking-wider">Video PRO</p>
                          <p className="text-[7px] text-white/40 leading-tight">Edición y clips de video</p>
                        </div>
                      </button>
                    </Link>

                    <Link href="/landing-pro" className="h-full col-span-2 sm:col-span-1">
                      <button className="w-full p-3 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.08] transition-all flex flex-col items-center gap-2 group text-center h-full justify-center">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 group-hover:text-primary-color transition-colors">
                          <FaFileAlt className="text-sm" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-white uppercase tracking-wider">Landing PRO</p>
                          <p className="text-[7px] text-white/40 leading-tight">Editor manual v1</p>
                        </div>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreationSelectorModal;
