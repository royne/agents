import React, { useState, useEffect } from 'react';
import { FaComments, FaChartLine, FaTruck, FaCog, FaRobot, FaSignOutAlt, FaDatabase, FaDollarSign, FaBrain, FaUsersCog, FaAd, FaChevronLeft, FaChevronRight, FaMagic, FaFilm } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useAppContext } from '../../contexts/AppContext';
import type { ModuleKey } from '../../constants/plans';
import Link from 'next/link';
import Image from 'next/image';

type MenuItem = { name: string; icon: any; path: string; adminOnly?: boolean; showForAllAdmins?: boolean; moduleKey: ModuleKey };

const menuItems: MenuItem[] = [
  { name: 'Agentes', icon: FaComments, path: '/agents', moduleKey: 'agents' },
  { name: 'Calculadora de Precios', icon: FaDollarSign, path: '/calculator', moduleKey: 'calculator' },
  { name: 'Logística', icon: FaTruck, path: '/logistic', moduleKey: 'logistic' },
  { name: 'Análisis de Datos', icon: FaBrain, path: '/data-analysis', moduleKey: 'data-analysis' },
  { name: 'Agente Pro', icon: FaMagic, path: '/image-pro', moduleKey: 'image-pro' },
  { name: 'Landing PRO', icon: FaAd, path: '/landing-pro', moduleKey: 'landing-pro' },
  { name: 'Video PRO', icon: FaFilm, path: '/video-pro', moduleKey: 'video-pro' },
  { name: 'Master Chat', icon: FaRobot, path: '/chat', moduleKey: 'chat' },
  { name: 'Administración', icon: FaUsersCog, path: '/admin', adminOnly: true, showForAllAdmins: true, moduleKey: 'admin' },
  { name: 'Configuración', icon: FaCog, path: '/settings', moduleKey: 'settings' },
];

// Elementos que se mostrarán en la barra de navegación móvil
type MobileMenuItem = { name: string; icon: any; path: string; moduleKey?: ModuleKey };
const mobileMenuItems: MobileMenuItem[] = [
  {
    name: 'Dashboard', icon: () => (
      <div className="w-5 h-5 rounded-full overflow-hidden relative">
        <Image src="/droplab.png" alt="DROPLAB" fill className="object-cover" />
      </div>
    ), path: '/'
  },
  { name: 'Agentes', icon: FaComments, path: '/agents', moduleKey: 'agents' },
  { name: 'Calculadora', icon: FaDollarSign, path: '/calculator', moduleKey: 'calculator' },
  { name: 'Agente Pro', icon: FaMagic, path: '/image-pro', moduleKey: 'image-pro' },
  { name: 'Video PRO', icon: FaFilm, path: '/video-pro', moduleKey: 'video-pro' },
];

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { logout, themeConfig, isAdmin, canAccessModule } = useAppContext();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [navInProgress, setNavInProgress] = useState(false);
  // Por defecto, el sidebar estará abierto, pero intentamos hidratar desde localStorage
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedSidebarState = window.localStorage.getItem('sidebarOpen');
      if (savedSidebarState !== null) {
        return savedSidebarState === 'true';
      }
    }
    return true;
  });

  // Actualizar localStorage cuando cambia el estado del sidebar
  useEffect(() => {
    localStorage.setItem('sidebarOpen', isSidebarOpen.toString());
  }, [isSidebarOpen]);

  // Marcar hidratación para controlar transiciones iniciales
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Pausar transiciones durante navegación para evitar "flicker"
  useEffect(() => {
    const handleStart = () => setNavInProgress(true);
    const handleDone = () => setNavInProgress(false);
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleDone);
    router.events.on('routeChangeError', handleDone);
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleDone);
      router.events.off('routeChangeError', handleDone);
    };
  }, [router.events]);

  // Aplicar el color primario a elementos con la clase .btn-primary
  useEffect(() => {
    const applyThemeToComponents = () => {
      // Aplicar a botones con clase bg-blue-600
      document.querySelectorAll('.bg-blue-600').forEach(el => {
        (el as HTMLElement).style.backgroundColor = themeConfig.primaryColor;
        el.classList.add('btn-primary');
      });

      // Aplicar a elementos con clase focus:border-blue-500
      document.querySelectorAll('.focus\\:border-blue-500').forEach(el => {
        el.classList.add('focus:border-primary-color');
      });
    };

    // Ejecutar después de que el DOM se haya actualizado
    setTimeout(applyThemeToComponents, 100);
  }, [themeConfig.primaryColor]);

  return (
    <div className="h-screen flex overflow-hidden bg-theme-primary">
      {/* Sidebar para escritorio/tablet - Oculto en móviles */}
      <div
        className={`${isSidebarOpen ? 'w-64' : 'w-16'
          } bg-[#0A0C10] border-r border-white/5 ${(hasHydrated && !navInProgress) ? 'transition-all duration-500' : 'transition-none'} fixed h-screen z-40 hidden md:block`}
      >
        {/* Botón flotante para mostrar/ocultar el sidebar */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute -right-4 top-10 bg-[#0A0C10] shadow-xl rounded-full p-2.5 flex items-center justify-center z-50 hover:bg-white/5 transition-all border border-white/10 group/btn shadow-primary-color/5`}
          aria-label={isSidebarOpen ? "Ocultar menú" : "Mostrar menú"}
          style={{ width: '32px', height: '32px' }}
        >
          {isSidebarOpen ?
            <FaChevronLeft className="text-primary-color text-[10px] group-hover/btn:-translate-x-0.5 transition-transform" /> :
            <FaChevronRight className="text-primary-color text-[10px] group-hover/btn:translate-x-0.5 transition-transform" />}
        </button>

        <div className="p-4 flex flex-col h-full justify-between overflow-hidden">
          <div className="space-y-10">
            <div className={`flex flex-col ${isSidebarOpen ? 'items-start px-2' : 'items-center'}`}>
              {/* Logo Premium */}
              <Link href={'/'} className={`flex items-center ${isSidebarOpen ? 'justify-start w-full gap-3' : 'justify-center'} group`}>
                <div className={`flex items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-all duration-500 shadow-inner translate-z-0 ${isSidebarOpen ? 'w-10 h-10 p-2' : 'w-9 h-9 p-1.5'}`}>
                  <div className="relative w-full h-full">
                    <Image src="/droplab.png" alt="DROPLAB" fill className="object-cover" />
                  </div>
                </div>
                {isSidebarOpen && (
                  <span className="text-white font-black text-xl tracking-tighter group-hover:text-primary-color transition-colors">DROPLAB</span>
                )}
              </Link>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => {
                if (item.adminOnly && !isAdmin() && !item.showForAllAdmins) return null;
                if (!canAccessModule(item.moduleKey)) return null;

                const isActive = router.pathname === item.path || router.pathname.startsWith(item.path + '/');

                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`flex items-center py-3 rounded-2xl transition-all duration-300 cursor-pointer group/item relative ${isSidebarOpen ? 'px-3' : 'px-2 justify-center'} ${isActive ? 'bg-primary-color/10 ring-1 ring-primary-color/20' : 'hover:bg-white/5'}`}
                    >
                      {isActive && isSidebarOpen && (
                        <div className="absolute left-0 w-1 h-6 bg-primary-color rounded-full -ml-1"></div>
                      )}
                      <item.icon className={`text-xl transition-transform duration-300 group-hover/item:scale-110 ${isActive ? 'text-primary-color' : 'text-gray-500 group-hover/item:text-white'}`} />
                      {isSidebarOpen && (
                        <span className={`ml-4 text-sm font-bold transition-all duration-300 whitespace-nowrap ${isActive ? 'text-white' : 'text-gray-500 group-hover/item:text-gray-300'}`}>
                          {item.name}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-white/5 pt-6">
            <button
              onClick={() => {
                router.push('/auth/login');
                logout();
              }}
              className={`w-full flex items-center p-3 rounded-2xl hover:bg-rose-500/10 transition-all group/logout text-gray-500 hover:text-rose-400 ${isSidebarOpen ? 'px-4' : 'px-2 justify-center'}`}
            >
              <FaSignOutAlt className="text-xl transition-transform group-hover/logout:-translate-x-1" />
              {isSidebarOpen && (
                <span className="ml-4 text-sm font-bold whitespace-nowrap">Cerrar Sesión</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Barra de navegación inferior para móviles */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-theme-component z-50">
        <div className="flex justify-around items-center">
          {mobileMenuItems.map((item) => {
            if (item.moduleKey && !canAccessModule(item.moduleKey)) {
              return null;
            }
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center justify-center py-3 px-3 ${router.pathname === item.path ? 'text-primary-color' : 'text-theme-secondary'
                    }`}
                >
                  <item.icon className="text-xl" />
                </div>
              </Link>
            );
          })}
          <div
            className="flex items-center justify-center py-3 px-3 text-red-400"
            onClick={() => {
              router.push('/auth/login');
              logout();
            }}
          >
            <FaSignOutAlt className="text-xl" />
          </div>
        </div>
      </div>

      {/* Main Content - Ajustado para móviles */}
      <main
        className={`flex-1 bg-theme-primary p-8 overflow-y-auto h-screen ${(hasHydrated && !navInProgress) ? 'transition-all duration-300' : 'transition-none'}
                   md:ml-16 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-16'} pb-16 md:pb-8 flex flex-col`}
      >
        <div className="flex-grow">
          {children}
        </div>

        {/* Footer con créditos */}
        <div className="mt-auto pt-4 text-center text-theme-secondary">
          <div className="flex flex-col justify-center items-center">
            <div className="text-xs mt-1 opacity-70">
              Desarrollado por <span className="text-primary-color">RAC</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
