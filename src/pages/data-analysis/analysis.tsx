import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaChartBar, FaBrain } from 'react-icons/fa';
import ExcelDataViewer from '../../components/data-analysis/ExcelDataViewer';
import ExcelFileUploader from '../../components/data-analysis/ExcelFileUploader';
import PageHeader from '../../components/common/PageHeader';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import FeatureGate from '../../components/auth/FeatureGate';

const Analysis = () => {
  const [analysisType, setAnalysisType] = useState<'orders' | 'products'>('orders');
  const [excelData, setExcelData] = useState<any[] | null>(null);

  const handleAnalysisTypeChange = (type: 'orders' | 'products') => {
    setAnalysisType(type);
    // Limpiar datos previos si cambia el tipo de análisis
    setExcelData(null);
  };

  const handleDataLoaded = (data: any[]) => {
    // Verificar que los datos sean válidos antes de establecerlos
    if (Array.isArray(data) && data.length > 0) {
      setExcelData(data);
    } else {
      console.error('Datos inválidos recibidos del componente ExcelFileUploader');
      setExcelData(null);
    }
  };


  return (
    <ProtectedRoute moduleKey={'data-analysis'}>
      <DashboardLayout>
        <FeatureGate feature={'data-analysis.excel-analysis'}>
          <div className="mx-auto w-full">
            <PageHeader 
              title={<><FaBrain className="inline-block mr-2" /> Análisis de Archivos Excel</>}
              description="Analiza datos de órdenes y productos desde archivos Excel"
              backLink="/data-analysis"
            />

            <ExcelFileUploader
              onDataLoaded={handleDataLoaded}
              analysisType={analysisType}
              onAnalysisTypeChange={handleAnalysisTypeChange}
              showTypeSelector={true}
            />

            {excelData && (
              <div className="space-y-8">
                <div className="bg-theme-component p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <FaChartBar className="mr-2 text-primary-color" /> 
                    Análisis de Datos ({analysisType === 'orders' ? 'Órdenes' : 'Productos'})
                  </h2>
                  
                  <ExcelDataViewer data={excelData} analysisType={analysisType} />
                </div>
              </div>
            )}
          </div>
        </FeatureGate>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Analysis;
