import React, { useMemo } from 'react';
import { FaClock } from 'react-icons/fa';
import { MovementAnalysisResult, MovementOrder, MovementAgeBucket } from '../../../services/data-analysis/OrdersMovementService';

interface MovementAgeAlertsPanelProps {
  analysisResult: MovementAnalysisResult;
  onBucketClick?: (bucket: MovementAgeBucket, orders: MovementOrder[], label: string) => void;
}

const bucketMeta: Record<MovementAgeBucket, { label: string; color: 'danger' | 'warn' | 'ok' | 'neutral' | 'none'; order: number }>
  = {
    '>72h':   { label: '>72 h',   color: 'danger',  order: 1 },
    '48-72h': { label: '48–72 h', color: 'warn',    order: 2 },
    '24-48h': { label: '24–48 h', color: 'neutral', order: 3 },
    '12-24h': { label: '12–24 h', color: 'neutral', order: 4 },
    '<12h':   { label: '<12 h',   color: 'ok',      order: 5 },
    'sin':    { label: 'Sin último mov.', color: 'none', order: 6 },
  };

function chipClasses(kind: 'danger' | 'warn' | 'ok' | 'neutral' | 'none') {
  switch (kind) {
    case 'danger':
      return 'bg-red-900/30 border border-red-600 text-red-300 hover:bg-red-900/50';
    case 'warn':
      return 'bg-yellow-900/30 border border-yellow-600 text-yellow-300 hover:bg-yellow-900/50';
    case 'ok':
      return 'bg-green-900/30 border border-green-600 text-green-300 hover:bg-green-900/50';
    case 'none':
      return 'bg-slate-800/40 border border-slate-600 text-slate-300 hover:bg-slate-800/60';
    default:
      return 'bg-theme-component border border-theme-border text-theme-primary hover:bg-theme-component-hover';
  }
}

const MovementAgeAlertsPanel: React.FC<MovementAgeAlertsPanelProps> = ({ analysisResult, onBucketClick }) => {
  const items = useMemo(() => {
    const count = analysisResult.ageBucketsCount;
    return (Object.keys(bucketMeta) as MovementAgeBucket[])
      .sort((a, b) => bucketMeta[a].order - bucketMeta[b].order)
      .map((k) => ({
        key: k,
        ...bucketMeta[k],
        count: count[k] || 0,
        orders: analysisResult.ordersByAge[k] || [],
      }));
  }, [analysisResult]);

  const totalAlerts = (analysisResult.ageBucketsCount['>72h'] || 0) + (analysisResult.ageBucketsCount['48-72h'] || 0);

  return (
    <div className="bg-theme-component p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <FaClock className="mr-2 text-primary-color" />
        Alertas por Antigüedad (último movimiento)
      </h3>

      {/* Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((it) => (
          <button
            key={it.key}
            type="button"
            className={`rounded-lg px-3 py-3 text-left ${chipClasses(it.color)} transition-colors`}
            onClick={() => onBucketClick && onBucketClick(it.key, it.orders, it.label)}
          >
            <div className="text-xs opacity-80">{it.label}</div>
            <div className="text-2xl font-bold leading-tight">{it.count}</div>
          </button>
        ))}
      </div>

      {/* Resumen rápido */}
      <div className="mt-4 text-sm text-theme-secondary">
        <span className="mr-4">Alerta (48–72 h): <span className="text-yellow-300 font-semibold">{analysisResult.ageBucketsCount['48-72h'] || 0}</span></span>
        <span>Alarma (&gt;72 h): <span className="text-red-300 font-semibold">{analysisResult.ageBucketsCount['>72h'] || 0}</span></span>
        {totalAlerts > 0 && (
          <span className="ml-4">Total alertas: <span className="text-primary-color font-semibold">{totalAlerts}</span></span>
        )}
      </div>
    </div>
  );
};

export default MovementAgeAlertsPanel;
