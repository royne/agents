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
  Cell
} from 'recharts';

interface TopProductsChartProps {
  topProducts: Array<{
    name: string;
    quantity: number;
    value: number;
    profit: number;
    margin: number;
  }>;
}

/**
 * Componente para visualizar los productos más vendidos
 * Muestra un gráfico de barras horizontales con los productos más vendidos por cantidad
 */
const TopProductsChart: React.FC<TopProductsChartProps> = ({
  topProducts
}) => {
  // Ordenar productos por cantidad (descendente)
  const sortedProducts = [...topProducts]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10); // Mostrar solo los 10 principales
  
  // Preparar los datos para el gráfico
  const data = sortedProducts.map(product => ({
    name: product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name,
    cantidad: product.quantity,
    valor: product.value,
    ganancia: product.profit,
    margen: product.margin * 100 // Convertir a porcentaje
  }));
  
  // Formatear valores como moneda colombiana
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Colores para las barras basados en el margen de ganancia
  const getMarginColor = (margin: number) => {
    if (margin >= 40) return '#4CAF50'; // Verde para alto margen
    if (margin >= 25) return '#8BC34A'; // Verde claro
    if (margin >= 15) return '#FFEB3B'; // Amarillo
    if (margin >= 5) return '#FFC107'; // Ámbar
    return '#F44336'; // Rojo para bajo margen
  };

  return (
    <div className="bg-theme-component p-4 rounded-lg shadow h-96">
      <h3 className="text-lg font-semibold mb-3 text-center">Top 10 Productos Más Vendidos</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={150}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'margen') {
                return [`${value.toFixed(1)}%`, 'Margen'];
              } else if (name === 'cantidad') {
                return [value, 'Cantidad'];
              }
              return [formatCurrency(value), name === 'valor' ? 'Valor' : 'Ganancia'];
            }}
            labelStyle={{ color: '#333' }}
            contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}
          />
          <Legend />
          <Bar 
            dataKey="cantidad" 
            name="Cantidad" 
            fill="#8884d8"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getMarginColor(entry.margen)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopProductsChart;
