import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaChartBar } from 'react-icons/fa';
import ExcelFileUploader from '../../components/data-analysis/ExcelFileUploader';
import PageHeader from '../../components/common/PageHeader';
import DailyOrdersUTMViewer from '../../components/data-analysis/DailyOrdersUTMViewer';

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
    <DashboardLayout>
      <div className="mx-auto w-full">
        <PageHeader 
          title={<><FaChartBar className="inline-block mr-2" /> Análisis Diario de Órdenes por UTM</>}
          description="Sube el Excel del POS y analiza el rendimiento por campaña (UTM term) y anuncio (UTM content)."
          backLink="/data-analysis"
        />

        <ExcelFileUploader
          onDataLoaded={handleDataLoaded}
          analysisType={'orders'}
          showTypeSelector={false}
        />

        {excelData && (
          <div className="space-y-8">
            <div className="bg-theme-component p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaChartBar className="mr-2 text-primary-color" /> 
                Resultados del análisis UTM
              </h2>
              
              <DailyOrdersUTMViewer data={excelData} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DailyOrdersAnalysis;
