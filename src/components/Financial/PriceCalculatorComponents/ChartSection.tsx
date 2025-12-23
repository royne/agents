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
      <div className="bg-gray-900 border border-gray-600 p-2 rounded shadow-lg">
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
    <div className="soft-card p-6 lg:col-span-2">
      <h2 className="text-xl font-semibold mb-8 flex items-center gap-2">
        <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </span>
        Composición Estratégica
      </h2>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
            layout="vertical"
            barSize={32}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
              width={140}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
              iconType="circle"
            />
            <Bar
              dataKey="valor"
              name="Inversión"
              radius={[0, 8, 8, 0]}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-white/5 border border-dashed border-white/10 rounded-2xl">
          <svg className="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm">Configura los costos del producto para visualizar el gráfico</p>
        </div>
      )}
    </div>
  );
};

export default ChartSection;
