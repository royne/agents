import DashboardLayout from '../../components/layout/DashboardLayout';
import PriceCalculator from '../../components/Financial/PriceCalculator'

export default function Calculator() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">Calculadora de Precios</h1>
        <PriceCalculator />
      </div>
    </DashboardLayout>
  );
}
