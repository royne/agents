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
  currencySymbol: string;
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
  configs,
  currencySymbol
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
    <div className="mt-8 soft-card overflow-hidden">
      <div
        className="flex justify-between items-center p-6 cursor-pointer hover:bg-white/5 transition-colors group"
        onClick={() => setShowProjection(!showProjection)}
      >
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </span>
          <h3 className="text-xl font-semibold text-white">Proyección de Ventas Pro</h3>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-white transition-colors">
          {showProjection ? 'Cerrar Análisis' : 'Expandir Proyección'}
          {showProjection ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      {showProjection && (
        <div className="p-6 pt-0 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Datos de entrada para la proyección */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 my-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Gasto Ads (Ayer)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{currencySymbol}</span>
                <input
                  type="number"
                  value={adsSpent}
                  onChange={(e) => setAdsSpent(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full pl-7 pr-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ventas (Ayer)</label>
              <input
                type="number"
                value={unitsSold}
                onChange={(e) => setUnitsSold(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Base Proyectada</label>
              <input
                type="number"
                value={projectedUnits}
                onChange={(e) => setProjectedUnits(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Horizonte</label>
              <select
                value={projectionPeriod}
                onChange={(e) => setProjectionPeriod(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-blue-500/30 outline-none transition-all appearance-none"
              >
                <option value={1} className="bg-gray-900">1 día de enfoque</option>
                <option value={3} className="bg-gray-900">3 días estratégicos</option>
                <option value={7} className="bg-gray-900">1 semana comercial</option>
                <option value={15} className="bg-gray-900">Quincena operativa</option>
                <option value={30} className="bg-gray-900">Ciclo mensual completo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Indicadores de rendimiento de publicidad */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-2xl relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                  <svg className="w-24 h-24 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /></svg>
                </div>
                <h4 className="text-xs font-bold text-blue-400 mb-3 uppercase tracking-tighter">CPA Operativo</h4>
                <p className="text-2xl font-black text-white leading-none mb-1">{formatCurrency(adMetrics.cpaActual)}</p>
                <p className="text-[10px] text-gray-500 font-medium">Costo real capturado</p>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                  <svg className="w-24 h-24 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                </div>
                <h4 className="text-xs font-bold text-emerald-400 mb-3 uppercase tracking-tighter">CPA Breakeven</h4>
                <p className="text-2xl font-black text-white leading-none mb-1">{formatCurrency(adMetrics.cpaBreakeven)}</p>
                <p className="text-[10px] text-gray-500 font-medium">Punto crítico de retorno</p>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl flex flex-col justify-center">
                <h4 className="text-xs font-bold text-amber-500 mb-2 uppercase tracking-tighter">ROAS Actual</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">{adMetrics.roasActual.toFixed(2)}</span>
                  <span className="text-xs font-bold text-gray-500">X</span>
                </div>
              </div>
              <div className="bg-purple-500/5 border border-purple-500/20 p-5 rounded-2xl flex flex-col justify-center">
                <h4 className="text-xs font-bold text-purple-400 mb-2 uppercase tracking-tighter">ROAS Mínimo</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">{adMetrics.roasBreakeven.toFixed(2)}</span>
                  <span className="text-xs font-bold text-gray-500">X</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-white/2 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <label className="text-sm font-semibold text-gray-300">Escalabilidad Diaria</label>
                  <span className="text-lg font-bold text-blue-400">{dailyGrowth}%</span>
                </div>
                <input
                  type="range"
                  value={dailyGrowth}
                  onChange={(e) => setDailyGrowth(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  min="0"
                  max="100"
                />
                <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-600 uppercase">
                  <span>Conservador</span>
                  <span>Agresivo</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Margen Unitario</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(adMetrics.unitProfit)}</p>
                </div>
                <div className="p-4 bg-teal-500/10 rounded-xl border border-teal-500/20">
                  <p className="text-[10px] font-bold text-teal-400 uppercase mb-1">Carga CPA</p>
                  <p className="text-xl font-bold text-white">{adMetrics.cpaPercentage.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de resumen sofisticada */}
          <div className="relative overflow-hidden group/table border border-white/10 rounded-2xl shadow-2xl shadow-black/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5">
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10">Día</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 text-center">Unidades</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 text-right">Facturación</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 text-right">Inversión Ads</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 text-right">Utilidad Bruta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {projectionData.labels.map((day, index) => {
                    let dailyUnits = projectedUnits;
                    for (let i = 0; i < index; i++) {
                      dailyUnits = Math.round(dailyUnits * (1 + (dailyGrowth / 100)));
                    }
                    const isLast = index === projectionData.labels.length - 1;
                    return (
                      <tr key={day} className="hover:bg-white/5 transition-colors group/row">
                        <td className="py-4 px-6">
                          <span className="text-sm font-medium text-gray-400 group-hover/row:text-white transition-colors">{day}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/5 text-gray-300 border border-white/10">
                            {dailyUnits}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-semibold text-white">
                          {formatCurrency(projectionData.revenue[index])}
                        </td>
                        <td className="py-4 px-6 text-right text-rose-400/80 font-medium">
                          -{formatCurrency(projectionData.adCosts?.[index] || 0)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-emerald-400 font-black">
                            {formatCurrency(projectionData.profit[index])}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-600/10 border-t-2 border-blue-500/30">
                    <td className="py-5 px-6 font-black text-blue-400 uppercase tracking-tighter text-sm">Escenario Total</td>
                    <td className="py-5 px-6 text-center text-white font-black">
                      {projectionData.labels.reduce((total, _, index) => {
                        let units = projectedUnits;
                        for (let i = 0; i < index; i++) {
                          units = Math.round(units * (1 + (dailyGrowth / 100)));
                        }
                        return total + units;
                      }, 0)}
                    </td>
                    <td className="py-5 px-6 text-right text-white font-black text-lg">
                      {formatCurrency(projectionData.revenue.reduce((sum, value) => sum + value, 0))}
                    </td>
                    <td className="py-5 px-6 text-right text-rose-400 font-bold">
                      -{formatCurrency((projectionData.adCosts || []).reduce((sum, value) => sum + value, 0))}
                    </td>
                    <td className="py-5 px-6 text-right">
                      <div className="inline-block p-1 px-3 bg-emerald-500 text-black font-black rounded-lg text-lg">
                        {formatCurrency(projectionData.profit.reduce((sum, value) => sum + value, 0))}
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Indicadores de proyección finales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl group hover:border-blue-500/30 transition-all duration-300">
              <h4 className="text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Breakeven Global</h4>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-white">{breakEvenUnits}</p>
                <p className="text-sm font-bold text-blue-400/80 uppercase">unidades</p>
              </div>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">Punto muerto operativo para recuperar el 100% de la inversión.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl group hover:border-emerald-500/30 transition-all duration-300">
              <h4 className="text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Yield Estimado</h4>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-emerald-400">{roi.toFixed(1)}%</p>
                <p className="text-sm font-bold text-gray-500 uppercase">ROI</p>
              </div>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">Retorno de capital proyectado basado en el flujo de ventas actual.</p>
            </div>
            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 p-6 rounded-2xl shadow-xl shadow-blue-500/5">
              <h4 className="text-[10px] font-black text-blue-400 mb-2 uppercase tracking-widest">Inyección Neta</h4>
              <p className="text-3xl font-black text-white leading-none mb-2">
                {formatCurrency(projectionData.cumulativeProfit[projectionData.cumulativeProfit.length - 1] || 0)}
              </p>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-xs font-bold text-gray-400">Total en {projectionPeriod} días estratégicos</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectionSection;
