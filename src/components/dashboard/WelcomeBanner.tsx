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
    <div className="bg-gradient-to-r from-primary-color/10 to-theme-component p-8 rounded-xl shadow-lg mb-10">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0">
          <h1 className="text-3xl font-bold text-theme-primary mb-2">
            {getCurrentGreeting()}, <span className="text-primary-color">{displayName}</span> 👋
          </h1>
          <p className="text-theme-secondary text-lg">
            Bienvenido a <span className="font-semibold text-primary-color">Unlocked Ecom</span>. ¿Qué deseas hacer hoy?
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button 
              onClick={() => router.push('/agents')} 
              className="px-3 py-1.5 bg-primary-color text-white rounded-md hover:bg-primary-color/80 transition-all text-sm"
            >
              Iniciar Chat
            </button>
            <button 
              onClick={() => router.push('/data-analysis')} 
              className="px-3 py-1.5 border border-primary-color text-primary-color rounded-md hover:bg-primary-color/10 transition-all text-sm"
            >
              Analizar Datos
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center bg-theme-component p-6 rounded-full shadow-inner">
          <div className="relative w-24 h-24 animate-pulse">
            <Image 
              src="/unlocked.png" 
              alt="Unlocked Ecom" 
              fill 
              className="object-contain" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
