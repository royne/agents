import React from 'react';
import { FaBolt } from 'react-icons/fa';
import { useImageUsage } from '../../hooks/useImageUsage';

interface UsageCounterProps {
  showText?: boolean;
}

const UsageCounter: React.FC<UsageCounterProps> = ({ showText = true }) => {
  const { credits, limit, loading } = useImageUsage();

  // Calcular el progreso para el círculo (basado en lo que queda - Saldo Disponible)
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const remainingPercent = Math.max((credits / limit) * 100, 0);

  // Barra inversa: se vacía a medida que gastas, reflejando el "Saldo Disponible"
  const offset = circumference - (remainingPercent / 100) * circumference;

  return (
    <div className="bg-gradient-to-br from-theme-component/90 to-theme-component border border-primary-color/20 p-4 rounded-2xl flex items-center justify-between shadow-[0_0_25px_rgba(18,216,250,0.05)] backdrop-blur-md group hover:border-primary-color/40 transition-all duration-500">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary-color/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
          <FaBolt className="text-primary-color text-xl drop-shadow-[0_0_8px_rgba(18,216,250,0.6)]" />
        </div>
        <div>
          {showText && (
            <p className="text-[10px] text-primary-color uppercase font-black tracking-[0.2em] mb-0.5 opacity-80">
              Saldo Disponible
            </p>
          )}
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-theme-primary tracking-tighter">
              {loading ? '...' : credits.toLocaleString()}
            </span>
            <span className="text-[10px] text-theme-tertiary font-bold uppercase opacity-50 tracking-widest">Créditos</span>
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
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="4"
          />
          {/* Círculo de progreso (Saldo Restante) */}
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="transparent"
            stroke="url(#usageGradientUnified)"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="usageGradientUnified" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#12D8FA" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[9px] font-black text-theme-primary leading-none">{Math.round(remainingPercent)}%</span>
        </div>
      </div>
    </div>
  );
};

export default UsageCounter;
