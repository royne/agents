import React, { useState, useMemo } from 'react';
import { FaRegChartBar } from 'react-icons/fa';
import { formatCurrency, formatNumber } from '../../../utils/formatters';
import { CampaignDailyRecord } from '../../../types/campaign-control';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MetricsChartProps {
  period?: string;
  onPeriodChange?: (period: string) => void;
  dailyRecords?: CampaignDailyRecord[];
}

const MetricsChart: React.FC<MetricsChartProps> = ({ 
  period = '7', 
  onPeriodChange = () => {},
  dailyRecords = []
}) => {
  // Estado para la métrica seleccionada
  const [selectedMetric, setSelectedMetric] = useState<string>('cpa');
  
  // Filtrar registros según el período seleccionado
  const filteredRecords = useMemo(() => {
    if (!dailyRecords || dailyRecords.length === 0) return [];
    
    const days = parseInt(period);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return dailyRecords
      .filter(record => new Date(record.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
      
      return {
        date: new Date(record.date).toLocaleDateString(),
        cpa,
        roi,
        units,
        spend,
        sales
      };
    });
  }, [filteredRecords]);
  
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
    const avgCpa = chartData.reduce((sum, item) => sum + item.cpa, 0) / chartData.length;
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
          <FaRegChartBar className="mr-2 text-primary-color" />
          Tendencia y Análisis
        </div>
        <div>
          <select 
            className="bg-gray-700 border border-gray-600 rounded p-1 text-sm"
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
            <ResponsiveContainer width="100%" height={200}>
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
