import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line
} from 'recharts';

export interface OrdersDailyTrendPoint {
  date: string;
  orders: number;
  value: number;
}

interface OrdersDailyTrendChartProps {
  data: OrdersDailyTrendPoint[];
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Sin fecha';
  if (dateStr.startsWith('fecha-')) return dateStr.substring(6);
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

const OrdersDailyTrendChart: React.FC<OrdersDailyTrendChartProps> = ({ data }) => {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="bg-theme-component p-4 rounded-lg shadow h-96">
      <h3 className="text-lg font-semibold mb-3 text-center">Tendencia diaria de órdenes y valor</h3>
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={sorted} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" orientation="left" tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}K` : `${v}`)} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => (typeof v === 'number' ? `${Math.round(v / 1000)}K` : v)} />
          <Tooltip
            labelFormatter={formatDate}
            formatter={(value: any, name: string) => {
              if (name === 'value') return [formatCurrency(value as number), 'Valor'];
              return [value, 'Órdenes'];
            }}
            labelStyle={{ color: 'var(--theme-text-color)' }}
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#e2e8f0', padding: 8, borderRadius: 4 }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="orders" name="Órdenes" fill="#2196F3" />
          <Line yAxisId="right" type="monotone" dataKey="value" name="Valor" stroke="#4CAF50" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OrdersDailyTrendChart;
