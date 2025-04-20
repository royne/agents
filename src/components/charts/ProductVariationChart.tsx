import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

interface VariationData {
  name: string;
  value: number;
  profit: number;
}

interface ProductVariationChartProps {
  variations: VariationData[];
}

/**
 * Componente para visualizar la distribución de ventas por variación de producto
 * Muestra un gráfico circular con las diferentes variaciones
 */
const ProductVariationChart: React.FC<ProductVariationChartProps> = ({
  variations
}) => {
  // Colores para las diferentes variaciones
  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
    '#82CA9D', '#A4DE6C', '#D0ED57', '#FFC658', '#FF7C43'
  ];
  
  // Ordenar variaciones por valor (descendente)
  const sortedVariations = [...variations]
    .sort((a, b) => b.value - a.value);
  
  // Limitar a las 10 principales variaciones para mejor visualización
  const topVariations = sortedVariations.slice(0, 10);
  const otherVariations = sortedVariations.slice(10);
  
  // Si hay más de 10 variaciones, agrupar el resto como "Otros"
  let chartData = [...topVariations];
  
  if (otherVariations.length > 0) {
    const otherValue = otherVariations.reduce((sum, item) => sum + item.value, 0);
    const otherProfit = otherVariations.reduce((sum, item) => sum + item.profit, 0);
    chartData.push({ name: 'Otros', value: otherValue, profit: otherProfit });
  }
  
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
      <h3 className="text-lg font-semibold mb-3 text-center">Distribución por Variación</h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
              const RADIAN = Math.PI / 180;
              const radius = 25 + innerRadius + (outerRadius - innerRadius);
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              
              return (
                <text 
                  x={x} 
                  y={y} 
                  fill={COLORS[index % COLORS.length]}
                  textAnchor={x > cx ? 'start' : 'end'}
                  dominantBaseline="central"
                  fontWeight="bold"
                >
                  {`${chartData[index].name}: ${(percent * 100).toFixed(1)}%`}
                </text>
              );
            }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number, name: string, props: any) => {
              const entry = props.payload;
              return [
                formatCurrency(value),
                `Valor de ${entry.name}`
              ];
            }}
          />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductVariationChart;
