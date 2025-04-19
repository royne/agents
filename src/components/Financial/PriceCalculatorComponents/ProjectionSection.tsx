import React, { useState, useEffect } from 'react';

import { PriceConfig } from '../../../hooks/usePriceCalculator';

interface ProjectionSectionProps {
  productName: string;
  productCost: number;
  sellingPrice: number;
  landingPrice: number;
  totalCost: number;
  profit: number;
  formatCurrency: (value: number) => string;
  // Valores adicionales de la calculadora
  totalFreight: number;
  realCPA: number;
  configs: PriceConfig[];
}

interface ProjectionDataType {
  labels: string[];
  revenue: number[];
  costs: number[];
  profit: number[];
  cumulativeProfit: number[];
  adCosts?: number[];
  freightCosts?: number[];
}

interface ChartDataPoint {
  name: string;
  valor: number;
}

const ProjectionSection: React.FC<ProjectionSectionProps> = ({
  productName,
  productCost,
  sellingPrice,
  landingPrice,
  totalCost,
  profit,
  formatCurrency,
  totalFreight,
  realCPA,
  configs
}) => {
  const [showProjection, setShowProjection] = useState<boolean>(false);
  // Datos de entrada para la proyección
  const [adsSpent, setAdsSpent] = useState<number>(1000); // Gasto en anuncios
  const [unitsSold, setUnitsSold] = useState<number>(10); // Unidades vendidas día anterior
  const [projectedUnits, setProjectedUnits] = useState<number>(100); // Unidades proyectadas
  const [projectionPeriod, setProjectionPeriod] = useState<number>(7); // Período de proyección en días
  const [dailyGrowth, setDailyGrowth] = useState<number>(5); // Crecimiento diario
  
  // Datos para la proyección
  const [projectionData, setProjectionData] = useState<ProjectionDataType>({
    labels: [],
    revenue: [],
    costs: [],
    profit: [],
    cumulativeProfit: []
  });

  // Calcular métricas de rendimiento de publicidad
  const [adMetrics, setAdMetrics] = useState({
    cpaActual: 0,         // CPA real día anterior
    cpaBreakeven: 0,      // CPA breakeven
    roasActual: 0,        // ROAS actual
    roasBreakeven: 0,     // ROAS breakeven
    unitProfit: 0,        // Utilidad unitaria
    cpaPercentage: 0,     // Porcentaje de CPA
    marginPercentage: 0   // Porcentaje de margen
  });

  // Calcular métricas cuando cambien los valores de entrada
  useEffect(() => {
    if (!productCost || productCost <= 0 || !sellingPrice || !totalCost || unitsSold <= 0) {
      return;
    }

    // CPA real día anterior (gasto en ads / unidades vendidas)
    const actualCPA = adsSpent / unitsSold;
    
    // Obtener otros costos de la configuración
    const adminCostConfig = configs.find(c => c.name === 'Costo Administrativo');
    const otherCostsConfig = configs.find(c => c.name === 'Otros Gastos');
    const adminCost = adminCostConfig ? adminCostConfig.value : 0;
    const otherCosts = otherCostsConfig ? otherCostsConfig.value : 0;
    
    // Utilidad unitaria según la especificación:
    // precio de venta en landing - precio proveedor - flete total (ya con inefectividad) - costos admin - otros gastos - CPA actual
    const unitProfit = landingPrice - productCost - totalFreight - adminCost - otherCosts - actualCPA;
    
    // CPA breakeven (CPA calculado + utilidad unitaria)
    const cpaBreakeven = actualCPA + unitProfit;
    
    // ROAS actual (ingresos / gasto en ads)
    const actualROAS = (unitsSold * sellingPrice) / adsSpent;
    
    // ROAS breakeven (1 + (costo total / CPA breakeven))
    const roasBreakeven = 1 + (totalCost / cpaBreakeven);
    
    // Porcentaje de CPA (CPA actual / precio de venta)
    const cpaPercentage = (actualCPA / sellingPrice) * 100;
    
    // Porcentaje de margen (utilidad unitaria / precio de venta)
    const marginPercentage = (unitProfit / sellingPrice) * 100;
    
    setAdMetrics({
      cpaActual: actualCPA,
      cpaBreakeven,
      roasActual: actualROAS,
      roasBreakeven,
      unitProfit,
      cpaPercentage,
      marginPercentage
    });
  }, [adsSpent, unitsSold, sellingPrice, totalCost, productCost]);

  // Calcular la proyección cuando cambien los parámetros
  useEffect(() => {
    if (!productCost || productCost <= 0 || !sellingPrice || !totalCost || projectedUnits <= 0) {
      return;
    }

    const labels: string[] = [];
    const revenue: number[] = [];
    const productCosts: number[] = [];
    const adCosts: number[] = [];
    const freightCosts: number[] = [];
    const profitArray: number[] = [];
    const cumulativeProfit: number[] = [];
    
    let currentUnits: number = projectedUnits;
    let totalProfit: number = 0;
    
    // Obtener el valor de inefectividad de la configuración
    const ineffectivityConfig = configs.find(c => c.name === 'Inefectividad');
    const ineffectivityPercentage = ineffectivityConfig ? ineffectivityConfig.value : 0;
    const ineffectivityFactor = ineffectivityPercentage / 100;
    
    // CPA por unidad (usando el CPA actual calculado)
    const cpaPerUnit = adMetrics.cpaActual;
    
    for (let i = 1; i <= projectionPeriod; i++) {
      // Calcular unidades con crecimiento diario
      if (i > 1) {
        const growthFactor: number = 1 + (Number(dailyGrowth) / 100);
        currentUnits = Math.round(currentUnits * growthFactor);
      }
      
      // Calcular ingresos, costos y ganancias para el día
      // Venta proyectada = (cantidad proyectada * precio de venta en landing) * (1 - inefectividad)
      const dailyRevenue: number = (currentUnits * landingPrice) * (1 - ineffectivityFactor);
      // Costo del producto = (cantidad proyectada * costo del producto) * (1 - inefectividad)
      const dailyProductCost: number = (currentUnits * productCost) * (1 - ineffectivityFactor);
      
      // Obtener el flete sin devoluciones de la configuración
      const freightConfig = configs.find(c => c.name === 'Flete');
      const baseFreight = freightConfig ? freightConfig.value : 0;
      
      // Flete proyectado = (cantidad proyectada * flete sin devoluciones) * 91%
      const dailyFreightCost: number = (currentUnits * baseFreight) * 0.91;
      
      const dailyAdCost: number = currentUnits * cpaPerUnit;
      
      // Utilidad = venta proyectada - gasto de ads - costo producto - flete proyectado
      const dailyProfit: number = dailyRevenue - dailyAdCost - dailyProductCost - dailyFreightCost;
      
      // Acumular ganancia total
      totalProfit += dailyProfit;
      
      // Añadir datos al array
      labels.push(`Día ${i}`);
      revenue.push(dailyRevenue);
      productCosts.push(dailyProductCost);
      freightCosts.push(dailyFreightCost);
      adCosts.push(dailyAdCost);
      profitArray.push(dailyProfit);
      cumulativeProfit.push(totalProfit);
    }
    
    setProjectionData({
      labels,
      revenue,
      costs: productCosts,
      profit: profitArray,
      cumulativeProfit,
      adCosts,
      freightCosts
    } as any);
  }, [projectedUnits, projectionPeriod, dailyGrowth, adsSpent, unitsSold, productCost, sellingPrice, totalCost, profit, adMetrics, totalFreight, realCPA]);



  // Calcular el punto de equilibrio (unidades necesarias para cubrir costos)
  const breakEvenUnits: number = adMetrics.unitProfit > 0 ? Math.ceil(totalCost / adMetrics.unitProfit) : 0;
  
  // Calcular el ROI (Return on Investment) para la inversión inicial
  const initialInvestment: number = (productCost * projectedUnits) + (adMetrics.cpaActual * projectedUnits); // Costo de la primera compra + pauta
  const lastCumulativeProfit: number = projectionData.cumulativeProfit[projectionData.cumulativeProfit.length - 1] || 0;
  const roi: number = initialInvestment > 0 ? ((lastCumulativeProfit / initialInvestment) * 100) : 0;

  return (
    <div className="mt-6 bg-gray-900 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowProjection(!showProjection)}>
        <h3 className="text-lg font-semibold text-white">Proyección de Ventas</h3>
        <button className="text-blue-400 hover:text-blue-300">
          {showProjection ? '▲ Ocultar' : '▼ Mostrar'}
        </button>
      </div>
      
      {showProjection && (
        <div className="mt-4">
          {/* Datos de entrada para la proyección */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Gasto en Ads (día anterior)
              </label>
              <input
                type="number"
                value={adsSpent}
                onChange={(e) => setAdsSpent(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Unidades vendidas (día anterior)
              </label>
              <input
                type="number"
                value={unitsSold}
                onChange={(e) => setUnitsSold(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Unidades proyectadas
              </label>
              <input
                type="number"
                value={projectedUnits}
                onChange={(e) => setProjectedUnits(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Periodo de proyección (días)
              </label>
              <select
                value={projectionPeriod}
                onChange={(e) => setProjectionPeriod(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 día</option>
                <option value={3}>3 días</option>
                <option value={7}>7 días</option>
                <option value={15}>15 días</option>
                <option value={30}>30 días</option>
              </select>
            </div>
          </div>
          
          {/* Indicadores de rendimiento de publicidad */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 border border-blue-900 p-3 rounded-lg shadow-sm">
              <h4 className="text-xs font-semibold text-blue-300 mb-1">CPA Real</h4>
              <p className="text-base font-bold text-white">{formatCurrency(adMetrics.cpaActual)}</p>
              <p className="text-xs text-gray-300">Costo por adquisición</p>
            </div>
            <div className="bg-gray-900 border border-green-900 p-3 rounded-lg shadow-sm">
              <h4 className="text-xs font-semibold text-green-300 mb-1">CPA Breakeven</h4>
              <p className="text-base font-bold text-white">{formatCurrency(adMetrics.cpaBreakeven)}</p>
              <p className="text-xs text-gray-300">Máximo CPA rentable</p>
            </div>
            <div className="bg-gray-900 border border-yellow-900 p-3 rounded-lg shadow-sm">
              <h4 className="text-xs font-semibold text-yellow-300 mb-1">ROAS</h4>
              <p className="text-base font-bold text-white">{adMetrics.roasActual.toFixed(2)}x</p>
              <p className="text-xs text-gray-300">Retorno de gasto en ads</p>
            </div>
            <div className="bg-gray-900 border border-purple-900 p-3 rounded-lg shadow-sm">
              <h4 className="text-xs font-semibold text-purple-300 mb-1">ROAS Breakeven</h4>
              <p className="text-base font-bold text-white">{adMetrics.roasBreakeven.toFixed(2)}x</p>
              <p className="text-xs text-gray-300">ROAS mínimo rentable</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-900 border border-indigo-900 p-3 rounded-lg shadow-sm">
              <h4 className="text-xs font-semibold text-indigo-300 mb-1">Utilidad Unitaria</h4>
              <p className="text-base font-bold text-white">{formatCurrency(adMetrics.unitProfit)}</p>
              <p className="text-xs text-gray-300">Ganancia por unidad</p>
            </div>
            <div className="bg-gray-900 border border-red-900 p-3 rounded-lg shadow-sm">
              <h4 className="text-xs font-semibold text-red-300 mb-1">% CPA</h4>
              <p className="text-base font-bold text-white">{adMetrics.cpaPercentage.toFixed(2)}%</p>
              <p className="text-xs text-gray-300">Del precio de venta</p>
            </div>
            <div className="bg-gray-900 border border-teal-900 p-3 rounded-lg shadow-sm">
              <h4 className="text-xs font-semibold text-teal-300 mb-1">% Margen</h4>
              <p className="text-base font-bold text-white">{adMetrics.marginPercentage.toFixed(2)}%</p>
              <p className="text-xs text-gray-300">Del precio de venta</p>
            </div>
          </div>
          
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Crecimiento diario (%)
            </label>
            <input
              type="number"
              value={dailyGrowth}
              onChange={(e) => setDailyGrowth(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
            />
          </div>
          

          
          {/* Tabla de resumen */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 border border-gray-700">
              <thead>
                <tr className="bg-gray-700">
                  <th className="py-2 px-4 border-b border-gray-600 text-left text-white">Día</th>
                  <th className="py-2 px-4 border-b border-gray-600 text-right text-white">Unidades</th>
                  <th className="py-2 px-4 border-b border-gray-600 text-right text-white">Venta</th>
                  <th className="py-2 px-4 border-b border-gray-600 text-right text-white">Costo Producto</th>
                  <th className="py-2 px-4 border-b border-gray-600 text-right text-white">Flete</th>
                  <th className="py-2 px-4 border-b border-gray-600 text-right text-white">Gasto Ads</th>
                  <th className="py-2 px-4 border-b border-gray-600 text-right text-white">Utilidad</th>
                </tr>
              </thead>
              <tbody>
                {projectionData.labels.map((day, index) => {
                  // Calcular unidades para este día
                  let dailyUnits = projectedUnits;
                  for (let i = 0; i < index; i++) {
                    dailyUnits = Math.round(dailyUnits * (1 + (dailyGrowth / 100)));
                  }
                  return (
                    <tr key={day} className="hover:bg-gray-700">
                      <td className="py-2 px-4 border-b border-gray-700 text-white">{day}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-right text-white">{dailyUnits}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-right text-white">{formatCurrency(projectionData.revenue[index])}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-right text-white">{formatCurrency(projectionData.costs[index])}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-right text-white">{formatCurrency(projectionData.freightCosts?.[index] || 0)}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-right text-white">{formatCurrency(projectionData.adCosts?.[index] || 0)}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-right text-white">{formatCurrency(projectionData.profit[index])}</td>
                    </tr>
                  );
                })}
                {/* Fila de totales */}
                <tr className="bg-gray-700 font-bold">
                  <td className="py-2 px-4 border-b border-gray-600 text-white">TOTALES</td>
                  <td className="py-2 px-4 border-b border-gray-600 text-right text-white">
                    {projectionData.labels.reduce((total, _, index) => {
                      let units = projectedUnits;
                      for (let i = 0; i < index; i++) {
                        units = Math.round(units * (1 + (dailyGrowth / 100)));
                      }
                      return total + units;
                    }, 0)}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-600 text-right text-white">
                    {formatCurrency(projectionData.revenue.reduce((sum, value) => sum + value, 0))}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-600 text-right text-white">
                    {formatCurrency(projectionData.costs.reduce((sum, value) => sum + value, 0))}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-600 text-right text-white">
                    {formatCurrency((projectionData.freightCosts || []).reduce((sum, value) => sum + value, 0))}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-600 text-right text-white">
                    {formatCurrency((projectionData.adCosts || []).reduce((sum, value) => sum + value, 0))}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-600 text-right text-white">
                    {formatCurrency(projectionData.profit.reduce((sum, value) => sum + value, 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Indicadores de proyección */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-900 border border-blue-900 p-4 rounded-lg shadow-sm">
              <h4 className="text-sm font-semibold text-blue-300 mb-1">Punto de Equilibrio</h4>
              <p className="text-lg font-bold text-white">{breakEvenUnits} unidades</p>
              <p className="text-xs text-gray-300">Unidades necesarias para cubrir costos</p>
            </div>
            <div className="bg-gray-900 border border-green-900 p-4 rounded-lg shadow-sm">
              <h4 className="text-sm font-semibold text-green-300 mb-1">ROI Proyectado</h4>
              <p className="text-lg font-bold text-white">{roi.toFixed(2)}%</p>
              <p className="text-xs text-gray-300">Retorno sobre inversión inicial</p>
            </div>
            <div className="bg-gray-900 border border-purple-900 p-4 rounded-lg shadow-sm">
              <h4 className="text-sm font-semibold text-purple-300 mb-1">Ganancia Total</h4>
              <p className="text-lg font-bold text-white">
                {formatCurrency(projectionData.cumulativeProfit[projectionData.cumulativeProfit.length - 1] || 0)}
              </p>
              <p className="text-xs text-gray-300">En {projectionPeriod} días</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectionSection;
