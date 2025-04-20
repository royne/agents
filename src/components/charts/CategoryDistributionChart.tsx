import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CategoryDistributionChartProps {
  productsByCategory: Record<string, { count: number; value: number }>;
}

/**
 * Componente para visualizar la distribución de productos por categoría
 * Muestra un gráfico circular con las diferentes categorías de productos
 */
const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({
  productsByCategory
}) => {
  // Colores para las diferentes categorías
  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
    '#82CA9D', '#A4DE6C', '#D0ED57', '#FFC658', '#FF7C43'
  ];
  
  // Preparar los datos para el gráfico
  const data = Object.entries(productsByCategory)
    .map(([name, { count, value }]) => ({ name, count, value }))
    .sort((a, b) => b.count - a.count); // Ordenar por cantidad (descendente)
  
  // Limitar a las 10 principales categorías para mejor visualización
  const topCategories = data.slice(0, 10);
  const otherCategories = data.slice(10);
  
  // Si hay más de 10 categorías, agrupar el resto como "Otros"
  let chartData = [...topCategories];
  
  if (otherCategories.length > 0) {
    const otherCount = otherCategories.reduce((sum, cat) => sum + cat.count, 0);
    const otherValue = otherCategories.reduce((sum, cat) => sum + cat.value, 0);
    chartData.push({ name: 'Otros', count: otherCount, value: otherValue });
  }
  
  // Calcular el total de productos
  const totalProducts = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-theme-component p-4 rounded-lg shadow h-96">
      <h3 className="text-lg font-semibold mb-3 text-center">Distribución por Categoría</h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string, props: any) => {
              const entry = props.payload;
              return [
                `${value} productos (${((value / totalProducts) * 100).toFixed(1)}%)`,
                `Cantidad de ${entry.name}`
              ];
            }}
          />
          <Legend layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryDistributionChart;
