import DashboardLayout from '../components/layout/DashboardLayout';
import { FaComments, FaChartLine, FaTruck, FaCog, FaRobot, FaDatabase, FaLock, FaDollarSign } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAppContext } from '../contexts/AppContext';

const modules = [
  {
    name: 'Agentes',
    icon: FaComments,
    description: 'Chat con múltiples agentes IA',
    path: '/agents'
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
    path: '/logistic'
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
  },
  {
    name: 'Master Chat',
    icon: FaRobot,
    description: 'Chat con RAG',
    path: '/chat'
  }
];

export default function Dashboard() {
  const router = useRouter();
  const { isAdmin } = useAppContext();

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl mb-8">Bienvenido al Panel de Control</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            // Verificar si es el módulo de chat con RAG
            const isRagModule = module.path === '/chat';
            const isDisabled = isRagModule && !isAdmin();
            
            // Componente de tarjeta
            const card = (
              <div className={`bg-theme-component p-6 rounded-lg shadow-md ${!isDisabled ? 'cursor-pointer hover:bg-theme-component-hover transform hover:-translate-y-0.5' : 'opacity-70'} transition-all duration-200 relative card`}>
                {isDisabled && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center z-10">
                    <div className="bg-theme-component p-3 rounded-lg shadow-lg flex items-center space-x-2">
                      <FaLock className="text-yellow-500" />
                      <span className="text-white text-sm">Solo administradores</span>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-4 items-center">
                  <module.icon className={`w-8 h-8 ${isDisabled ? 'text-theme-tertiary' : 'text-primary-color card-icon'}`} />
                  <h2 className="text-xl font-bold text-theme-primary">
                    {module.name}
                  </h2>
                  <p className="text-theme-secondary text-center">
                    {module.description}
                  </p>
                </div>
              </div>
            );
            
            // Envolver en Link solo si no está deshabilitado
            return isDisabled ? (
              <div key={module.path} title="Esta función solo está disponible para administradores">
                {card}
              </div>
            ) : (
              <Link key={module.path} href={module.path}>
                {card}
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
