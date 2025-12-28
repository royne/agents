import React from 'react';
import { FaChevronRight, FaCheckCircle } from 'react-icons/fa';
import { LandingSection, LandingMode } from '../../types/landing-pro';
import { LANDING_SECTIONS } from '../../constants/landing-pro';

interface SectionSelectorProps {
  landingMode: LandingMode;
  currentStep: number;
  activeSections: LandingSection[];
  generations: Record<string, string>;
  isSectionSelectorOpen: boolean;
  onStepChange: (idx: number) => void;
  setIsSectionSelectorOpen: (open: boolean) => void;
}

const SectionSelector: React.FC<SectionSelectorProps> = ({
  landingMode,
  currentStep,
  activeSections,
  generations,
  isSectionSelectorOpen,
  onStepChange,
  setIsSectionSelectorOpen
}) => {
  const currentSection = activeSections[currentStep];

  if (landingMode === 'section') {
    return (
      <div className="mb-10 flex flex-col items-center">
        <div className="relative w-full max-w-md">
          <button
            onClick={() => setIsSectionSelectorOpen(!isSectionSelectorOpen)}
            className="w-full bg-theme-component border border-purple-500/30 hover:border-purple-500 p-5 rounded-2xl flex items-center justify-between transition-all group shadow-lg shadow-purple-500/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500 text-white flex items-center justify-center text-xl shadow-lg shadow-purple-500/20">
                <currentSection.icon />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest leading-none mb-1">Sección Activa</p>
                <h3 className="text-xl font-bold text-white">{currentSection.title}</h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-theme-tertiary uppercase tracking-tighter bg-white/5 px-2 py-1 rounded">Cambiar</span>
              <FaChevronRight className={`text-purple-500 transition-transform ${isSectionSelectorOpen ? 'rotate-90' : ''}`} />
            </div>
          </button>

          {isSectionSelectorOpen && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-theme-component border border-white/10 rounded-2xl p-2 z-50 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {LANDING_SECTIONS.map((section, idx) => {
                const Icon = section.icon;
                const isSelected = section.id === currentSection.id;
                const isCompleted = generations[section.id] !== undefined;

                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      onStepChange(idx);
                      setIsSectionSelectorOpen(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all border ${isSelected
                        ? 'bg-purple-500/10 border-purple-500/50 text-white'
                        : 'hover:bg-white/5 border-transparent text-theme-tertiary hover:text-white'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-purple-500 text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-800'}`}>
                      {isCompleted ? <FaCheckCircle className="text-xs" /> : <Icon className="text-xs" />}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold leading-none">{section.title}</p>
                      {isCompleted && <p className="text-[8px] text-green-500 font-black uppercase tracking-tighter mt-0.5">Generada</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <p className="text-[10px] text-theme-tertiary mt-4 uppercase font-black tracking-widest opacity-40">Modo Individual Activo</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-4 no-scrollbar">
      {activeSections.map((section, idx) => {
        const Icon = section.icon;
        const isCompleted = generations[section.id] !== undefined;
        const isActive = idx === currentStep;

        const isLocked = idx > currentStep && !activeSections.slice(0, idx).every(s => generations[s.id]);

        return (
          <div
            key={section.id}
            onClick={() => onStepChange(idx)}
            className={`flex-shrink-0 flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer group ${isActive ? 'border-primary-color bg-primary-color/10 shadow-[0_0_25px_rgba(18,216,250,0.15)] ring-1 ring-primary-color/30' :
                isCompleted ? 'border-green-500/30 bg-green-500/5 text-green-500 hover:border-green-500/60' :
                  isLocked ? 'border-white/5 bg-white/5 opacity-20 cursor-not-allowed' :
                    'border-white/5 bg-white/5 opacity-40 hover:opacity-100 hover:border-white/20'
              }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-primary-color text-black scale-110' :
                isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' :
                  isLocked ? 'bg-gray-900 text-gray-600' :
                    'bg-gray-800 text-gray-400 group-hover:bg-gray-700'
              }`}>
              {isCompleted ? <FaCheckCircle className="text-lg" /> : <Icon className="text-lg" />}
            </div>
            {isActive && (
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black tracking-tighter opacity-50">Sección {idx + 1}</span>
                <span className="text-xs font-bold whitespace-nowrap leading-none">{section.title}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SectionSelector;
