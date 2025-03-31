import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaChartLine } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SalesGrafic from '../../components/Financial/salesGrafic';

const modules = [
  {
    name: 'Registro de Ventas',
    icon: FaChartLine,
    description: 'Registro de ventas',
    path: '/profitability/sales'
  },
  {
    name: 'Análisis de Ventas',
    icon: FaChartLine,
    description: 'Análisis de ventas y estadísticas',
    path: '/profitability/sales-tracking'
  }
];

export default function Profitability() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl mb-8">Control diario</h1>
        <div className="mb-6">
          <SalesGrafic periodDays={14} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
