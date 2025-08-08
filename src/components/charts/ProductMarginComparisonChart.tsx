import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ProductProfitData } from '../../services/data-analysis/ProductsAnalysisService';

interface ProductMarginComparisonChartProps {
  products: ProductProfitData[];
}

const ProductMarginComparisonChart: React.FC<ProductMarginComparisonChartProps> = ({ products }) => {
  // Ordenar productos por margen (de mayor a menor)
  const topProducts = [...products]
    .filter(product => product.totalValue > 0) // Evitar división por cero
    .map(product => ({
      ...product,
      margin: (product.profit / product.totalValue) * 100 // Calcular margen como porcentaje
    }))
    .sort((a, b) => b.margin - a.margin) // Ordenar por margen descendente
    .slice(0, 10); // Tomar los 10 productos con mayor margen

  // Función para determinar el color basado en el margen
  const getMarginColor = (margin: number) => {
    if (margin >= 50) return '#4CAF50'; // Verde para márgenes altos
    if (margin >= 30) return '#8BC34A'; // Verde claro
    if (margin >= 20) return '#CDDC39'; // Lima
    if (margin >= 10) return '#FFEB3B'; // Amarillo
    return '#FF9800'; // Naranja para márgenes bajos
  };
  
  // Componente personalizado para el tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }
    
    const data = payload[0].payload;
    
    return (
      <div className="bg-theme-component p-4 rounded shadow-lg border border-gray-700" style={{ maxWidth: '300px', minWidth: '200px' }}>
        <p className="font-bold text-lg mb-2 text-theme-text truncate">{label}</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-theme-secondary">Margen:</span>
          <span className="text-primary-color font-semibold">{data.margin.toFixed(2)}%</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-theme-secondary">Ganancia:</span>
          <span className="text-primary-color font-semibold">{data.profit.toLocaleString('es-CO')} $</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-theme-secondary">Cantidad vendida:</span>
          <span className="text-primary-color font-semibold">{data.quantity}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-theme-component p-4 rounded-lg shadow h-96">
      <h3 className="text-lg font-semibold mb-3 text-center">Top 10 Productos por Margen</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={topProducts}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 'dataMax + 5']} />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={150} 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
            />
            <Tooltip 
              content={<CustomTooltip />}
              wrapperStyle={{ zIndex: 1000, pointerEvents: 'auto' }}
            />
            <Legend />
            <Bar dataKey="margin" name="Margen (%)">
              {topProducts.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getMarginColor(entry.margin)} />
              ))}
            </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductMarginComparisonChart;
