import DashboardLayout from '../../components/layout/DashboardLayout';
import PriceCalculator from '../../components/Financial/PriceCalculator'
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import PageHeader from '@/components/common/PageHeader';

export default function Calculator() {
  return (
    <ProtectedRoute moduleKey={'calculator'}>
      <DashboardLayout>
        <div className="space-y-6">
          <PageHeader
            title="Calculadora de Precios"
            description="Optimiza tus márgenes y proyecta tus beneficios con precisión estratégica"
          />
          <PriceCalculator />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
