import React from 'react';
import { FaImage } from 'react-icons/fa';
import { useImageUsage } from '../../hooks/useImageUsage';

interface UsageCounterProps {
  limit?: number;
  showText?: boolean;
}

const UsageCounter: React.FC<UsageCounterProps> = ({ showText = true }) => {
  const { credits, limit, loading } = useImageUsage();

  // Calcular el progreso para el círculo (basado en lo que queda)
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = Math.min((credits / limit) * 100, 100);
  const offset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="bg-gradient-to-br from-theme-component/80 to-theme-component border border-white/5 p-4 rounded-2xl flex items-center justify-between shadow-xl backdrop-blur-sm group hover:border-primary-color/30 transition-all duration-500">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary-color/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
          <FaImage className="text-primary-color text-xl drop-shadow-[0_0_8px_rgba(18,216,250,0.5)]" />
        </div>
        <div>
          {showText && (
            <p className="text-[10px] text-theme-tertiary uppercase font-black tracking-[0.15em] opacity-60">
              Saldo de Créditos
            </p>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-theme-primary tracking-tighter">
              {loading ? '...' : credits.toLocaleString()}
            </span>
            <span className="text-xs text-theme-tertiary font-bold opacity-40">/ {limit.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="w-14 h-14 relative flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-700">
        <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_10px_rgba(18,216,250,0.2)]">
          {/* Círculo de fondo */}
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="4"
          />
          {/* Círculo de progreso */}
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="transparent"
            stroke="url(#usageGradient)"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="usageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#12D8FA" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[8px] font-black text-primary-color/50">{Math.round(progressPercent)}%</span>
        </div>
      </div>
    </div>
  );
};

export default UsageCounter;
