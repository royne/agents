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
              <Link href="/data-analysis/analysis">
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
                        Analiza datos de archivos Excel por órdenes y productos
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {showDaily && (
              <Link href="/data-analysis/daily-orders">
                <div className="soft-card p-8 group cursor-pointer transition-all duration-300">
                  <div className="flex flex-col gap-5 items-center">
                    <div className="p-4 rounded-2xl bg-primary-color/10 group-hover:bg-primary-color/20 transition-colors">
                      <FaChartBar className="w-8 h-8 text-primary-color group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-theme-primary mb-2 group-hover:text-primary-color transition-colors">
                        Análisis Diario
                      </h2>
                      <p className="text-theme-secondary text-sm leading-relaxed">
                        Analiza rendimiento por campaña (UTM term) y anuncio (UTM content)
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {showMovement && (
              <Link href="/data-analysis/orders-movement">
                <div className="soft-card p-8 group cursor-pointer transition-all duration-300">
                  <div className="flex flex-col gap-5 items-center">
                    <div className="p-4 rounded-2xl bg-primary-color/10 group-hover:bg-primary-color/20 transition-colors">
                      <FaTruckMoving className="w-8 h-8 text-primary-color group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-theme-primary mb-2 group-hover:text-primary-color transition-colors">
                        Movimiento
                      </h2>
                      <p className="text-theme-secondary text-sm leading-relaxed">
                        Analiza y rastrea el estado de órdenes en proceso de entrega
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {showOrdersMgmt && (
              <Link href="/orders/management">
                <div className="soft-card p-8 group cursor-pointer transition-all duration-300">
                  <div className="flex flex-col gap-5 items-center">
                    <div className="p-4 rounded-2xl bg-primary-color/10 group-hover:bg-primary-color/20 transition-colors">
                      <FaFileExcel className="w-8 h-8 text-primary-color group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-theme-primary mb-2 group-hover:text-primary-color transition-colors">
                        Gestión
                      </h2>
                      <p className="text-theme-secondary text-sm leading-relaxed">
                        Sincroniza y asigna órdenes desde archivos Excel a campañas
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
