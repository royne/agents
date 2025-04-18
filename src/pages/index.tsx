import DashboardLayout from '../components/layout/DashboardLayout';
import { FaComments, FaChartLine, FaTruck, FaCog, FaRobot, FaDatabase, FaDollarSign } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Link from 'next/link';

const modules = [
  {
    name: 'MultiChat',
    icon: FaComments,
    description: 'Chat con múltiples agentes IA',
    path: '/chat'
  },
  {
    name: 'Rentabilidad',
    icon: FaChartLine,
    description: 'Análisis de ventas y estadísticas',
    path: '/profitability'
  },
  {
    name: 'Calculadora de Precios',
    icon: FaDollarSign,
    description: 'Calculadora de precios',
    path: '/calculator'
  },
  {
    name: 'Logística',
    icon: FaTruck,
    description: 'Gestión de logística y envíos',
    path: '/logistics'
  },
  {
    name: 'Agentes',
    icon: FaRobot,
    description: 'Administración de agentes IA',
    path: '/agents'
  },
  {
    name: 'Manager DB',
    icon: FaDatabase,
    description: 'Gestión de base de datos',
    path: '/dbmanager'
  },
  {
    name: 'Configuración',
    icon: FaCog,
    description: 'Configuración del sistema',
    path: '/settings'
  }
];

export default function Dashboard() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl mb-8">Bienvenido al Panel de Control</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Link key={module.path} href={module.path}>
              <div className="bg-gray-800 p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-700 transform hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex flex-col gap-4 items-center">
                  <module.icon className="w-8 h-8 text-blue-500" />
                  <h2 className="text-xl font-bold">
                    {module.name}
                  </h2>
                  <p className="text-gray-100 text-center">
                    {module.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
