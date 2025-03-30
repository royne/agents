import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaDatabase } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Link from 'next/link';

const modules = [
  {
    name: 'Productos',
    icon: FaDatabase,
    description: 'Gestión de productos',
    path: '/dbmanager/products'
  },
  {
    name: 'Campañas',
    icon: FaDatabase,
    description: 'Gestión de campañas',
    path: '/dbmanager/campaigns'
  },
  {
    name: 'Anuncios',
    icon: FaDatabase,
    description: 'Gestión de anuncios',
    path: '/dbmanager/ads'
  }
];

export default function DBManager() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl mb-8">Gestión de Base de Datos</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
