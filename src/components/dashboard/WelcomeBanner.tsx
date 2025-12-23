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
    <div className="soft-card p-8 md:p-8 mb-10 overflow-hidden relative border-none group">
      {/* Mesh Gradient Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-color/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse duration-[10s]"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px]"></div>

      <div className="flex flex-col md:flex-row items-center justify-between relative z-10 gap-10">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-black !text-white mb-6 tracking-tight leading-[1.1]">
            {getCurrentGreeting()}, <br />
            <span className="bg-gradient-to-r from-primary-color via-blue-400 to-white bg-clip-text animate-gradient-x">{displayName}</span> 👋
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-xl mx-auto md:mx-0">
            Bienvenido a <span className="text-white font-bold tracking-widest uppercase text-base">DROPLAB</span>. <br className="hidden md:block" />
            <span className="opacity-70">Potencia tu operativa con inteligencia estratégica.</span>
          </p>
          <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-5">
            <button
              onClick={() => router.push('/agents')}
              className="px-8 py-3.5 bg-primary-color text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all btn-modern shadow-[0_10px_20px_-5px_rgba(59,130,246,0.3)] flex items-center gap-2"
            >
              <span>Iniciar Chat</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
            <button
              onClick={() => router.push('/data-analysis')}
              className="px-8 py-3.5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all btn-modern backdrop-blur-md flex items-center gap-2"
            >
              <span>Analizar Datos</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-4 bg-primary-color/20 rounded-[2.5rem] blur-2xl group-hover:bg-primary-color/30 transition-all duration-700 opacity-50"></div>
          <div className="relative p-1 rounded-[2rem] bg-gradient-to-br from-white/20 to-transparent border border-white/10 shadow-2xl backdrop-blur-xl">
            <div className="bg-[#0A0C10] rounded-[1.8rem] overflow-hidden p-6">
              <div className="relative w-32 h-32 md:w-40 md:h-40 group-hover:scale-105 transition-transform duration-700">
                <Image
                  src="/droplab.png"
                  alt="DROPLAB"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-primary-color/10 rounded-full border border-white/5 backdrop-blur-md flex items-center justify-center animate-bounce duration-[3s]">
            <div className="w-2 h-2 bg-primary-color rounded-full animate-ping"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
