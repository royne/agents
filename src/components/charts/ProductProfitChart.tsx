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

interface ProductData {
  name: string;
  profit: number;
  quantity: number;
  totalValue: number;
}

interface ProductProfitChartProps {
  products: ProductData[];
}

/**
 * Componente para visualizar la rentabilidad por producto
 * Muestra un gráfico de barras horizontales con los productos más rentables
 */
/**
 * Limpia el nombre del producto eliminando números al inicio
 */
const cleanProductName = (name: string): string => {
  // Eliminar números y caracteres especiales al inicio del nombre
  return name.replace(/^[\d\s\-_.:#]+\s*/g, '');
};

const ProductProfitChart: React.FC<ProductProfitChartProps> = ({
  products
}) => {
  // Ordenar productos por ganancia (descendente) y tomar los 10 principales
  const topProducts = [...products]
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 10)
    .map(product => ({
      ...product,
      name: cleanProductName(product.name) // Limpiar el nombre del producto
    }));
  
  // Formatear valores como moneda colombiana
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Colores para las barras basados en la ganancia
  const getBarColor = (index: number) => {
    const colors = [
      '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', 
      '#FF9800', '#FF5722', '#F44336', '#E91E63', '#9C27B0'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-theme-component p-4 rounded-lg shadow h-96">
      <h3 className="text-lg font-semibold mb-3 text-center">Top 10 Productos Más Rentables</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={topProducts}
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
            width={200}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'profit') {
                return [formatCurrency(value), 'Ganancia'];
              } else if (name === 'quantity') {
                return [value, 'Cantidad'];
              }
              return [formatCurrency(value), 'Valor Total'];
            }}
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
          <Bar 
            dataKey="profit" 
            name="Ganancia"
          >
            {topProducts.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(index)} />
            ))}
          </Bar>
          <Bar dataKey="quantity" name="Cantidad" fill="#2196F3" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductProfitChart;
