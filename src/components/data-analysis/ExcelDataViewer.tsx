import React, { useState, useEffect } from 'react';
import ExcelAnalysisService, { OrderAnalysisResult, ProductAnalysisResult } from '../../services/data-analysis/ExcelAnalysisService';
import { scrollbarStyles, createGlobalScrollbarStyles } from '../../utils/scrollStyles';

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
          console.log('Analizando datos de órdenes:', data);
          const result = ExcelAnalysisService.analyzeOrdersData(data);
          console.log('Resultado del análisis:', result);
          setSummary(result);
        } else {
          // Análisis por productos
          console.log('Analizando datos de productos:', data);
          const result = ExcelAnalysisService.analyzeProductsData(data);
          console.log('Resultado del análisis:', result);
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

  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {analysisType === 'orders' && summary ? (
          // Tarjetas de resumen para órdenes
          <>
            <div className="bg-theme-primary p-6 rounded-lg shadow flex flex-col items-center justify-center h-full">
              <h3 className="text-lg font-semibold mb-3">Total de Órdenes</h3>
              <p className="text-4xl font-bold text-primary-color">{(summary as OrderAnalysisResult).totalOrders}</p>
            </div>
            <div className="bg-theme-primary p-6 rounded-lg shadow flex flex-col items-center justify-center h-full">
              <h3 className="text-lg font-semibold mb-3">Valor Total</h3>
              <p className="text-4xl font-bold text-primary-color">
                {(summary as OrderAnalysisResult).totalValue > 0 
                  ? (summary as OrderAnalysisResult).totalValue.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
                  : '$0'}
              </p>
            </div>
            <div className="bg-theme-primary p-6 rounded-lg shadow h-full">
              <h3 className="text-lg font-semibold mb-3 text-center">Agrupado por {(summary as OrderAnalysisResult).groupField}</h3>
              <div className={`max-h-48 ${scrollbarStyles.scrollContainer}`}>
                {Object.entries((summary as OrderAnalysisResult).groupedData).length > 0 ? (
                  Object.entries((summary as OrderAnalysisResult).groupedData).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between mb-2 py-1 border-b border-gray-700">
                      <span className="text-theme-secondary">{key}:</span>
                      <span className="font-semibold text-primary-color">{value}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-theme-secondary py-4">No hay datos para agrupar</div>
                )}
              </div>
            </div>
          </>
        ) : analysisType === 'products' && summary ? (
          // Tarjetas de resumen para productos
          <>
            <div className="bg-theme-primary p-6 rounded-lg shadow flex flex-col items-center justify-center h-full">
              <h3 className="text-lg font-semibold mb-3">Productos Únicos</h3>
              <p className="text-4xl font-bold text-primary-color">{(summary as ProductAnalysisResult).uniqueProductsCount}</p>
            </div>
            <div className="bg-theme-primary p-6 rounded-lg shadow flex flex-col items-center justify-center h-full">
              <h3 className="text-lg font-semibold mb-3">Valor Total</h3>
              <p className="text-4xl font-bold text-primary-color">
                {(summary as ProductAnalysisResult).totalValue.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
              </p>
            </div>
            <div className="bg-theme-primary p-6 rounded-lg shadow h-full">
              <h3 className="text-lg font-semibold mb-3 text-center">Productos por Categoría</h3>
              <div className={`max-h-48 ${scrollbarStyles.scrollContainer}`}>
                {Object.entries((summary as ProductAnalysisResult).productsByCategory).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between mb-2 py-1 border-b border-gray-700">
                    <span className="text-theme-secondary">{key}:</span>
                    <span className="font-semibold text-primary-color">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          // Estado de carga
          <div className="col-span-3 text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-color mx-auto mb-4"></div>
            <p>Analizando datos...</p>
          </div>
        )}
      </div>

      {summary && (
        <div className="bg-theme-primary p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-center">
            {analysisType === 'orders' ? 'Distribución de Órdenes' : 'Distribución de Productos'}
          </h3>
          
          {analysisType === 'orders' ? (
            // Distribuciones para órdenes
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-theme-component p-4 rounded-lg">
                <h4 className="text-md font-semibold mb-3 text-center">Por Estado</h4>
                <div className={`max-h-60 ${scrollbarStyles.scrollContainer}`}>
                  {Object.entries((summary as OrderAnalysisResult).statusDistribution || {}).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between mb-2 py-1 border-b border-gray-700">
                      <span className="text-theme-secondary">{key}:</span>
                      <span className="font-semibold text-primary-color">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-theme-component p-4 rounded-lg">
                <h4 className="text-md font-semibold mb-3 text-center">Por Transportadora</h4>
                <div className={`max-h-60 ${scrollbarStyles.scrollContainer}`}>
                  {Object.entries((summary as OrderAnalysisResult).carrierDistribution || {}).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between mb-2 py-1 border-b border-gray-700">
                      <span className="text-theme-secondary">{key}:</span>
                      <span className="font-semibold text-primary-color">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Área para futura implementación de gráficos para productos
            <div className="h-80 flex items-center justify-center bg-theme-component rounded-lg">
              <div className="text-center">
                <svg className="w-24 h-24 mx-auto mb-4 text-gray-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <p className="text-theme-secondary text-lg">
                  Aquí se mostrará un gráfico de distribución
                </p>
                <p className="text-theme-tertiary text-sm mt-2">
                  (Implementación futura)
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Sección adicional para análisis de órdenes */}
      {analysisType === 'orders' && summary && (
        <div className="bg-theme-primary p-6 rounded-lg shadow mt-6">
          <h3 className="text-xl font-semibold mb-4 text-center">Resumen Financiero</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-theme-component p-4 rounded-lg flex flex-col items-center">
              <h4 className="text-md font-semibold mb-2">Ganancia Total</h4>
              <p className="text-2xl font-bold text-green-500">
                {(summary as OrderAnalysisResult).totalProfit > 0
                  ? (summary as OrderAnalysisResult).totalProfit.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
                  : '$0'}
              </p>
            </div>
            
            <div className="bg-theme-component p-4 rounded-lg flex flex-col items-center">
              <h4 className="text-md font-semibold mb-2">Ganancia antes de Pauta</h4>
              <p className="text-2xl font-bold text-blue-500">
                {(summary as OrderAnalysisResult).totalProfit > 0 && (summary as OrderAnalysisResult).totalShippingCost > 0
                  ? ((summary as OrderAnalysisResult).totalProfit + (summary as OrderAnalysisResult).totalShippingCost).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
                  : '$0'}
              </p>
            </div>
            
            <div className="bg-theme-component p-4 rounded-lg flex flex-col items-center">
              <h4 className="text-md font-semibold mb-2">Costo de Envíos</h4>
              <p className="text-2xl font-bold text-yellow-500">
                {(summary as OrderAnalysisResult).totalShippingCost > 0
                  ? (summary as OrderAnalysisResult).totalShippingCost.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
                  : '$0'}
              </p>
            </div>
            
            <div className="bg-theme-component p-4 rounded-lg flex flex-col items-center">
              <h4 className="text-md font-semibold mb-2">Costo Devoluciones</h4>
              <p className="text-2xl font-bold text-red-500">
                {(summary as OrderAnalysisResult).totalReturnCost > 0
                  ? (summary as OrderAnalysisResult).totalReturnCost.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
                  : '$0'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelDataViewer;
