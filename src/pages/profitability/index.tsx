import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaDollarSign, FaMoneyBillWave, FaStream, FaChartLine } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SalesGrafic from '../../components/Financial/salesGrafic';
import { FaArrowTrendDown } from 'react-icons/fa6';
import PageHeader from '../../components/common/PageHeader';

const modules = [
  {
    name: 'Registro de Ventas',
    icon: FaDollarSign,
    description: 'Registro de ventas',
    path: '/profitability/sales'
  },
  {
    name: 'Análisis de Ventas',
    icon: FaMoneyBillWave,
    description: 'Análisis de ventas y estadísticas',
    path: '/profitability/sales-tracking'
  },
  {
    name: 'Análisis de gastos ',
    icon: FaArrowTrendDown,
    description: 'Análisis de gastos',
    path: '/profitability/expenses'
  }
];

export default function Profitability() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title={
            <>
              <FaChartLine className="inline-block mr-2 mb-1" />
              Control de Rentabilidad
            </>
          }
          description="Monitorea y analiza las ventas, gastos y rentabilidad de tu negocio."
        />
        <div className="mb-6">
          <SalesGrafic periodDays={14} />
        </div>
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
