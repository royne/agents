import React, { useState, useMemo } from 'react';
import { FaRegChartBar, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { MdStackedLineChart, MdShowChart, MdBarChart } from 'react-icons/md';
import { formatCurrency, formatNumber, formatDate } from '../../../utils/formatters';
import { CampaignDailyRecord } from '../../../types/campaign-control';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  Bar, 
  ComposedChart, 
  Area, 
  AreaChart,
  ReferenceLine
} from 'recharts';

interface MetricsChartProps {
  period?: string;
  onPeriodChange?: (period: string) => void;
  dailyRecords?: CampaignDailyRecord[];
}

const MetricsChart: React.FC<MetricsChartProps> = ({ 
  period = '3', 
  onPeriodChange = () => {},
  dailyRecords = []
}) => {
  // Estado para la métrica seleccionada
  const [selectedMetric, setSelectedMetric] = useState<string>('cpa');
  // Estado para el tipo de visualización (simple, combinada o tendencia)
  const [viewType, setViewType] = useState<'simple' | 'combined' | 'trend'>('trend');
  
  // Filtrar registros según el período seleccionado
  const filteredRecords = useMemo(() => {
    if (!dailyRecords || dailyRecords.length === 0) return [];
    
    const days = parseInt(period);
    
    // Calcular la fecha de corte (días atrás desde hoy)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days + 1); // +1 para incluir el día actual
    cutoffDate.setHours(0, 0, 0, 0); // Inicio del día
    
    // Filtrar y ordenar los registros
    const filtered = dailyRecords
      .filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= cutoffDate;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return filtered;
  }, [dailyRecords, period]);
  
  // Preparar datos para el gráfico
  const chartData = useMemo(() => {
    return filteredRecords.map(record => {
      const units = record.units_sold || record.units || 0;
      const sales = record.sales || record.revenue || 0;
      const spend = record.spend || 0;
      
      // Calcular CPA y ROI
      const cpa = units > 0 ? spend / units : 0;
      const roi = spend > 0 ? (sales - spend) / spend : 0;
      
      // Formatear fecha correctamente - asegurar que muestre el día actual
      const recordDate = new Date(record.date);
      // Usar día/mes con formato correcto para mostrar el día actual
      const day = recordDate.getDate();
      const month = recordDate.getMonth() + 1;
      const formattedDate = `${day}/${month}`;
      
      return {
        date: formattedDate,
        fullDate: recordDate,
        cpa,
        roi,
        units,
        spend,
        sales
      };
    }).sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
  }, [filteredRecords]);
  
  // Calcular el valor máximo de CPA para escalar correctamente
  const maxCpa = useMemo(() => {
    if (chartData.length === 0) return 100;
    const max = Math.max(...chartData.map(item => item.cpa || 0));
    return Math.max(Math.ceil(max * 1.2), 1); // Añadir 20% de margen y asegurar valor mínimo
  }, [chartData]);
  
  // Calcular el valor máximo de gastos para escalar correctamente
  const maxSpend = useMemo(() => {
    if (chartData.length === 0) return 100;
    const max = Math.max(...chartData.map(item => item.spend || 0));
    return Math.max(Math.ceil(max * 1.2), 1); // Añadir 20% de margen y asegurar valor mínimo
  }, [chartData]);
  
  // Calcular estadísticas
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        avgCpa: 0,
        avgRoi: 0,
        totalUnits: 0,
        cpaChange: 0,
        roiChange: 0,
        unitsChange: 0
      };
    }
    
    // Calcular promedios actuales
    const avgCpa = chartData.reduce((sum, item) => sum + (item.cpa || 0), 0) / chartData.length;
    const avgRoi = chartData.reduce((sum, item) => sum + item.roi, 0) / chartData.length;
    const totalUnits = chartData.reduce((sum, item) => sum + item.units, 0);
    
    // Calcular cambios respecto al período anterior
    // (Simplificado - en una implementación real se compararía con datos del período anterior)
    const cpaChange = chartData.length > 1 ? 
      ((chartData[chartData.length-1].cpa / chartData[0].cpa) - 1) * 100 : 0;
    const roiChange = chartData.length > 1 ? 
      ((chartData[chartData.length-1].roi / chartData[0].roi) - 1) * 100 : 0;
    const unitsChange = chartData.length > 1 ? 
      ((chartData[chartData.length-1].units / chartData[0].units) - 1) * 100 : 0;
    
    return {
      avgCpa,
      avgRoi,
      totalUnits,
      cpaChange,
      roiChange,
      unitsChange
    };
  }, [chartData]);
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <FaRegChartBar className="mr-2" />
          Métricas de Rendimiento
        </div>
        <div className="flex items-center gap-2">
          <button 
            className={`p-1 rounded ${viewType === 'simple' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            onClick={() => setViewType('simple')}
            title="Vista simple"
          >
            <MdShowChart size={18} />
          </button>
          <button 
            className={`p-1 rounded ${viewType === 'combined' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            onClick={() => setViewType('combined')}
            title="Vista combinada"
          >
            <MdStackedLineChart size={18} />
          </button>
          <button 
            className={`p-1 rounded ${viewType === 'trend' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            onClick={() => setViewType('trend')}
            title="Análisis de tendencia"
          >
            <MdBarChart size={18} />
          </button>
          <select 
            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
          >
            <option value="3">3 días</option>
            <option value="7">7 días</option>
            <option value="14">14 días</option>
            <option value="30">30 días</option>
          </select>
        </div>
      </h2>
      
      <div className="bg-gray-750 rounded-lg p-4 mb-4">
        {/* Selector de métricas */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button 
            className={`px-3 py-1 rounded text-xs ${selectedMetric === 'cpa' ? 'bg-primary-color font-medium' : 'bg-gray-600 hover:bg-gray-500'}`}
            onClick={() => setSelectedMetric('cpa')}
          >
            CPA
          </button>
          <button 
            className={`px-3 py-1 rounded text-xs ${selectedMetric === 'spend' ? 'bg-primary-color font-medium' : 'bg-gray-600 hover:bg-gray-500'}`}
            onClick={() => setSelectedMetric('spend')}
          >
            Gastos
          </button>
          <button 
            className={`px-3 py-1 rounded text-xs ${selectedMetric === 'units' ? 'bg-primary-color font-medium' : 'bg-gray-600 hover:bg-gray-500'}`}
            onClick={() => setSelectedMetric('units')}
          >
            Conversiones
          </button>
          <button 
            className={`px-3 py-1 rounded text-xs ${selectedMetric === 'sales' ? 'bg-primary-color font-medium' : 'bg-gray-600 hover:bg-gray-500'}`}
            onClick={() => setSelectedMetric('sales')}
          >
            Ingresos
          </button>
          <button 
            className={`px-3 py-1 rounded text-xs ${selectedMetric === 'roi' ? 'bg-primary-color font-medium' : 'bg-gray-600 hover:bg-gray-500'}`}
            onClick={() => setSelectedMetric('roi')}
          >
            ROI
          </button>
        </div>
        
        {/* Gráfico dinámico con Recharts */}
        <div className="h-auto min-h-[200px] w-full bg-gray-700 rounded-lg p-3">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              {viewType === 'simple' ? (
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888" 
                    tick={{ fill: '#888', fontSize: 10 }} 
                  />
                  <YAxis 
                    stroke="#888" 
                    tick={{ fill: '#888', fontSize: 10 }}
                    tickFormatter={(value) => selectedMetric === 'cpa' || selectedMetric === 'spend' || selectedMetric === 'sales' 
                      ? `$${value}` 
                      : value.toString()
                    }
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#333', border: 'none' }} 
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number) => {
                      if (selectedMetric === 'cpa' || selectedMetric === 'spend' || selectedMetric === 'sales') {
                        return formatCurrency(value);
                      } else if (selectedMetric === 'roi') {
                        return value.toFixed(2);
                      } else {
                        return formatNumber(value);
                      }
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey={selectedMetric} 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </LineChart>
              ) : viewType === 'combined' ? (
                <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888" 
                    tick={{ fill: '#888', fontSize: 10 }} 
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#888" 
                    tick={{ fill: '#888', fontSize: 10 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#888" 
                    tick={{ fill: '#888', fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#333', border: 'none' }} 
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'cpa' || name === 'spend' || name === 'sales') {
                        return formatCurrency(value);
                      } else {
                        return formatNumber(value);
                      }
                    }}
                  />
                  <Legend />
                  <Bar 
                    yAxisId="right"
                    dataKey="units" 
                    fill="#4ade80" 
                    name="Conversiones"
                    barSize={20}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="spend" 
                    stroke="#f87171" 
                    strokeWidth={2}
                    name="Gastos"
                    dot={{ r: 3, strokeWidth: 1 }}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="cpa" 
                    stroke="#60a5fa" 
                    strokeWidth={2}
                    name="CPA"
                    dot={{ r: 3, strokeWidth: 1 }}
                  />
                </ComposedChart>
              ) : (
                // Vista de tendencia con ComposedChart para mejor control de capas
                <ComposedChart data={chartData} margin={{ top: 5, right: 30, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888" 
                    tick={{ fill: '#888', fontSize: 12, fontWeight: 'bold' }} 
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#888" 
                    tick={{ fill: '#888', fontSize: 10 }}
                    tickFormatter={(value) => `$${value}`}
                    domain={[0, 'auto']}
                    allowDataOverflow={false}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#888" 
                    tick={{ fill: '#888', fontSize: 10 }}
                    domain={[0, 'auto']}
                    allowDataOverflow={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#333', border: 'none' }} 
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'CPA') {
                        return [formatCurrency(value), name];
                      } else if (name === 'Gastos') {
                        return [formatCurrency(value), name];
                      } else if (name === 'Conversiones') {
                        return [formatNumber(value), name];
                      } else {
                        return [value, name];
                      }
                    }}
                  />
                  <Legend />
                  
                  {/* Áreas para gastos y conversiones */}
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="spend" 
                    stackId="1"
                    stroke="#f87171" 
                    fill="#f87171"
                    fillOpacity={0.5}
                    name="Gastos"
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="units" 
                    stackId="2"
                    stroke="#4ade80" 
                    fill="#4ade80"
                    fillOpacity={0.5}
                    name="Conversiones"
                  />
                  
                  {/* Línea de CPA destacada por encima de las áreas */}
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="cpa" 
                    stroke="#60a5fa" 
                    strokeWidth={3}
                    dot={{ r: 6, strokeWidth: 2, fill: '#fff', stroke: '#60a5fa' }}
                    activeDot={{ r: 8, strokeWidth: 2, fill: '#60a5fa' }}
                    name="CPA"
                    isAnimationActive={true}
                    z={10}
                  />
                  
                  {/* Referencia para el promedio de CPA - MOVIDA AL FINAL PARA ESTAR POR ENCIMA */}
                  {chartData.length > 1 && (
                    <ReferenceLine 
                      y={chartData.reduce((sum, item) => sum + (item.cpa || 0), 0) / chartData.length} 
                      yAxisId="left" 
                      stroke="#ff9500" 
                      strokeWidth={2}
                      strokeDasharray="5 3" 
                      label={{ 
                        value: 'CPA Prom', 
                        fill: '#ff9500', 
                        fontSize: 12,
                        fontWeight: 'bold',
                        position: 'insideRight',
                        offset: 15
                      }}
                      z={30}
                    />
                  )}
                </ComposedChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              No hay datos suficientes para mostrar el gráfico
            </div>
          )}
        </div>
      </div>
      
      {/* Estadísticas de resumen */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-750 p-3 rounded-lg">
          <div className="text-xs text-gray-400">CPA Promedio</div>
          <div className="text-lg font-bold">{formatCurrency(stats.avgCpa)}</div>
          <div className={`text-xs flex items-center ${stats.cpaChange < 0 ? 'text-green-500' : 'text-red-500'}`}>
            <span className="mr-1">{stats.cpaChange < 0 ? '↓' : '↑'}</span> 
            {Math.abs(stats.cpaChange).toFixed(1)}% vs periodo anterior
          </div>
        </div>
        
        <div className="bg-gray-750 p-3 rounded-lg">
          <div className="text-xs text-gray-400">ROI Promedio</div>
          <div className="text-lg font-bold text-green-500">{stats.avgRoi.toFixed(2)}</div>
          <div className={`text-xs flex items-center ${stats.roiChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
            <span className="mr-1">{stats.roiChange > 0 ? '↑' : '↓'}</span> 
            {Math.abs(stats.roiChange).toFixed(1)}% vs periodo anterior
          </div>
        </div>
        
        <div className="bg-gray-750 p-3 rounded-lg">
          <div className="text-xs text-gray-400">Conversiones</div>
          <div className="text-lg font-bold text-blue-500">{formatNumber(stats.totalUnits)}</div>
          <div className={`text-xs flex items-center ${stats.unitsChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
            <span className="mr-1">{stats.unitsChange > 0 ? '↑' : '↓'}</span> 
            {Math.abs(stats.unitsChange).toFixed(1)}% vs periodo anterior
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsChart;
