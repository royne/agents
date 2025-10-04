import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { CampaignSummary } from '../../services/data-analysis/DailyOrdersUTMService';

interface UTMCampaignsChartProps {
  campaigns: Record<string, CampaignSummary>;
  limit?: number;
  title?: string;
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

type Row = {
  name: string;
  total: number;
  value: number;
  Nuevo: number;
  Confirmado: number;
  Empacando: number;
  Cancelado: number;
  Abandonado: number;
  Devolución: number;
  summary: CampaignSummary;
};

const UTMCampaignsChart: React.FC<UTMCampaignsChartProps> = ({ campaigns, limit = 12, title = 'Campañas' }) => {
  const data = useMemo<Row[]>(() => {
    const rows = Object.entries(campaigns).map(([name, summary]) => {
      const dist = summary.statusDistribution || {};
      const sumBy = (needle: string) => Object.entries(dist)
        .filter(([k]) => k.toLowerCase().includes(needle))
        .reduce((sum, [, v]) => sum + (v as number), 0);

      const nuevo = sumBy('nuevo');
      const confirmado = sumBy('confirm');
      const empacando = sumBy('empac');
      const cancelado = sumBy('cancel');
      const abandonado = sumBy('abandon');
      const devolucion = sumBy('devol');

      return {
        name: name || 'Sin campaña',
        total: summary.totalOrders,
        value: summary.totalValue,
        Nuevo: nuevo,
        Confirmado: confirmado,
        Empacando: empacando,
        Cancelado: cancelado,
        Abandonado: abandonado,
        Devolución: devolucion,
        summary
      };
    });
    rows.sort((a, b) => b.total - a.total);
    return rows.slice(0, limit);
  }, [campaigns, limit]);

  return (
    <div className="bg-theme-component p-4 rounded-lg shadow h-96">
      <h3 className="text-lg font-semibold mb-3 text-center">{title}</h3>
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
          <YAxis />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) return null;
              const row = payload[0].payload as Row;
              const sd = row.summary.statusDistribution || {};
              const efectivo = (sd['Confirmado'] || 0) + (sd['Empacando'] || 0);
              const posible = (sd['Nuevo'] || 0);
              const cancelado = (sd['Cancelado'] || 0);
              const abandonado = (sd['Abandonado'] || 0);
              const devolucion = (sd['Devolución'] || 0);
              const total = efectivo + posible + cancelado + abandonado + devolucion;
              return (
                <div style={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#e2e8f0', padding: 8, borderRadius: 4 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
                  <div>Efectivo: <b className="text-green-400">{efectivo}</b></div>
                  <div>Posible: <b className="text-blue-400">{posible}</b></div>
                  <div>Abandonado: <b className="text-amber-400">{abandonado}</b></div>
                  <div>Cancelado: <b className="text-orange-400">{cancelado}</b></div>
                  {devolucion > 0 && (<div>Devolución: <b className="text-red-400">{devolucion}</b></div>)}
                  <div style={{ marginTop: 6 }}>Total: <b>{total}</b></div>
                  <div style={{ marginTop: 2, opacity: 0.9 }}>Efectivos vs Posibles: <b>{efectivo}</b> / <b>{posible}</b></div>
                </div>
              );
            }}
          />
          <Legend />
          <Bar stackId="a" dataKey="Nuevo" name="Nuevo" fill={COLORS['Nuevo']} />
          <Bar stackId="a" dataKey="Confirmado" name="Confirmado" fill={COLORS['Confirmado']} />
          <Bar stackId="a" dataKey="Empacando" name="Empacando" fill={COLORS['Empacando']} />
          <Bar stackId="a" dataKey="Cancelado" name="Cancelado" fill={COLORS['Cancelado']} />
          <Bar stackId="a" dataKey="Abandonado" name="Abandonado" fill={COLORS['Abandonado']} />
          <Bar stackId="a" dataKey="Devolución" name="Devolución" fill={COLORS['Devolución']} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UTMCampaignsChart;
