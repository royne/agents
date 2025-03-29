import React from 'react';
import { FaComments, FaChartLine, FaTruck, FaCog, FaRobot } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Link from 'next/link';

const menuItems = [
  { name: 'MultiChat', icon: FaComments, path: '/chat' },
  { name: 'Rentabilidad', icon: FaChartLine, path: '/profitability' },
  { name: 'Logística', icon: FaTruck, path: '/logistics' },
  { name: 'Agentes', icon: FaRobot, path: '/agents' },
  { name: 'Configuración', icon: FaCog, path: '/settings' },
];

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-gray-100 p-4 border-r border-gray-700">
        <div className="mb-8 text-center text-xl font-bold">
          <Link href={'/dashboard'}>Dashboard</Link>
        </div>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="flex items-center p-3 rounded hover:bg-gray-700 transition-colors"
            >
              <item.icon className="mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-gray-900 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
