import React, { useMemo, useState, useEffect } from 'react';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { DailyOrderUTMData } from '../../services/data-analysis/DailyOrdersUTMService';

interface ProductCampaignTermChartProps {
  rows: DailyOrderUTMData[];
  title?: string;
  topTerms?: number; // cuántos terms mostrar como series; el resto se agrupa en "Otros"
}

const TERM_COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#22C55E', '#E11D48', '#0EA5E9', '#A78BFA'
];

const ProductCampaignTermChart: React.FC<ProductCampaignTermChartProps> = ({ rows, title = 'Campañas y conjuntos por producto', topTerms = 6 }) => {
  // Lista de productos disponibles
  const productOptions = useMemo(() => {
    const set = new Set<string>();
    (rows || []).forEach(r => {
      const p = (r.productName ?? '').toString().trim() || 'Sin producto';
      set.add(p);
    });
    return Array.from(set).sort();
  }, [rows]);

  const [selectedProduct, setSelectedProduct] = useState<string>('');

  useEffect(() => {
    if (!selectedProduct && productOptions.length > 0) {
      setSelectedProduct(productOptions[0]);
    }
  }, [productOptions, selectedProduct]);

  const { data, termKeys } = useMemo(() => {
    if (!rows || rows.length === 0) return { data: [] as any[], termKeys: [] as string[] };

    const prod = selectedProduct || productOptions[0] || '';

    // Agrupar: campaign -> term -> count (solo filas del producto seleccionado)
    const map: Record<string, Record<string, number>> = {};
    const termTotals: Record<string, number> = {};

    rows.forEach(r => {
      const p = (r.productName ?? '').toString().trim() || 'Sin producto';
      if (p !== prod) return;
      const campaign = (r.utmCampaign ?? '').toString().trim() || `Sin UTM - ${p}`;
      const term = (r.utmTerm ?? '').toString().trim() || 'Sin término';
      if (!map[campaign]) map[campaign] = {};
      map[campaign][term] = (map[campaign][term] || 0) + 1;
      termTotals[term] = (termTotals[term] || 0) + 1;
    });

    // Elegir top N terms globales para el producto
    const top = Object.entries(termTotals).sort((a, b) => b[1] - a[1]).slice(0, topTerms).map(([t]) => t);

    // Construir dataset para Recharts: una fila por campaign con columnas para cada top term y "Otros"
    const rowsData = Object.entries(map).map(([campaign, termCounts]) => {
      const row: any = { campaign };
      let otros = 0;
      Object.entries(termCounts).forEach(([term, cnt]) => {
        if (top.includes(term)) row[term] = cnt;
        else otros += cnt;
      });
      if (otros > 0) row['Otros'] = otros;
      return row;
    }).sort((a, b) => {
      const at = Object.values(a).slice(1).reduce((s: number, v: any) => s + (v as number), 0);
      const bt = Object.values(b).slice(1).reduce((s: number, v: any) => s + (v as number), 0);
      return bt - at;
    });

    const keys = [...top];
    const hasOtros = rowsData.some(r => r['Otros'] > 0);
    if (hasOtros) keys.push('Otros');

    return { data: rowsData, termKeys: keys };
  }, [rows, selectedProduct, productOptions, topTerms]);

  // KPIs del producto seleccionado (cantidades por estado)
  const kpis = useMemo(() => {
    const prod = selectedProduct || productOptions[0] || '';
    const counts = {
      Nuevo: 0,
      Confirmado: 0,
      Empacando: 0,
      Cancelado: 0,
      Abandonado: 0,
      Devolución: 0
    } as Record<string, number>;
    (rows || []).forEach(r => {
      const p = (r.productName ?? '').toString().trim() || 'Sin producto';
      if (p !== prod) return;
      const s = (r.status ?? '').toString().toLowerCase();
      if (s.includes('confirm')) counts['Confirmado'] += 1;
      else if (s.includes('empac')) counts['Empacando'] += 1;
      else if (s.includes('cancel')) counts['Cancelado'] += 1;
      else if (s.includes('abandon')) counts['Abandonado'] += 1;
      else if (s.includes('devol')) counts['Devolución'] += 1;
      else counts['Nuevo'] += 1;
    });
    const efectivos = counts['Confirmado'] + counts['Empacando'];
    const posibles = counts['Nuevo'];
    const total = efectivos + posibles + counts['Cancelado'] + counts['Abandonado'] + counts['Devolución'];
    return { total, efectivos, posibles, counts };
  }, [rows, selectedProduct, productOptions]);

  return (
    <div className="bg-theme-primary p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="w-64">
          <label className="block text-sm text-theme-secondary mb-1">Producto</label>
          <select
            className="w-full bg-theme-component border border-theme-border rounded px-3 py-2"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            {productOptions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tarjetas KPI del producto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-theme-primary p-4 rounded-lg shadow flex flex-col items-center justify-center">
          <h4 className="text-sm font-semibold mb-1">Total de Órdenes</h4>
          <div className="text-2xl font-bold">{kpis.total}</div>
        </div>
        <div className="bg-theme-primary p-4 rounded-lg shadow flex flex-col items-center justify-center">
          <h4 className="text-sm font-semibold mb-1">Efectivos (Conf + Emp)</h4>
          <div className="text-2xl font-bold text-green-500">{kpis.efectivos}</div>
          <div className="text-xs mt-1 text-theme-secondary">Conf: {kpis.counts['Confirmado']} · Emp: {kpis.counts['Empacando']}</div>
        </div>
        <div className="bg-theme-primary p-4 rounded-lg shadow flex flex-col items-center justify-center">
          <h4 className="text-sm font-semibold mb-1">Posibles (Nuevo)</h4>
          <div className="text-2xl font-bold text-blue-500">{kpis.posibles}</div>
          <div className="text-xs mt-1 text-theme-secondary">Aband: {kpis.counts['Abandonado']} · Canc: {kpis.counts['Cancelado']}</div>
        </div>
      </div>

      <div className="h-96 bg-theme-component p-4 rounded-lg">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="campaign" interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                const items = payload.filter(p => typeof p.value === 'number');
                const total = items.reduce((s, it) => s + (Number(it.value) || 0), 0);
                return (
                  <div style={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#e2e8f0', padding: 8, borderRadius: 4 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
                    {items.map((it) => (
                      <div key={String(it.dataKey)}>{String(it.name)}: <b>{Number(it.value) || 0}</b></div>
                    ))}
                    <div style={{ marginTop: 6 }}>Total: <b>{total}</b></div>
                  </div>
                );
              }}
            />
            <Legend />
            {termKeys.map((k, idx) => (
              <Bar key={k} stackId="a" dataKey={k} name={k} fill={TERM_COLORS[idx % TERM_COLORS.length]} />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductCampaignTermChart;
