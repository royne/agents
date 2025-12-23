import React from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../../contexts/AppContext';
import Image from 'next/image';

interface WelcomeBannerProps {
  userName?: string;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ userName }) => {
  const router = useRouter();
  const { authData } = useAppContext();

  // Obtener la hora actual para personalizar el saludo
  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Nombre para mostrar (si está disponible)
  const displayName = userName || authData?.name || (authData?.role === 'admin' ? 'Admin' : 'Usuario');

  return (
    <div className="soft-card p-10 mb-10 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-color/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-color/5 rounded-full -ml-24 -mb-24 blur-3xl"></div>

      <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
        <div className="mb-6 md:mb-0">
          <h1 className="text-3xl font-bold text-theme-primary mb-2">
            {getCurrentGreeting()}, <span className="text-primary-color">{displayName}</span> 👋
          </h1>
          <p className="text-theme-secondary text-lg">
            Bienvenido a <span className="font-semibold text-primary-color">DROPLAB</span>. ¿Qué deseas hacer hoy?
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={() => router.push('/agents')}
              className="px-6 py-2.5 bg-primary-color text-white rounded-xl font-medium hover:bg-primary-color/90 transition-all btn-modern shadow-lg shadow-primary-color/20"
            >
              Iniciar Chat
            </button>
            <button
              onClick={() => router.push('/data-analysis')}
              className="px-6 py-2.5 border border-white/10 text-theme-primary rounded-xl font-medium hover:bg-white/5 transition-all btn-modern backdrop-blur-sm"
            >
              Analizar Datos
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center bg-white/5 p-4 rounded-3xl backdrop-blur-md shadow-2xl border border-white/10 relative group">
          <div className="absolute inset-0 bg-primary-color/20 rounded-3xl blur-xl group-hover:bg-primary-color/30 transition-colors"></div>
          <div className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-inner translate-z-0">
            <Image
              src="/droplab.png"
              alt="DROPLAB"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
