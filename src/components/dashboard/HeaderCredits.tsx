import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { PLAN_CREDITS, Plan } from '../../constants/plans';

interface HeaderCreditsProps {
  className?: string;
  showWelcome?: boolean;
}

const HeaderCredits: React.FC<HeaderCreditsProps> = ({ className = '', showWelcome = true }) => {
  const { authData, isSyncing } = useAppContext();

  if (!authData) return null;

  const planKey = (authData.plan || 'free') as Plan;
  const maxCredits = PLAN_CREDITS[planKey] || 50;
  const currentCredits = authData.credits || 0;
  const percentage = Math.min(Math.round((currentCredits / maxCredits) * 100), 100);

  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 ${showWelcome ? 'pb-6 border-b border-white/5' : ''} ${className}`}>
      {showWelcome && (
        <div className="flex flex-col">
          <h2 className="text-4xl font-black text-white tracking-tighter">
            ¡Hola, <span className="text-primary-color">{authData.name?.split(' ')[0] || 'Usuario'}</span>!
          </h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1 -ml-0.5">
            Portal de gestión inteligente
          </p>
          {authData.community_name && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-color/10 border border-primary-color/20 transition-all duration-500">
              <span className="text-[10px] font-black text-primary-color uppercase tracking-widest leading-none">
                Miembro de <span className="text-white ml-1">{authData.community_name}</span>
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col md:items-end gap-3 min-w-[280px]">
        <div className="flex items-center justify-between w-full text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
          <span className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-primary-color'} shadow-[0_0_8px_rgba(18,216,250,0.5)]`}></div>
            Plan {authData.plan || 'Free'}
          </span>
          <span className="text-white/80 flex items-center gap-2">
            {isSyncing && (
              <div className="w-3 h-3 border-2 border-primary-color/30 border-t-primary-color rounded-full animate-spin"></div>
            )}
            <span className="text-primary-color font-bold">{currentCredits}</span> / {maxCredits} Créditos
          </span>
        </div>

        {/* Barra de Progreso */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
          <div
            className="h-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(18,216,250,0.6)]"
            style={{
              width: `${percentage}%`,
              background: 'linear-gradient(90deg, #12D8FA 0%, #3B82F6 100%)'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default HeaderCredits;
