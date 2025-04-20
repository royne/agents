import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Line,
  ComposedChart
} from 'recharts';

interface ProductProfitabilityChartProps {
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  averageMargin: number;
  productsByCategory: Record<string, { count: number; value: number; cost: number; profit: number; margin: number }>;
}

/**
 * Componente para visualizar la rentabilidad de productos por categoría
 * Muestra un gráfico compuesto con valor, costo y margen por categoría
 */
const ProductProfitabilityChart: React.FC<ProductProfitabilityChartProps> = ({
  totalValue,
  totalCost,
  totalProfit,
  averageMargin,
  productsByCategory
}) => {
  // Preparar los datos para el gráfico
  const data = Object.entries(productsByCategory)
    .map(([name, { value, cost, profit, margin }]) => ({
      name,
      valor: value,
      costo: cost,
      ganancia: profit,
      margen: margin * 100 // Convertir a porcentaje
    }))
    .sort((a, b) => b.valor - a.valor); // Ordenar por valor (descendente)
  
  // Limitar a las 8 principales categorías para mejor visualización
  const topCategories = data.slice(0, 8);
  
  // Formatear valores como moneda colombiana
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Formatear porcentajes
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="bg-theme-component p-4 rounded-lg shadow h-96">
      <h3 className="text-lg font-semibold mb-3 text-center">Rentabilidad por Categoría</h3>
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart
          data={topCategories}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 70
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={70}
            interval={0}
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
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'margen') {
                return [formatPercentage(value), 'Margen'];
              }
              return [formatCurrency(value), name === 'valor' ? 'Valor' : name === 'costo' ? 'Costo' : 'Ganancia'];
            }}
            labelStyle={{ color: '#333' }}
            contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="valor" name="Valor" fill="#8884d8" />
          <Bar yAxisId="left" dataKey="costo" name="Costo" fill="#82ca9d" />
          <Bar yAxisId="left" dataKey="ganancia" name="Ganancia" fill="#ffc658" />
          <Line yAxisId="right" type="monotone" dataKey="margen" name="Margen %" stroke="#ff7300" />
          <ReferenceLine yAxisId="right" y={averageMargin * 100} stroke="red" strokeDasharray="3 3" label={{ value: `Margen Promedio: ${(averageMargin * 100).toFixed(1)}%`, position: 'insideBottomRight' }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductProfitabilityChart;
