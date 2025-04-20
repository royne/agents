import DashboardLayout from '../../components/layout/DashboardLayout';
import Link from 'next/link';
import { FaFileExcel, FaChartBar, FaBrain } from 'react-icons/fa';

export default function DataAnalysis() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl mb-8">Análisis de Datos</h1>
        <p className="text-theme-secondary mb-8">
          Aquí puedes realizar análisis de datos y obtener insights valiosos a partir de archivos Excel.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/data-analysis/analysis">
            <div className="bg-theme-component p-6 rounded-lg shadow-md cursor-pointer hover:bg-theme-component-hover transform hover:-translate-y-0.5 transition-all duration-200 relative">
              <div className="flex flex-col gap-4 items-center">
                <FaBrain className="w-8 h-8 text-primary-color" />
                <h2 className="text-xl font-bold text-theme-primary">
                  Análisis de Excel
                </h2>
                <p className="text-theme-secondary text-center">
                  Analiza datos de archivos Excel por órdenes y productos
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
