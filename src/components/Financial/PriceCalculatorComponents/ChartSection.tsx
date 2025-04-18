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
import { ChartData } from '../../../hooks/usePriceCalculator';

interface ChartSectionProps {
  chartData: ChartData[];
  totalCost: number;
  formatCurrency: (value: number) => string;
}

const ChartSection = ({
  chartData,
  totalCost,
  formatCurrency
}: ChartSectionProps) => {
  // Componente de tooltip personalizado para el gráfico
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    
    return (
      <div className="bg-gray-800 border border-gray-600 p-2 rounded shadow-lg">
        <p className="text-gray-300 mb-1">{data.name}</p>
        <p className="text-blue-400 font-bold">{formatCurrency(data.valor)}</p>
        <p className="text-gray-400 text-xs">
          {((data.valor / totalCost) * 100).toFixed(1)}% del costo total
        </p>
      </div>
    );
  };

  // Colores para cada tipo de costo
  const COLORS = {
    'Costo Proveedor': '#4ade80', // Verde
    'Flete Total': '#f87171',     // Rojo
    'CPA Real': '#60a5fa',        // Azul
    'Costo Administrativo': '#fbbf24', // Amarillo
    'Otros Gastos': '#a78bfa',    // Púrpura
    'Ganancia': '#f472b6'         // Rosa
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg lg:col-span-2">
      <h2 className="text-xl font-bold mb-4">Composición del Precio</h2>
      
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis type="number" tick={{ fill: '#ddd' }} />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fill: '#ddd' }} 
              width={120}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#ddd' }} />
            <Bar 
              dataKey="valor" 
              name="Valor" 
              radius={[0, 4, 4, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#60a5fa'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex justify-center items-center h-64 text-gray-400">
          Ingresa el costo del proveedor para visualizar el gráfico
        </div>
      )}
    </div>
  );
};

export default ChartSection;
