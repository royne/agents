import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRocket, FaImage, FaFilm, FaFileAlt, FaTimes, FaLock } from 'react-icons/fa';
import Link from 'next/link';
import { useAppContext } from '../../../contexts/AppContext';
import { Plan } from '../../../constants/plans';

interface CreationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreationSelectorModal: React.FC<CreationSelectorModalProps> = ({ isOpen, onClose }) => {
  const { authData } = useAppContext();
  const isFreePlan = authData?.plan === 'free';

  const ToolButton = ({
    href,
    icon: Icon,
    title,
    desc,
    colorClass,
    iconColor,
    isLocked = false
  }: {
    href: string;
    icon: any;
    title: string;
    desc: string;
    colorClass: string;
    iconColor: string;
    isLocked?: boolean;
  }) => {
    const content = (
      <button
        disabled={isLocked && false} // Lo dejamos clickeable para redirigir a pricing si queremos
        className={`w-full p-3 border rounded-2xl transition-all flex flex-col items-center gap-2 group text-center h-full justify-center relative overflow-hidden ${isLocked ? 'grayscale opacity-80 border-white/5 bg-white/5' : colorClass}`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isLocked ? 'bg-white/5 text-white/40' : iconColor}`}>
          <Icon className="text-sm" />
        </div>
        <div>
          <p className="text-[9px] font-black text-white uppercase tracking-wider flex items-center justify-center gap-1">
            {title}
            {isLocked && <FaLock className="text-[8px] text-amber-500" />}
          </p>
          <p className="text-[7px] text-white/40 leading-tight">
            {isLocked ? "Sube de nivel para usar" : desc}
          </p>
        </div>
      </button>
    );

    return (
      <Link href={isLocked ? '/pricing' : href} className="h-full" onClick={isLocked ? undefined : onClose}>
        {content}
      </Link>
    );
  };

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

                  <Link href="/v2" onClick={onClose}>
                    <button className="w-full p-6 bg-gradient-to-br from-primary-color via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-between group hover:scale-[1.02] transition-all duration-300 shadow-[0_15px_35px_rgba(18,216,250,0.3)] border-2 border-white/20 hover:border-primary-color/50">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:rotate-6 transition-transform">
                          <span className="text-3xl">🤖</span>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                            Estrategia Completa con IA
                            <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-black rounded-full text-[7px] font-black shadow-[0_0_15px_rgba(251,191,36,0.5)] animate-pulse">RECOMENDADO</span>
                          </p>
                          <p className="text-[10px] text-white/80 font-medium">Anuncios, landins y estrategia en segundos</p>
                        </div>
                      </div>
                      <FaRocket className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </button>
                  </Link>

                  <div className="mt-4 p-4 bg-primary-color/[0.08] rounded-2xl">
                    <p className="text-[11px] text-white/70 leading-relaxed font-medium">
                      <span className="text-primary-color font-bold block mb-1">Tu equipo de marketing personal:</span>
                      Despliega una estrategia de venta ganadora en segundos. Todo el poder de un equipo experto trabajando para ti: desde el análisis profundo del producto hasta landings de alta conversión y anuncios disruptivos que escalan tus ventas.
                    </p>
                  </div>
                </div>

                <div className="w-full h-px bg-white/5 mb-8" />

                {/* Section 2: Manual Tools */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-primary-color text-xl">+</span>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Herramientas Manuales (V1)</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <ToolButton
                      href="/image-pro"
                      icon={FaImage}
                      title="Imagen PRO"
                      desc="Diseño gráfico individual"
                      colorClass="bg-rose-500/[0.03] border-rose-500/10 hover:bg-rose-500/[0.08] hover:border-rose-500/30"
                      iconColor="bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white"
                      isLocked={isFreePlan}
                    />

                    <ToolButton
                      href="/video-pro"
                      icon={FaFilm}
                      title="Video PRO"
                      desc="Edición y clips de video"
                      colorClass="bg-purple-500/[0.03] border-purple-500/10 hover:bg-purple-500/[0.08] hover:border-purple-500/30"
                      iconColor="bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white"
                      isLocked={isFreePlan}
                    />

                    <ToolButton
                      href="/landing-pro"
                      icon={FaFileAlt}
                      title="Landing PRO"
                      desc="Editor manual v1"
                      colorClass="bg-cyan-500/[0.03] border-cyan-500/10 hover:bg-cyan-500/[0.08] hover:border-cyan-500/30"
                      iconColor="bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white"
                      isLocked={isFreePlan}
                    />
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
