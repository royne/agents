import React from 'react';
import { ProductAnalysisResult } from '../../services/data-analysis/ExcelAnalysisService';
import { scrollbarStyles } from '../../utils/scrollStyles';
import CategoryDistributionChart from '../charts/CategoryDistributionChart';
import ProductProfitabilityChart from '../charts/ProductProfitabilityChart';
import TopProductsChart from '../charts/TopProductsChart';
import ProductMetricsChart from '../charts/ProductMetricsChart';

interface ProductsAnalysisViewerProps {
  data: any[];
  summary: ProductAnalysisResult;
}

const ProductsAnalysisViewer: React.FC<ProductsAnalysisViewerProps> = ({ data, summary }) => {
  return (
    <div>
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-theme-primary p-6 rounded-lg shadow flex flex-col items-center justify-center h-full">
          <h3 className="text-lg font-semibold mb-3">Productos Únicos</h3>
          <p className="text-4xl font-bold text-primary-color">{summary.uniqueProductsCount}</p>
        </div>
        <div className="bg-theme-primary p-6 rounded-lg shadow flex flex-col items-center justify-center h-full">
          <h3 className="text-lg font-semibold mb-3">Valor Total</h3>
          <p className="text-4xl font-bold text-primary-color">
            {summary.totalValue.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
          </p>
        </div>
        <div className="bg-theme-primary p-6 rounded-lg shadow h-full">
          <h3 className="text-lg font-semibold mb-3 text-center">Productos por Categoría</h3>
          <div className={`max-h-48 ${scrollbarStyles.scrollContainer}`}>
            {Object.entries(summary.productsByCategory).map(([key, value]: [string, any]) => (
              <div key={key} className="flex justify-between mb-2 py-1 border-b border-gray-700">
                <span className="text-theme-secondary">{key}:</span>
                <span className="font-semibold text-primary-color">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resumen Financiero */}
      <div className="bg-theme-primary p-6 rounded-lg shadow mt-6">
        <h3 className="text-xl font-semibold mb-4 text-center">Resumen Financiero</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-theme-component p-4 rounded-lg flex flex-col items-center">
            <h4 className="text-md font-semibold mb-2">Ganancia Total</h4>
            <p className="text-2xl font-bold text-green-500">
              {summary.totalProfit.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
            </p>
          </div>
          
          <div className="bg-theme-component p-4 rounded-lg flex flex-col items-center">
            <h4 className="text-md font-semibold mb-2">Costo Total</h4>
            <p className="text-2xl font-bold text-yellow-500">
              {summary.totalCost.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
            </p>
          </div>
          
          <div className="bg-theme-component p-4 rounded-lg flex flex-col items-center">
            <h4 className="text-md font-semibold mb-2">Margen Promedio</h4>
            <p className="text-2xl font-bold text-blue-500">
              {(summary.averageMargin * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
      
      {/* Visualizaciones gráficas */}
      <div className="bg-theme-primary p-6 rounded-lg shadow mt-6">
        <h3 className="text-xl font-semibold mb-4 text-center">
          Análisis Gráfico de Productos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de métricas de productos */}
          <ProductMetricsChart 
            uniqueProductsCount={summary.uniqueProductsCount}
            totalQuantity={Object.entries(summary.productsByCategory).reduce((sum, [_, count]) => sum + (count as number), 0)}
            totalValue={summary.totalValue}
            totalCost={summary.totalCost}
            totalProfit={summary.totalProfit}
            averageMargin={summary.averageMargin}
          />
          
          {/* Gráfico de distribución por categoría */}
          <div className="bg-theme-component p-4 rounded-lg shadow h-96">
            <h3 className="text-lg font-semibold mb-3 text-center">Distribución por Categoría</h3>
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-4 bg-theme-component rounded-lg">
                <p className="text-lg mb-2">Visualización de categorías</p>
                <p className="text-sm text-theme-secondary">
                  Los datos actuales no tienen la estructura requerida para este gráfico.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfico de rentabilidad por categoría */}
          <div className="bg-theme-component p-4 rounded-lg shadow h-96">
            <h3 className="text-lg font-semibold mb-3 text-center">Rentabilidad por Categoría</h3>
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-4 bg-theme-component rounded-lg">
                <p className="text-lg mb-2">Visualización de rentabilidad</p>
                <p className="text-sm text-theme-secondary">
                  Los datos actuales no tienen la estructura requerida para este gráfico.
                </p>
              </div>
            </div>
          </div>
          
          {/* Gráfico de productos más vendidos */}
          <div className="bg-theme-component p-4 rounded-lg shadow h-96">
            <h3 className="text-lg font-semibold mb-3 text-center">Top 10 Productos Más Vendidos</h3>
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-4 bg-theme-component rounded-lg">
                <p className="text-lg mb-2">Visualización de productos</p>
                <p className="text-sm text-theme-secondary">
                  Los datos actuales no tienen la estructura requerida para este gráfico.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductsAnalysisViewer;
