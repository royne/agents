import React from 'react';
import { ProductAnalysisResult } from '../../services/data-analysis/ExcelAnalysisService';
import { scrollbarStyles } from '../../utils/scrollStyles';
import ProductMetricsChart from '../charts/ProductMetricsChart';
import ProductProfitChart from '../charts/ProductProfitChart';
import ProductTrendChart from '../charts/ProductTrendChart';
import ProductDailySalesChart from '../charts/ProductDailySalesChart';
import ProductDepartmentChart from '../charts/ProductCategoryChart'; // Importamos con el nuevo nombre pero del mismo archivo

interface ProductsAnalysisViewerProps {
  data: any[];
  summary: ProductAnalysisResult;
}

const ProductsAnalysisViewer: React.FC<ProductsAnalysisViewerProps> = ({ data, summary }) => {
  return (
    <div>
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
        
        {/* Fila con gráficos de métricas y categorías */}
        <div className="flex flex-col md:flex-row w-full mb-6 gap-4">
          {/* Gráfico de métricas de productos */}
          <div className="w-full md:w-1/2">
            <ProductMetricsChart 
              uniqueProductsCount={summary.uniqueProductsCount}
              totalQuantity={Object.entries(summary.productsByCategory).reduce((sum, [_, count]) => sum + (count as number), 0)}
              totalValue={summary.totalValue}
              totalCost={summary.totalCost}
              totalProfit={summary.totalProfit}
              averageMargin={summary.averageMargin}
              productProfitData={summary.productProfitData}
            />
          </div>
          
          {/* Gráfico de productos por departamento destino */}
          <div className="w-full md:w-1/2">
            <ProductDepartmentChart 
              productsByDepartment={summary.productsByDepartment}
            />
          </div>
        </div>
        
        {/* Gráfico de top productos a ancho completo */}
        <div className="w-full mb-6">
          <ProductProfitChart 
            products={summary.productProfitData}
          />
        </div>
        
        {/* Gráfico de tendencia de ventas y ganancias */}
        <div className="w-full mb-6">
          <ProductTrendChart 
            trends={summary.trendData}
          />
        </div>
        
        {/* Gráfico de ventas diarias */}
        <div className="w-full mb-6">
          <ProductDailySalesChart 
            dailySales={summary.trendData.map(item => ({ 
              date: item.date, 
              sales: item.sales,
              products: item.products
            }))}
          />
        </div>
      </div>

    </div>
  );
};

export default ProductsAnalysisViewer;
