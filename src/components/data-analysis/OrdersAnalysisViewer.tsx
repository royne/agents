import React from 'react';
import { OrderAnalysisResult } from '../../services/data-analysis/OrdersAnalysisService';
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
    <div className="w-full">
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 w-full">
        <div className="bg-theme-primary p-6 rounded-lg shadow flex flex-col items-center justify-center h-full">
          <h3 className="text-lg font-semibold mb-3">Total de Órdenes</h3>
          <p className="text-4xl font-bold text-primary-color">{summary.totalOrders}</p>
          <div className="mt-2 flex flex-col items-center text-sm">
            <div className="flex justify-between w-full">
              <span className="text-green-500">Entregadas:</span>
              <span className="font-medium">{summary.confirmedOrders}</span>
            </div>
            <div className="flex justify-between w-full">
              <span className="text-blue-500">En Proceso:</span>
              <span className="font-medium">{summary.inProgressOrders}</span>
            </div>
            <div className="flex justify-between w-full">
              <span className="text-red-500">Devueltas:</span>
              <span className="font-medium">{summary.returnedOrders}</span>
            </div>
            <div className="flex justify-between w-full">
              <span className="text-gray-400">Canceladas:</span>
              <span className="font-medium">{summary.canceledOrders}</span>
            </div>
          </div>
        </div>
        <div className="bg-theme-primary p-6 rounded-lg shadow flex flex-col items-center justify-center h-full">
          <h3 className="text-lg font-semibold mb-3">Valor Total</h3>
          <p className="text-4xl font-bold text-primary-color">
            {summary.totalValue > 0 
              ? summary.totalValue.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
              : '$0'}
          </p>
          <div className="mt-2 flex flex-col items-center text-sm">
            <div className="flex justify-between w-full">
              <span className="text-green-500">Confirmado:</span>
              <span className="font-medium">
                {summary.confirmedValue > 0 
                  ? summary.confirmedValue.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
                  : '$0'}
              </span>
            </div>
            <div className="flex justify-between w-full">
              <span className="text-blue-500">En Proceso:</span>
              <span className="font-medium">
                {summary.inProgressValue > 0 
                  ? summary.inProgressValue.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
                  : '$0'}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-theme-primary p-6 rounded-lg shadow h-full">
          <h3 className="text-lg font-semibold mb-3 text-center">Eficiencia de Entrega</h3>
          <p className="text-4xl font-bold text-center text-primary-color">
            {summary.deliveryEfficiency.toFixed(1)}%
          </p>
          <div className="mt-2 h-4 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" 
              style={{ width: `${summary.deliveryEfficiency}%` }}
            ></div>
          </div>
          <div className="mt-4 text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-theme-secondary">Total con guía:</span>
              <span className="font-medium">{summary.confirmedOrders + summary.inProgressOrders + summary.returnedOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-500">Entregas exitosas:</span>
              <span className="font-medium">{summary.confirmedOrders}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen Financiero */}
      <div className="bg-theme-primary p-6 rounded-lg shadow mt-6 w-full">
        <h3 className="text-xl font-semibold mb-4 text-center">Resumen Financiero</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full">
          <div className="bg-theme-component p-4 rounded-lg flex flex-col items-center">
            <h4 className="text-md font-semibold mb-2">Ganancia Neta</h4>
            <p className="text-2xl font-bold text-green-500">
              {summary.netProfit > 0
                ? summary.netProfit.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
                : '$0'}
            </p>
            <div className="text-xs text-center mt-1 text-theme-secondary">
              (Ganancia confirmada - Costos de devolución)
            </div>
          </div>

          <div className="bg-theme-component p-4 rounded-lg flex flex-col items-center">
            <h4 className="text-md font-semibold mb-2">Ganancia Confirmada</h4>
            <p className="text-2xl font-bold text-blue-500">
              {summary.confirmedProfit > 0
                ? summary.confirmedProfit.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
                : '$0'}
            </p>
            <div className="text-xs text-center mt-1 text-theme-secondary">
              (Solo órdenes entregadas)
            </div>
          </div>
          
          <div className="bg-theme-component p-4 rounded-lg flex flex-col items-center">
            <h4 className="text-md font-semibold mb-2">Costos de Flete</h4>
            <p className="text-2xl font-bold text-yellow-500">
              {summary.totalShippingCost > 0
                ? summary.totalShippingCost.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
                : '$0'}
            </p>
            <div className="text-xs text-center mt-1 text-theme-secondary">
              (Todas las órdenes con guía)
            </div>
          </div>
          
          <div className="bg-theme-component p-4 rounded-lg flex flex-col items-center">
            <h4 className="text-md font-semibold mb-2">Costo Devoluciones</h4>
            <p className="text-2xl font-bold text-red-500">
              {summary.totalReturnCost > 0
                ? summary.totalReturnCost.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
                : '$0'}
            </p>
            <div className="text-xs text-center mt-1 text-theme-secondary">
              {summary.returnedOrders} órdenes devueltas
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <div className="bg-theme-component p-4 rounded-lg">
            <h4 className="text-md font-semibold mb-3 text-center">Ingresos Confirmados vs En Proceso</h4>
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center w-1/2">
                <span className="text-green-500 font-medium">Confirmados</span>
                <span className="text-xl font-semibold">
                  {summary.confirmedValue > 0
                    ? summary.confirmedValue.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
                    : '$0'}
                </span>
                <span className="text-sm mt-1">{summary.confirmedOrders} órdenes</span>
              </div>
              <div className="h-12 border-r border-gray-600"></div>
              <div className="flex flex-col items-center w-1/2">
                <span className="text-blue-500 font-medium">En Proceso</span>
                <span className="text-xl font-semibold">
                  {summary.inProgressValue > 0
                    ? summary.inProgressValue.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
                    : '$0'}
                </span>
                <span className="text-sm mt-1">{summary.inProgressOrders} órdenes</span>
              </div>
            </div>
          </div>
          
          <div className="bg-theme-component p-4 rounded-lg">
            <h4 className="text-md font-semibold mb-3 text-center">Pérdidas por Devoluciones</h4>
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center w-1/2">
                <span className="text-red-500 font-medium">Valor Perdido</span>
                <span className="text-xl font-semibold">
                  {summary.returnedValue > 0
                    ? summary.returnedValue.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
                    : '$0'}
                </span>
                <span className="text-sm mt-1">{summary.returnedOrders} órdenes</span>
              </div>
              <div className="h-12 border-r border-gray-600"></div>
              <div className="flex flex-col items-center w-1/2">
                <span className="text-red-500 font-medium">Costo Extra</span>
                <span className="text-xl font-semibold">
                  {summary.totalReturnCost > 0
                    ? summary.totalReturnCost.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
                    : '$0'}
                </span>
                <span className="text-sm mt-1">Fletes de devolución</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nueva sección para Escenarios Optimista y Pesimista */}
        <div className="bg-theme-component p-4 rounded-lg mt-4">
          <h4 className="text-md font-semibold mb-3 text-center">Escenarios de Órdenes en Proceso</h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-theme-primary p-4 rounded-lg">
              <h5 className="text-sm font-semibold text-center text-green-500 mb-2">Escenario Optimista</h5>
              <div className="text-center">
                <p className="text-lg font-bold text-green-500">
                  {summary.optimisticProfit > 0
                    ? summary.optimisticProfit.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
                    : '$0'}
                </p>
                <p className="text-xs text-theme-secondary mt-1">Ganancia total si todas las órdenes en proceso se entregan</p>
                <div className="mt-2 flex items-center justify-center">
                  <span className="text-xs bg-green-500 bg-opacity-30 text-green-300 py-1 px-2 rounded">
                    +{summary.optimisticGainFromInProgress > 0
                      ? summary.optimisticGainFromInProgress.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
                      : '$0'} ganancia adicional por órdenes en proceso
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-theme-primary p-4 rounded-lg">
              <h5 className="text-sm font-semibold text-center text-red-500 mb-2">Escenario Pesimista</h5>
              <div className="text-center">
                <p className="text-lg font-bold text-red-500">
                  {summary.pessimisticProfit > 0
                    ? summary.pessimisticProfit.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
                    : summary.pessimisticProfit < 0 
                      ? `- ${Math.abs(summary.pessimisticProfit).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`
                      : '$0'}
                </p>
                <p className="text-xs text-theme-secondary mt-1">Ganancia neta si todas las órdenes en proceso se devuelven</p>
                <div className="mt-2 flex items-center justify-center">
                  <span className="text-xs bg-red-500 bg-opacity-30 text-red-300 py-1 px-2 rounded">
                    {summary.pessimisticLoss > 0
                      ? `- ${summary.pessimisticLoss.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`
                      : '$0'} por costos adicionales de devolución
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visualizaciones gráficas */}
      <div className="bg-theme-primary p-6 rounded-lg shadow mt-6 w-full">
        <h3 className="text-xl font-semibold mb-4 text-center">
          Análisis Gráfico de Órdenes
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de métricas financieras */}
          <FinancialMetricsChart 
            totalProfit={summary.netProfit}
            totalShippingCost={summary.totalShippingCost}
            totalReturnCost={summary.totalReturnCost}
            profitWithoutReturns={summary.confirmedProfit}
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
      <div className="bg-theme-primary p-6 rounded-lg shadow mt-6 w-full">
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
                    {summary.carrierEfficiency && summary.carrierEfficiency[key] !== undefined && (
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-theme-secondary">Eficiencia:</span>
                        <span className={`text-xs font-semibold ${summary.carrierEfficiency[key] > 80 ? 'text-green-500' : summary.carrierEfficiency[key] > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {summary.carrierEfficiency[key].toFixed(1)}%
                        </span>
                      </div>
                    )}
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
