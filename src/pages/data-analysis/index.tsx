import DashboardLayout from '../../components/layout/DashboardLayout';
import Link from 'next/link';
import { FaBrain, FaTruckMoving, FaFileExcel, FaChartBar } from 'react-icons/fa';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useAppContext } from '../../contexts/AppContext';
import PageHeader from '../../components/common/PageHeader';

export default function DataAnalysis() {
  const { hasFeature } = useAppContext();
  const showExcel = hasFeature('data-analysis.excel-analysis');
  const showDaily = hasFeature('data-analysis.daily-orders');
  const showMovement = hasFeature('data-analysis.orders-movement');
  const showOrdersMgmt = hasFeature('orders.management');

  return (
    <ProtectedRoute moduleKey={'data-analysis'}>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title="Análisis de Datos"
            description="Explora insights valiosos y realiza seguimientos detallados de tus órdenes y movimientos desde archivos Excel."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {showExcel && (
              <Link href="/profitability">
                <div className="soft-card p-8 group cursor-pointer transition-all duration-300">
                  <div className="flex flex-col gap-5 items-center">
                    <div className="p-4 rounded-2xl bg-primary-color/10 group-hover:bg-primary-color/20 transition-colors">
                      <FaBrain className="w-8 h-8 text-primary-color group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-theme-primary mb-2 group-hover:text-primary-color transition-colors">
                        Análisis de Excel
                      </h2>
                      <p className="text-theme-secondary text-sm leading-relaxed">
                        Analiza datos de archivos Excel y rentabilidad
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
