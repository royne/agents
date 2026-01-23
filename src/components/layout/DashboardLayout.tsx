import React, { useState, useEffect } from 'react';
import { FaComments, FaChartLine, FaTruck, FaCog, FaRobot, FaSignOutAlt, FaDatabase, FaDollarSign, FaBrain, FaUsersCog, FaAd, FaChevronLeft, FaChevronRight, FaMagic, FaFilm, FaRocket, FaUsers, FaCrown, FaPlayCircle } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useAppContext } from '../../contexts/AppContext';
import type { ModuleKey } from '../../constants/plans';
import Link from 'next/link';
import Image from 'next/image';
import RenewalBanner from '../common/RenewalBanner';

type MenuItem = { name: string; icon: any; path: string; adminOnly?: boolean; showForAllAdmins?: boolean; moduleKey: ModuleKey };

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const menuSections: MenuSection[] = [
  {
    title: 'CREACIÓN',
    items: [
      { name: 'Estratega Pro', icon: FaRocket, path: '/v2', adminOnly: true, showForAllAdmins: true, moduleKey: 'admin' },
      { name: 'Imagen Pro', icon: FaMagic, path: '/image-pro', moduleKey: 'image-pro' },
      { name: 'Landing PRO', icon: FaAd, path: '/landing-pro', moduleKey: 'landing-pro' },
      { name: 'Video PRO', icon: FaFilm, path: '/video-pro', moduleKey: 'video-pro' }
    ]
  },
  {
    title: 'CONTROL',
    items: [
      { name: 'Análisis de Rentabilidad', icon: FaBrain, path: '/data-analysis/analysis', moduleKey: 'data-analysis' },
      { name: 'Calculadora de Precios', icon: FaDollarSign, path: '/calculator', moduleKey: 'calculator' },
      { name: 'Gestión Logística', icon: FaTruck, path: '/logistic', moduleKey: 'logistic' },
    ]
  },
  {
    title: 'INTELIGENCIA',
    items: [
      { name: 'Agentes', icon: FaComments, path: '/agents', moduleKey: 'agents' },
      { name: 'Master Chat', icon: FaRobot, path: '/chat', moduleKey: 'chat' },
    ]
  },
  {
    title: 'SISTEMA',
    items: [
      { name: 'Referidos', icon: FaUsers, path: '/referrals', moduleKey: 'settings' }, // Usamos settings como key base accesible
      { name: 'Tutoriales', icon: FaPlayCircle, path: '/tutorials', moduleKey: 'settings' },
      { name: 'Configuración', icon: FaCog, path: '/settings', moduleKey: 'settings' },
      { name: 'Pagos', icon: FaDollarSign, path: '/admin/payments', adminOnly: true, showForAllAdmins: true, moduleKey: 'admin' },
      { name: 'Administración', icon: FaUsersCog, path: '/admin', adminOnly: true, showForAllAdmins: true, moduleKey: 'admin' },
    ]
  }
];

import MobileNavigation from './MobileNavigation';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { logout, themeConfig, isAdmin, canAccessModule, authData } = useAppContext();
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

        <div className="flex flex-col h-full justify-between pb-4 overflow-hidden">
          <div className="flex flex-col h-full overflow-hidden">
            <div className={`pt-6 pb-8 flex flex-col ${isSidebarOpen ? 'items-start px-6' : 'items-center'}`}>
              {/* Logo Premium */}
              <Link href={'/'} className={`flex items-center ${isSidebarOpen ? 'justify-start w-full gap-3' : 'justify-center'} group`}>
                <div className={`flex items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-all duration-500 shadow-inner translate-z-0 ${isSidebarOpen ? 'w-10 h-10 p-2' : 'w-9 h-9 p-1.5'}`}>
                  <div className="relative w-full h-full">
                    <Image src="/droplab.png" alt="DROPAPP" fill className="object-cover" />
                  </div>
                </div>
                {isSidebarOpen && (
                  <span className="text-white font-black text-xl tracking-tighter group-hover:text-primary-color transition-colors">DROPAPP</span>
                )}
              </Link>
            </div>

            <nav id="tour-sidebar" className="flex-1 px-3 space-y-6 overflow-y-auto custom-scrollbar pb-10">
              {menuSections.map((section) => {
                // Filtrar los items de la sección según permisos
                const visibleItems = section.items.filter(item => {
                  if (item.adminOnly && !isAdmin() && !item.showForAllAdmins) return false;
                  if (!canAccessModule(item.moduleKey)) return false;

                  // REGLA: Si es el link de referidos, ocultar si no es mentor
                  if (item.path === '/referrals' && !authData?.is_mentor) return false;

                  return true;
                });

                if (visibleItems.length === 0) return null;

                return (
                  <div key={section.title} className="space-y-2">
                    {isSidebarOpen && (
                      <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-2">
                        {section.title}
                      </h3>
                    )}
                    <div className="space-y-1">
                      {visibleItems.map((item) => {
                        const isActive = router.pathname === item.path || router.pathname.startsWith(item.path + '/');
                        return (
                          <Link key={item.path} href={item.path}>
                            <div
                              id={item.path === '/tutorials' ? 'tour-tutorials-step' : undefined}
                              className={`flex items-center py-2.5 rounded-xl transition-all duration-300 cursor-pointer group/item relative ${isSidebarOpen ? 'px-3' : 'px-1 justify-center'} ${isActive ? 'bg-primary-color/10 ring-1 ring-primary-color/20 text-white' : 'hover:bg-white/5 text-gray-500'}`}
                            >
                              {isActive && isSidebarOpen && (
                                <div className="absolute left-0 w-0.5 h-5 bg-primary-color rounded-full"></div>
                              )}
                              <item.icon className={`text-lg transition-transform duration-300 group-hover/item:scale-110 ${isActive ? 'text-primary-color' : 'group-hover/item:text-white'}`} title={item.name} />
                              {isSidebarOpen && (
                                <span className={`ml-3 text-xs font-bold transition-all duration-300 whitespace-nowrap ${isActive ? 'text-white' : 'group-hover/item:text-gray-300'}`}>
                                  {item.name}
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-white/5 pt-4 px-3 space-y-1">
            {/* VIP / UPGRADE BUTTON */}
            {authData?.plan !== 'business' && (
              <Link
                href="/pricing"
                className={`
                  w-full flex items-center p-3 rounded-xl transition-all duration-300 group/upgrade
                  bg-gradient-to-br from-[#12D8FA] to-[#0066FF] text-white shadow-[0_4px_15px_rgba(18,216,250,0.2)] hover:shadow-[0_8px_25px_rgba(18,216,250,0.4)] hover:scale-[1.02] active:scale-95 border border-white/10
                  ${isSidebarOpen ? 'justify-start' : 'justify-center'}
                `}
                title="Planes y Créditos"
              >
                <div className="flex items-center justify-center w-6 h-6 shrink-0">
                  <FaCrown className={`text-lg transition-transform duration-500 ${isSidebarOpen ? 'group-hover/upgrade:rotate-12 group-hover/upgrade:-translate-y-0.5' : ''}`} />
                </div>
                {isSidebarOpen && (
                  <span className="ml-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden">
                    Planes y Créditos
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={logout}
              className={`w-full flex items-center p-3 rounded-xl transition-all group/logout duration-300 ${isSidebarOpen
                ? 'hover:bg-rose-500/5 text-gray-600 hover:text-rose-400'
                : 'justify-center text-gray-600 hover:text-rose-400'
                }`}
              title="Cerrar Sesión"
            >
              <div className="flex items-center justify-center w-6 h-6">
                <FaSignOutAlt className="text-xl transition-transform group-hover/logout:-translate-x-1" />
              </div>
              {isSidebarOpen && (
                <span className="ml-3 text-xs font-bold whitespace-nowrap">Cerrar Sesión</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation for Mobile */}
      <MobileNavigation
        menuSections={menuSections}
        canAccessModule={canAccessModule}
        isAdmin={isAdmin}
        authData={authData}
        logout={logout}
      />

      {/* Main Content - Ajustado para móviles */}
      <main
        className={`flex-1 bg-theme-primary overflow-y-auto h-screen ${(hasHydrated && !navInProgress) ? 'transition-all duration-300' : 'transition-none'}
                   md:ml-16 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-16'} pb-16 md:pb-0 flex flex-col`}
      >
        <RenewalBanner />
        <div className="flex-grow p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
