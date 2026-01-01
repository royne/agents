import React from 'react';
import { FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { useAppContext } from '../../contexts/AppContext';

const RenewalBanner: React.FC = () => {
  const { authData } = useAppContext();

  if (!authData?.expiresAt || authData.plan === 'free' || authData.plan === 'tester') return null;

  const now = new Date();
  const expiresAt = new Date(authData.expiresAt);
  const diffTime = expiresAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Solo mostrar si faltan 3 días o menos, y no ha expirado aún (la degradación perezosa se encarga de lo expirado)
  if (diffDays > 3 || diffDays < 0) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white px-4 py-2.5 flex flex-col md:flex-row items-center justify-between shadow-lg animate-in slide-in-from-top duration-700 z-[60] relative border-b border-white/10">
      <div className="flex items-center gap-3 mb-2 md:mb-0">
        <div className="bg-white/20 p-1.5 rounded-lg animate-pulse">
          <FaExclamationTriangle className="text-white text-sm" />
        </div>
        <p className="text-sm font-bold tracking-tight">
          {diffDays === 0
            ? '¡Tu plan vence hoy! Renuévalo ahora para mantener tus beneficios premium.'
            : `¡Atención! Tu plan vence en ${diffDays} ${diffDays === 1 ? 'día' : 'días'}. Renuévalo para evitar interrupciones.`}
        </p>
      </div>
      <Link href="/pricing" className="flex items-center gap-2 bg-white text-amber-600 px-5 py-1.5 rounded-xl text-xs font-black hover:bg-amber-50 hover:scale-105 active:scale-95 transition-all shadow-md">
        RENOVAR AHORA <FaArrowRight className="text-[10px]" />
      </Link>
    </div>
  );
};

export default RenewalBanner;
