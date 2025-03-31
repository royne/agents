import React, { useState } from 'react';
import { FaComments, FaChartLine, FaTruck, FaCog, FaRobot, FaSignOutAlt, FaDatabase } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useAppContext } from '../../contexts/AppContext';
import Link from 'next/link';

const menuItems = [
  { name: 'MultiChat', icon: FaComments, path: '/chat' },
  { name: 'Rentabilidad', icon: FaChartLine, path: '/profitability' },
  { name: 'Logística', icon: FaTruck, path: '/logistics' },
  { name: 'Manager DB', icon: FaDatabase, path: '/dbmanager' },
  { name: 'Agentes', icon: FaRobot, path: '/agents' },
  { name: 'Configuración', icon: FaCog, path: '/settings' },
];

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { logout } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-900">
      {/* Sidebar para escritorio/tablet - Oculto en móviles */}
      <div 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-16'
        } bg-gray-800 transition-all duration-300 fixed h-screen z-50 hidden md:block`}
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
      >
        <div className="p-4 flex flex-col h-full justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className='flex items-center px-2'><FaRobot /></div>
              {isSidebarOpen && (
                <Link href={'/'}>
                  <span className="text-white font-bold text-xl">Dashboard</span>
                </Link>
              )}
            </div>
            
            <nav className="flex-1 mt-6">
              {menuItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <div
                    className={`flex items-center py-3 px-2 rounded hover:bg-gray-700 transition-colors cursor-pointer ${
                      router.pathname === item.path ? 'bg-gray-700' : ''
                    }`}
                  >
                    <item.icon className="text-gray-300 text-xl" />
                    {isSidebarOpen && (
                      <span className="text-gray-300 ml-3 whitespace-nowrap">
                        {item.name}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <button 
              onClick={() => {
                router.push('/auth/login');
                logout();
              }}
              className="w-full flex items-center p-3 rounded hover:bg-gray-700 transition-colors text-red-400"
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 z-50">
        <div className="flex justify-around items-center">
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center justify-center py-3 px-3 ${
                  router.pathname === item.path ? 'text-white' : 'text-gray-400'
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
        className={`flex-1 bg-gray-900 p-8 overflow-y-auto h-screen transition-all duration-300
                   md:ml-16 ${isSidebarOpen ? 'md:ml-64' : ''} pb-16 md:pb-8`}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
