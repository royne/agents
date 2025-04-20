import React from 'react';
import { OrderAnalysisResult } from '../../services/data-analysis/ExcelAnalysisService';
import { scrollbarStyles } from '../../utils/scrollStyles';
import CarrierDistributionChart from '../charts/CarrierDistributionChart';
import StatusDistributionChart from '../charts/StatusDistributionChart';
import RegionDistributionChart from '../charts/RegionDistributionChart';
import FinancialMetricsChart from '../charts/FinancialMetricsChart';

interface OrdersAnalysisViewerProps {
  data: any[];
  summary: OrderAnalysisResult;
}

const OrdersAnalysisViewer: React.FC<OrdersAnalysisViewerProps> = ({ data, summary }) => {
  return (
    <div>
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-theme-primary p-6 rounded-lg shadow flex flex-col items-center justify-center h-full">
          <h3 className="text-lg font-semibold mb-3">Total de Órdenes</h3>
          <p className="text-4xl font-bold text-primary-color">{summary.totalOrders}</p>
        </div>
        <div className="bg-theme-primary p-6 rounded-lg shadow flex flex-col items-center justify-center h-full">
          <h3 className="text-lg font-semibold mb-3">Valor Total</h3>
          <p className="text-4xl font-bold text-primary-color">
            {summary.totalValue > 0 
              ? summary.totalValue.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
              : '$0'}
          </p>
        </div>
        <div className="bg-theme-primary p-6 rounded-lg shadow h-full">
          <h3 className="text-lg font-semibold mb-3 text-center">Agrupado por {summary.groupField}</h3>
          <div className={`max-h-48 ${scrollbarStyles.scrollContainer}`}>
            {Object.entries(summary.groupedData).length > 0 ? (
              Object.entries(summary.groupedData).map(([key, value]: [string, any]) => (
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
      </div>

      {/* Resumen Financiero */}
      <div className="bg-theme-primary p-6 rounded-lg shadow mt-6">
        <h3 className="text-xl font-semibold mb-4 text-center">Resumen Financiero</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-theme-component p-4 rounded-lg flex flex-col items-center">
            <h4 className="text-md font-semibold mb-2">Ganancia Total</h4>
            <p className="text-2xl font-bold text-green-500">
              {summary.totalProfit > 0
                ? (summary.totalProfit - summary.totalReturnCost).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
                : '$0'}
            </p>
          </div>

          <div className="bg-theme-component p-4 rounded-lg flex flex-col items-center">
            <h4 className="text-md font-semibold mb-2">Ganancia sin inefectividad</h4>
            <p className="text-2xl font-bold text-blue-500">
              {summary.totalProfit > 0
                ? summary.totalProfit.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
                : '$0'}
            </p>
          </div>
          
          <div className="bg-theme-component p-4 rounded-lg flex flex-col items-center">
            <h4 className="text-md font-semibold mb-2">Costo de Envíos</h4>
            <p className="text-2xl font-bold text-yellow-500">
              {summary.totalShippingCost > 0
                ? summary.totalShippingCost.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
                : '$0'}
            </p>
          </div>
          
          <div className="bg-theme-component p-4 rounded-lg flex flex-col items-center">
            <h4 className="text-md font-semibold mb-2">Costo Devoluciones</h4>
            <p className="text-2xl font-bold text-red-500">
              {summary.totalReturnCost > 0
                ? summary.totalReturnCost.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
                : '$0'}
            </p>
          </div>
        </div>
      </div>

      {/* Visualizaciones gráficas */}
      <div className="bg-theme-primary p-6 rounded-lg shadow mt-6">
        <h3 className="text-xl font-semibold mb-4 text-center">
          Análisis Gráfico de Órdenes
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de métricas financieras */}
          <FinancialMetricsChart 
            totalProfit={summary.totalProfit - summary.totalReturnCost}
            totalShippingCost={summary.totalShippingCost}
            totalReturnCost={summary.totalReturnCost}
            profitWithoutReturns={summary.totalProfit}
          />
          
          {/* Gráfico de distribución por estado */}
          <StatusDistributionChart 
            statusDistribution={summary.statusDistribution || {}}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfico de distribución por transportadora */}
          <CarrierDistributionChart 
            carrierDistribution={summary.carrierDistribution || {}}
            carrierShippingCosts={summary.carrierShippingCosts}
            carrierReturnCosts={summary.carrierReturnCosts}
          />
          
          {/* Gráfico de distribución por región */}
          <RegionDistributionChart 
            regionDistribution={summary.regionDistribution || {}}
          />
        </div>
      </div>
      
      {/* Tablas de distribución (versión texto) */}
      <div className="bg-theme-primary p-6 rounded-lg shadow mt-6">
        <h3 className="text-xl font-semibold mb-4 text-center">
          Detalle de Distribuciones
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-theme-component p-4 rounded-lg">
            <h4 className="text-md font-semibold mb-3 text-center">Por Estado</h4>
            <div className={`max-h-60 ${scrollbarStyles.scrollContainer}`}>
              {Object.entries(summary.statusDistribution || {}).map(([key, value]: [string, any]) => (
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
              {Object.entries(summary.carrierDistribution || {}).map(([key, value]: [string, any]) => {
                const shippingCost = summary.carrierShippingCosts?.[key] || 0;
                const returnCost = summary.carrierReturnCosts?.[key] || 0;
                return (
                  <div key={key} className="mb-3 py-1 border-b border-gray-700">
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">{key}:</span>
                      <span className="font-semibold text-primary-color">{value}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-theme-secondary">Flete:</span>
                      <span className="text-xs font-semibold text-yellow-500">
                        {shippingCost > 0 
                          ? shippingCost.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
                          : '$0'}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-theme-secondary">Devoluciones:</span>
                      <span className="text-xs font-semibold text-red-500">
                        {returnCost > 0 
                          ? returnCost.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
                          : '$0'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default OrdersAnalysisViewer;
