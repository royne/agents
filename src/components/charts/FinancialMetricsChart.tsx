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
  Cell
} from 'recharts';

interface FinancialMetricsChartProps {
  totalProfit: number;
  totalShippingCost: number;
  totalReturnCost: number;
  profitWithoutReturns: number;
}

/**
 * Componente para visualizar métricas financieras clave
 * Muestra un gráfico de barras con ganancias, costos de envío y costos de devolución
 */
const FinancialMetricsChart: React.FC<FinancialMetricsChartProps> = ({
  totalProfit,
  totalShippingCost,
  totalReturnCost,
  profitWithoutReturns
}) => {
  // Preparar los datos para el gráfico
  const data = [
    {
      name: 'Ganancia Total',
      valor: totalProfit,
      color: '#4CAF50'
    },
    {
      name: 'Ganancia sin Inefectividad',
      valor: profitWithoutReturns,
      color: '#2196F3'
    },
    {
      name: 'Costo de Envíos',
      valor: totalShippingCost,
      color: '#FFC107'
    },
    {
      name: 'Costo Devoluciones',
      valor: totalReturnCost,
      color: '#F44336'
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
      <h3 className="text-lg font-semibold mb-3 text-center">Métricas Financieras</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis 
            tickFormatter={(value) => {
              if (value >= 1000000) {
                return `${(value / 1000000).toFixed(1)}M`;
              } else if (value >= 1000) {
                return `${(value / 1000).toFixed(0)}K`;
              }
              return value;
            }}
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), 'Valor']}
            labelStyle={{ color: '#333' }}
            contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}
          />
          <Legend />
          <ReferenceLine y={0} stroke="#000" />
          <Bar dataKey="valor" name="Valor" fill="#8884d8">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinancialMetricsChart;
