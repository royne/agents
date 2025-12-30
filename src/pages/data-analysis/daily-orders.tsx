import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaChartBar } from 'react-icons/fa';
import ExcelFileUploader from '../../components/data-analysis/ExcelFileUploader';
import PageHeader from '../../components/common/PageHeader';
import DailyOrdersUTMViewer from '../../components/data-analysis/DailyOrdersUTMViewer';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import FeatureGate from '../../components/auth/FeatureGate';

const DailyOrdersAnalysis = () => {
  const [excelData, setExcelData] = useState<any[] | null>(null);

  const handleDataLoaded = (data: any[]) => {
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
        <FeatureGate feature={'data-analysis.daily-orders'}>
          <div className="mx-auto w-full">
            <PageHeader
              title={<><FaChartBar className="inline-block mr-2" /> Análisis Diario de Órdenes por UTM</>}
              description="Sube el Excel del POS y analiza el rendimiento por campaña (UTM term) y anuncio (UTM content)."
              backLink="/admin"
            />

            <ExcelFileUploader
              onDataLoaded={handleDataLoaded}
              analysisType={'orders'}
              showTypeSelector={false}
            />

            {excelData && (
              <div className="space-y-8">
                <div className="soft-card p-8">
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <div className="p-2 bg-primary-color/10 rounded-lg mr-3">
                      <FaChartBar className="text-primary-color" />
                    </div>
                    Resultados del análisis UTM
                  </h2>

                  <DailyOrdersUTMViewer data={excelData} />
                </div>
              </div>
            )}
          </div>
        </FeatureGate>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DailyOrdersAnalysis;
