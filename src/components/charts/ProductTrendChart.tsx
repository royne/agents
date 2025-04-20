import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface TrendData {
  date: string;
  profit: number;
  sales: number;
}

interface ProductTrendChartProps {
  trends: TrendData[];
}

/**
 * Componente para visualizar la tendencia de ventas y ganancias a lo largo del tiempo
 * Muestra un gráfico de líneas con la evolución temporal
 */
const ProductTrendChart: React.FC<ProductTrendChartProps> = ({
  trends
}) => {
  // Ordenar datos por fecha (ascendente)
  const sortedTrends = [...trends].sort((a, b) => {
    return a.date.localeCompare(b.date);
  });
    
  // Formatear fecha para mostrar en formato más amigable
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Sin fecha';
    
    // Si comienza con 'fecha-', es un identificador genérico
    if (dateStr.startsWith('fecha-')) {
      return dateStr.substring(6);
    }
    
    try {
      // Intentar formatear como fecha
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('es-CO', { 
          day: '2-digit', 
          month: '2-digit',
          year: '2-digit'
        });
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };
  
  // Formatear valores como moneda colombiana
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="bg-theme-component p-4 rounded-lg shadow h-96">
      <h3 className="text-lg font-semibold mb-3 text-center">Tendencia de Ventas y Ganancias</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={sortedTrends}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="left"
            orientation="left"
            tickFormatter={(value) => {
              if (value >= 1000000) {
                return `${(value / 1000000).toFixed(1)}M`;
              } else if (value >= 1000) {
                return `${(value / 1000).toFixed(0)}K`;
              }
              return value;
            }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => value}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'profit') {
                return [formatCurrency(value), 'Ganancia'];
              }
              return [value, 'Ventas (unidades)'];
            }}
            labelFormatter={formatDate}
            labelStyle={{ color: 'var(--theme-text-color)' }}
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid #475569',
              color: '#e2e8f0',
              padding: '8px',
              borderRadius: '4px'
            }}
          />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="profit" 
            name="Ganancia" 
            stroke="#4CAF50" 
            activeDot={{ r: 8 }} 
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="sales" 
            name="Ventas (unidades)" 
            stroke="#2196F3" 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductTrendChart;
