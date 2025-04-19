import React, { useState, useEffect } from 'react';
import { FaComments, FaChartLine, FaTruck, FaCog, FaRobot, FaSignOutAlt, FaDatabase, FaDollarSign } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useAppContext } from '../../contexts/AppContext';
import Link from 'next/link';

const menuItems = [
  { name: 'Agentes', icon: FaComments, path: '/agents' },
  { name: 'Rentabilidad', icon: FaChartLine, path: '/profitability' },
  { name: 'Calculadora de Precios', icon: FaDollarSign, path: '/calculator' },
  { name: 'Logística', icon: FaTruck, path: '/logistic' },
  { name: 'Análisis de Datos', icon: FaDatabase, path: '/data-analysis' },
  { name: 'Manager DB', icon: FaDatabase, path: '/dbmanager' },
  { name: 'Master Chat', icon: FaRobot, path: '/chat' },
  { name: 'Configuración', icon: FaCog, path: '/settings' },
];

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { logout, themeConfig } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
        className={`${
          isSidebarOpen ? 'w-64' : 'w-16'
        } bg-theme-component transition-all duration-300 fixed h-screen z-50 hidden md:block`}
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
      >
        <div className="p-4 flex flex-col h-full justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className='flex items-center px-2 text-primary-color'><FaRobot /></div>
              {isSidebarOpen && (
                <Link href={'/'}>
                  <span className="text-theme-primary font-bold text-xl">Dashboard</span>
                </Link>
              )}
            </div>
            
            <nav className="flex-1 mt-6">
              {menuItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <div
                    className={`flex items-center py-3 px-2 rounded hover:bg-theme-component-hover transition-colors cursor-pointer ${
                      router.pathname === item.path ? 'bg-theme-component-active' : ''
                    }`}
                  >
                    <item.icon className={`${router.pathname === item.path ? 'text-primary-color active-item' : 'text-theme-secondary'} text-xl`} />
                    {isSidebarOpen && (
                      <span className={`${router.pathname === item.path ? 'text-primary-color active-item' : 'text-theme-secondary'} ml-3 whitespace-nowrap`}>
                        {item.name}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          <div className="border-t border-theme-color pt-4">
            <button 
              onClick={() => {
                router.push('/auth/login');
                logout();
              }}
              className="w-full flex items-center p-3 rounded hover:bg-theme-component-hover transition-colors text-red-400"
            >
              <FaSignOutAlt className="text-xl" />
              {isSidebarOpen && (
                <span className="ml-3 whitespace-nowrap">Cerrar Sesión</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Barra de navegación inferior para móviles */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-theme-component z-50">
        <div className="flex justify-around items-center">
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center justify-center py-3 px-3 ${
                  router.pathname === item.path ? 'text-primary-color' : 'text-theme-secondary'
                }`}
              >
                <item.icon className="text-xl" />
              </div>
            </Link>
          ))}
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
        className={`flex-1 bg-theme-primary p-8 overflow-y-auto h-screen transition-all duration-300
                   md:ml-16 ${isSidebarOpen ? 'md:ml-64' : ''} pb-16 md:pb-8`}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
