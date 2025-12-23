import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
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
    <ProtectedRoute moduleKey={'profitability'}>
      <DashboardLayout>
        <div className="max-w-full mx-auto">
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
                <div className="soft-card p-8 group cursor-pointer transition-all duration-300">
                  <div className="flex flex-col gap-5 items-center">
                    <div className="p-4 rounded-2xl bg-primary-color/10 group-hover:bg-primary-color/20 transition-colors">
                      <module.icon className="w-8 h-8 text-primary-color group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-theme-primary mb-2 group-hover:text-primary-color transition-colors">
                        {module.name}
                      </h2>
                      <p className="text-theme-secondary text-sm leading-relaxed">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
