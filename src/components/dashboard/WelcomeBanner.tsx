import React from 'react';
import { useRouter } from 'next/router';
import { FaRobot } from 'react-icons/fa';
import { useAppContext } from '../../contexts/AppContext';

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
  const displayName = userName || (authData?.role === 'admin' ? 'Admin' : 'Usuario');

  return (
    <div className="bg-gradient-to-r from-primary-color/10 to-theme-component p-8 rounded-xl shadow-lg mb-10">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0">
          <h1 className="text-3xl font-bold text-theme-primary mb-2">
            {getCurrentGreeting()}, <span className="text-primary-color">{displayName}</span> 👋
          </h1>
          <p className="text-theme-secondary text-lg">
            Bienvenido a tu panel de control. ¿Qué deseas hacer hoy?
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button 
              onClick={() => router.push('/agents')} 
              className="px-4 py-2 bg-primary-color text-white rounded-md hover:bg-primary-color/80 transition-all"
            >
              Iniciar Chat
            </button>
            <button 
              onClick={() => router.push('/data-analysis')} 
              className="px-4 py-2 border border-primary-color text-primary-color rounded-md hover:bg-primary-color/10 transition-all"
            >
              Analizar Datos
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center bg-theme-component p-6 rounded-full shadow-inner">
          <FaRobot className="text-6xl text-primary-color animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
