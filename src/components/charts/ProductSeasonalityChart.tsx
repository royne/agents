import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Line, LineChart, Area, AreaChart
} from 'recharts';
import { TrendData } from '../../services/data-analysis/ProductsAnalysisService';

interface ProductSeasonalityChartProps {
  trendData: TrendData[];
}

interface DayData {
  name: string;
  sales: number;
  profit: number;
  count: number;
}

interface ProjectionData {
  date: string;
  actual: number;
  projected: number;
  fullDate?: number; // Timestamp para ordenar correctamente
}

const ProductSeasonalityChart: React.FC<ProductSeasonalityChartProps> = ({ trendData }) => {
  // Procesar datos para agrupar por día de la semana
  const dayOfWeekData = useMemo(() => {
    // Inicializar datos para cada día de la semana
    const days: Record<string, DayData> = {
      'Domingo': { name: 'Domingo', sales: 0, profit: 0, count: 0 },
      'Lunes': { name: 'Lunes', sales: 0, profit: 0, count: 0 },
      'Martes': { name: 'Martes', sales: 0, profit: 0, count: 0 },
      'Miércoles': { name: 'Miércoles', sales: 0, profit: 0, count: 0 },
      'Jueves': { name: 'Jueves', sales: 0, profit: 0, count: 0 },
      'Viernes': { name: 'Viernes', sales: 0, profit: 0, count: 0 },
      'Sábado': { name: 'Sábado', sales: 0, profit: 0, count: 0 }
    };

    // Nombres de los días en español
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Acumular datos por día de la semana
    trendData.forEach(item => {
      try {
        const date = new Date(item.date);
        if (!isNaN(date.getTime())) {
          const dayOfWeek = dayNames[date.getDay()];
          days[dayOfWeek].sales += item.sales;
          days[dayOfWeek].profit += item.profit;
          days[dayOfWeek].count += 1;
        }
      } catch (e) {
        console.error('Error al procesar fecha:', item.date);
      }
    });

    // Convertir a array y calcular promedios
    return Object.values(days)
      .map(day => ({
        name: day.name,
        sales: day.count > 0 ? day.sales / day.count : 0,
        profit: day.count > 0 ? day.profit / day.count : 0,
        count: day.count
      }))
      // Reordenar para que la semana comience en lunes
      .sort((a, b) => {
        const order = { 'Lunes': 0, 'Martes': 1, 'Miércoles': 2, 'Jueves': 3, 'Viernes': 4, 'Sábado': 5, 'Domingo': 6 };
        return order[a.name as keyof typeof order] - order[b.name as keyof typeof order];
      });
  }, [trendData]);

  // Procesar datos para proyección de ventas
  const projectionData = useMemo(() => {
    if (!trendData || trendData.length === 0) return [];

    // Ordenar los datos por fecha
    const sortedData = [...trendData]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Obtener fechas únicas y asegurar que están ordenadas cronológicamente
    const uniqueDates = Array.from(new Set(sortedData.map(item => item.date)))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    // Calcular ventas totales por fecha
    const salesByDate: Record<string, number> = {};
    sortedData.forEach(item => {
      if (!salesByDate[item.date]) salesByDate[item.date] = 0;
      salesByDate[item.date] += item.sales;
    });
    
    // Calcular la tendencia lineal simple
    const xValues = uniqueDates.map((_, i) => i);
    const yValues = uniqueDates.map(date => salesByDate[date] || 0);
    
    // Calcular coeficientes de regresión lineal (y = mx + b)
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((a, b, i) => a + b * yValues[i], 0);
    const sumXX = xValues.reduce((a, b) => a + b * b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX); // m
    const intercept = (sumY - slope * sumX) / n; // b
    
    // Generar datos de proyección para los próximos 7 días
    const result: ProjectionData[] = [];
    
    // Función para formatear fechas de manera consistente
    const formatDateForChart = (dateObj: Date) => {
      // Formato: DD/MM
      return `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    };
    
    // Añadir datos históricos
    uniqueDates.forEach((date, i) => {
      const dateObj = new Date(date);
      result.push({
        date: formatDateForChart(dateObj),
        actual: salesByDate[date] || 0,
        projected: slope * i + intercept,
        // Guardar la fecha completa para ordenar correctamente
        fullDate: dateObj.getTime()
      });
    });
    
    // Añadir proyecciones futuras
    const lastDate = new Date(uniqueDates[uniqueDates.length - 1]);
    for (let i = 1; i <= 7; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setDate(lastDate.getDate() + i);
      
      result.push({
        date: formatDateForChart(nextDate),
        actual: 0, // No hay datos reales para fechas futuras
        projected: slope * (xValues.length + i - 1) + intercept,
        // Guardar la fecha completa para ordenar correctamente
        fullDate: nextDate.getTime()
      });
    }
    
    // Ordenar el resultado por fecha
    result.sort((a, b) => (a.fullDate as number) - (b.fullDate as number));
    
    return result;
  }, [trendData]);

  // Componente personalizado para el tooltip del gráfico de días de la semana
  const DayTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }
    
    return (
      <div className="bg-theme-component p-4 rounded shadow-lg border border-gray-700" style={{ maxWidth: '300px', minWidth: '200px' }}>
        <p className="font-bold text-lg mb-2 text-theme-text">{label}</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-theme-secondary">Ventas Promedio:</span>
          <span className="text-primary-color font-semibold">{payload[0].value.toLocaleString('es-CO', { maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-theme-secondary">Ganancia Promedio:</span>
          <span className="text-primary-color font-semibold">{payload[1].value.toLocaleString('es-CO', { maximumFractionDigits: 2 })} $</span>
        </div>
      </div>
    );
  };
  
  // Componente personalizado para el tooltip del gráfico de proyección
  const ProjectionTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }
    
    // Determinar si estamos mostrando datos históricos o proyectados
    const hasActualData = payload[0]?.value > 0;
    
    return (
      <div className="bg-theme-component p-4 rounded shadow-lg border border-gray-700" style={{ maxWidth: '300px', minWidth: '200px' }}>
        <p className="font-bold text-lg mb-2 text-theme-text">{label}</p>
        {hasActualData && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-theme-secondary">Ventas reales:</span>
            <span className="text-primary-color font-semibold">{payload[0].value.toLocaleString('es-CO', { maximumFractionDigits: 0 })} $</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-theme-secondary">Ventas {hasActualData ? 'estimadas' : 'proyectadas'}:</span>
          <span className="text-blue-500 font-semibold">{payload[1].value.toLocaleString('es-CO', { maximumFractionDigits: 0 })} $</span>
        </div>
        {!hasActualData && (
          <p className="text-xs text-gray-500 mt-2 italic">Proyección basada en datos históricos</p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-theme-component p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-center">Análisis de Estacionalidad</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de ventas por día de la semana */}
        <div className="h-80">
          <h4 className="text-md font-medium mb-2 text-center">Ventas promedio por día de la semana</h4>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={dayOfWeekData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip content={<DayTooltip />} wrapperStyle={{ zIndex: 1000, pointerEvents: 'auto' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="sales" name="Ventas" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="profit" name="Ganancia" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Gráfico de proyección de ventas */}
        <div className="h-80">
          <h4 className="text-md font-medium mb-2 text-center">Proyección de ventas (próximos 7 días)</h4>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={projectionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<ProjectionTooltip />} wrapperStyle={{ zIndex: 1000, pointerEvents: 'auto' }} />
              <Legend />
              <Area type="monotone" dataKey="actual" name="Ventas reales" fill="#8884d8" stroke="#8884d8" fillOpacity={0.3} />
              <Area type="monotone" dataKey="projected" name="Ventas proyectadas" fill="#82ca9d" stroke="#82ca9d" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProductSeasonalityChart;
