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
    <div className="min-h-screen flex bg-gray-900">
      {/* Sidebar Colapsable */}
      <div 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-16'
        } bg-gray-800 transition-all duration-300 fixed h-full hover:w-64 z-50`}
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
      >
        <div className="p-4 flex flex-col h-full justify-between">
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

      {/* Main Content */}
      <main 
        className={`flex-1 bg-gray-900 p-8 overflow-auto ${
          isSidebarOpen ? 'ml-64' : 'ml-16'
        } transition-all duration-300`}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
