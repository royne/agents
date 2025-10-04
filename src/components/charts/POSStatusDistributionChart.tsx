import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface POSStatusDistributionChartProps {
  statusDistribution: Record<string, number>;
}

const COLORS: Record<string, string> = {
  'Nuevo': '#6B7280',
  'Confirmado': '#10B981',
  'Empacando': '#3B82F6',
  'Cancelado': '#F97316',
  'Abandonado': '#F59E0B',
  'Devolución': '#EF4444',
  'Otros': '#8B5CF6'
};

const canonicalKeys = ['Nuevo', 'Confirmado', 'Empacando', 'Cancelado', 'Abandonado', 'Devolución'];

const POSStatusDistributionChart: React.FC<POSStatusDistributionChartProps> = ({ statusDistribution }) => {
  // Normalizar a los 6 estados principales, y agrupar el resto en "Otros"
  const data = useMemo(() => {
    const counts: Record<string, number> = {
      'Nuevo': 0,
      'Confirmado': 0,
      'Empacando': 0,
      'Cancelado': 0,
      'Abandonado': 0,
      'Devolución': 0,
      'Otros': 0
    };

    for (const [k, v] of Object.entries(statusDistribution || {})) {
      const s = k.toLowerCase();
      if (s.includes('nuevo')) counts['Nuevo'] += v;
      else if (s.includes('confirm')) counts['Confirmado'] += v;
      else if (s.includes('empac')) counts['Empacando'] += v;
      else if (s.includes('cancel')) counts['Cancelado'] += v;
      else if (s.includes('abandon')) counts['Abandonado'] += v;
      else if (s.includes('devol')) counts['Devolución'] += v;
      else counts['Otros'] += v;
    }

    // Eliminar categorías con cero para una visual más clara
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [statusDistribution]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-theme-component p-4 rounded-lg shadow h-96">
      <h3 className="text-lg font-semibold mb-3 text-center">Distribución por Estado (POS)</h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={40}
            dataKey="value"
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
              const RADIAN = Math.PI / 180;
              const radius = 25 + innerRadius + (outerRadius - innerRadius);
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              const item = data[index];
              const color = COLORS[item.name] || COLORS['Otros'];
              return (
                <text 
                  x={x} 
                  y={y} 
                  fill={color}
                  textAnchor={x > (cx as number) ? 'start' : 'end'}
                  dominantBaseline="central"
                  fontWeight="bold"
                >
                  {`${item.name}: ${(percent * 100).toFixed(1)}%`}
                </text>
              );
            }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS['Otros']} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value} órdenes (${((value / total) * 100).toFixed(1)}%)`, 'Cantidad']}
          />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center" 
            wrapperStyle={{ paddingTop: 20 }}
            iconSize={10}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default POSStatusDistributionChart;
