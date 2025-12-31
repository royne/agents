import React, { useState, useEffect } from 'react';
import ExcelAnalysisService, { OrderAnalysisResult, ProductAnalysisResult } from '../../services/data-analysis/ExcelAnalysisService';
import { createGlobalScrollbarStyles } from '../../utils/scrollStyles';
import OrdersAnalysisViewer from './OrdersAnalysisViewer';
import ProductsAnalysisViewer from './ProductsAnalysisViewer';

interface ExcelDataViewerProps {
  data: any[];
  analysisType: 'orders' | 'products';
}

const ExcelDataViewer: React.FC<ExcelDataViewerProps> = ({ data, analysisType }) => {
  const [summary, setSummary] = useState<OrderAnalysisResult | ProductAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Crear estilos globales para scrollbars
  useEffect(() => {
    createGlobalScrollbarStyles();
  }, []);

  useEffect(() => {
    if (data && data.length > 0) {
      setIsLoading(true);
      try {
        if (analysisType === 'orders') {
          // Análisis por órdenes
          const result = ExcelAnalysisService.analyzeOrdersData(data);
          setSummary(result);
        } else {
          // Análisis por productos
          const result = ExcelAnalysisService.analyzeProductsData(data);
          setSummary(result);
        }
      } catch (error) {
        console.error('Error al analizar datos:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [data, analysisType]);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-color mx-auto mb-4"></div>
        <p className="text-theme-secondary">Analizando datos...</p>
      </div>
    );
  }
  
  if (!summary) {
    return (
      <div className="p-8 text-center bg-theme-component rounded-lg">
        <p className="text-theme-secondary">No hay datos para analizar. Por favor, carga un archivo Excel válido.</p>
      </div>
    );
  }

  // Renderizar el componente adecuado según el tipo de análisis
  return (
    <div className="py-4">
      {analysisType === 'orders' ? (
        <OrdersAnalysisViewer 
          data={data} 
          summary={summary as OrderAnalysisResult} 
        />
      ) : (
        <ProductsAnalysisViewer 
          data={data} 
          summary={summary as ProductAnalysisResult} 
        />
      )}
    </div>
  );
};

export default ExcelDataViewer;
