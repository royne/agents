import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface ProductMetricsChartProps {
  uniqueProductsCount: number;
  totalQuantity: number;
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  averageMargin: number;
}

/**
 * Componente para visualizar un resumen de métricas de productos
 * Muestra un gráfico de radar con las principales métricas normalizadas
 */
const ProductMetricsChart: React.FC<ProductMetricsChartProps> = ({
  uniqueProductsCount,
  totalQuantity,
  totalValue,
  totalCost,
  totalProfit,
  averageMargin
}) => {
  // Normalizar los valores para el gráfico de radar
  // Cada métrica se muestra como un porcentaje de su valor máximo posible
  const maxValue = Math.max(totalValue, totalCost, totalProfit);
  
  const data = [
    {
      subject: 'Productos Únicos',
      A: uniqueProductsCount,
      fullMark: uniqueProductsCount,
      valor: uniqueProductsCount
    },
    {
      subject: 'Cantidad Total',
      A: totalQuantity,
      fullMark: totalQuantity,
      valor: totalQuantity
    },
    {
      subject: 'Valor Total',
      A: (totalValue / maxValue) * 100,
      fullMark: 100,
      valor: totalValue
    },
    {
      subject: 'Costo Total',
      A: (totalCost / maxValue) * 100,
      fullMark: 100,
      valor: totalCost
    },
    {
      subject: 'Ganancia Total',
      A: (totalProfit / maxValue) * 100,
      fullMark: 100,
      valor: totalProfit
    },
    {
      subject: 'Margen Promedio',
      A: averageMargin * 100,
      fullMark: 100,
      valor: averageMargin * 100
    }
  ];

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
      <h3 className="text-lg font-semibold mb-3 text-center">Resumen de Métricas de Productos</h3>
      <ResponsiveContainer width="100%" height="85%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name="Métricas"
            dataKey="A"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
          <Tooltip 
            formatter={(value: number, name: string, props: any) => {
              const entry = props.payload;
              const subject = entry.subject;
              
              if (subject === 'Valor Total' || subject === 'Costo Total' || subject === 'Ganancia Total') {
                return [formatCurrency(entry.valor), subject];
              } else if (subject === 'Margen Promedio') {
                return [`${entry.valor.toFixed(1)}%`, subject];
              }
              return [entry.valor, subject];
            }}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductMetricsChart;
