import React from 'react';
import { FaFilter, FaBroom } from 'react-icons/fa';
import { MovementAgeBucket, MovementAgeSeverity } from '../../../services/data-analysis/OrdersMovementService';

export interface OrdersFiltersValue {
  status: string;
  carrier: string;
  region: string;
  query: string;
  age?: '' | MovementAgeBucket;
  severity?: '' | MovementAgeSeverity;
}

interface MovementOrdersFiltersProps {
  availableStatuses: string[];
  availableCarriers: string[];
  availableRegions: string[];
  availableAgeBuckets: MovementAgeBucket[];
  availableSeverities: MovementAgeSeverity[];
  value: OrdersFiltersValue;
  onChange: (value: OrdersFiltersValue) => void;
  totalCount: number;
  filteredCount: number;
  onClear: () => void;
  statusesCount: Record<string, number>;
  carriersCount: Record<string, number>;
  regionsCount: Record<string, number>;
  ageCounts: Record<MovementAgeBucket, number>;
  severityCounts: Record<MovementAgeSeverity, number>;
}

const MovementOrdersFilters: React.FC<MovementOrdersFiltersProps> = ({
  availableStatuses,
  availableCarriers,
  availableRegions,
  availableAgeBuckets,
  availableSeverities,
  value,
  onChange,
  totalCount,
  filteredCount,
  onClear,
  statusesCount,
  carriersCount,
  regionsCount,
  ageCounts,
  severityCounts,
}) => {
  const handleChange = (patch: Partial<OrdersFiltersValue>) => {
    onChange({ ...value, ...patch });
  };

  const bucketLabel = (b: MovementAgeBucket) => {
    switch (b) {
      case '<12h': return '<12 h';
      case '12-24h': return '12–24 h';
      case '24-48h': return '24–48 h';
      case '48-72h': return '48–72 h';
      case '>72h': return '> 72 h';
      default: return 'Sin último mov.';
    }
  };

  const severityLabel = (s: MovementAgeSeverity) => {
    switch (s) {
      case 'danger': return 'Rojo (Alarma)';
      case 'warn': return 'Amarillo (Alerta)';
      case 'normal': return 'Verde (OK)';
      default: return 'Gris (Sin último mov.)';
    }
  };

  return (
    <div className="bg-theme-component p-4 rounded-lg shadow mb-4 border border-theme-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2"><FaFilter /> Filtros</h3>
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className="text-theme-secondary mr-1">Resultados:</span>
            <span className="font-semibold">{filteredCount}</span>
            <span className="text-theme-secondary"> / {totalCount}</span>
          </div>
          <button
            className="text-sm px-3 py-1 border border-theme-border rounded hover:bg-theme-component-hover flex items-center gap-2"
            onClick={onClear}
          >
            <FaBroom /> Limpiar
          </button>
        </div>
      </div>
      {/* KPIs de opciones disponibles */}
      <div className="grid grid-cols-3 gap-4 mb-3 text-xs">
        <div className="bg-theme-primary rounded p-2 text-center">
          <div className="text-theme-secondary">Estados únicos</div>
          <div className="font-semibold">{availableStatuses.length}</div>
        </div>
        <div className="bg-theme-primary rounded p-2 text-center">
          <div className="text-theme-secondary">Transportadoras</div>
          <div className="font-semibold">{availableCarriers.length}</div>
        </div>
        <div className="bg-theme-primary rounded p-2 text-center">
          <div className="text-theme-secondary">Regiones</div>
          <div className="font-semibold">{availableRegions.length}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm text-theme-secondary mb-1">Estado</label>
          <select
            className="w-full bg-theme-component border border-theme-border rounded px-3 py-2"
            value={value.status}
            onChange={(e) => handleChange({ status: e.target.value })}
          >
            <option value="">Todos</option>
            {availableStatuses.map((s) => (
              <option key={s} value={s}>{s} {typeof statusesCount[s] === 'number' ? `(${statusesCount[s]})` : ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-theme-secondary mb-1">Transportadora</label>
          <select
            className="w-full bg-theme-component border border-theme-border rounded px-3 py-2"
            value={value.carrier}
            onChange={(e) => handleChange({ carrier: e.target.value })}
          >
            <option value="">Todas</option>
            {availableCarriers.map((c) => (
              <option key={c} value={c}>{c} {typeof carriersCount[c] === 'number' ? `(${carriersCount[c]})` : ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-theme-secondary mb-1">Región</label>
          <select
            className="w-full bg-theme-component border border-theme-border rounded px-3 py-2"
            value={value.region}
            onChange={(e) => handleChange({ region: e.target.value })}
          >
            <option value="">Todas</option>
            {availableRegions.map((r) => (
              <option key={r} value={r}>{r} {typeof regionsCount[r] === 'number' ? `(${regionsCount[r]})` : ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-theme-secondary mb-1">Antigüedad</label>
          <select
            className="w-full bg-theme-component border border-theme-border rounded px-3 py-2"
            value={value.age || ''}
            onChange={(e) => handleChange({ age: (e.target.value || '') as '' | MovementAgeBucket })}
          >
            <option value="">Todas</option>
            {availableAgeBuckets.map((b) => (
              <option key={b} value={b}>{bucketLabel(b)}{ageCounts[b] !== undefined ? ` (${ageCounts[b]})` : ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-theme-secondary mb-1">Semáforo</label>
          <select
            className="w-full bg-theme-component border border-theme-border rounded px-3 py-2"
            value={value.severity || ''}
            onChange={(e) => handleChange({ severity: (e.target.value || '') as '' | MovementAgeSeverity })}
          >
            <option value="">Todos</option>
            {availableSeverities.map((s) => (
              <option key={s} value={s}>{severityLabel(s)}{typeof severityCounts[s] === 'number' ? ` (${severityCounts[s]})` : ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-theme-secondary mb-1">Buscar (ID o Cliente)</label>
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full bg-theme-component border border-theme-border rounded px-3 py-2"
            value={value.query}
            onChange={(e) => handleChange({ query: e.target.value })}
          />
        </div>
      </div>

      {/* Chips de filtros activos */}
      {(value.status || value.carrier || value.region || value.query || value.age || value.severity) && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {value.status && (
            <span className="px-2 py-1 rounded-full border border-theme-border bg-theme-primary/40">Estado: {value.status}</span>
          )}
          {value.carrier && (
            <span className="px-2 py-1 rounded-full border border-theme-border bg-theme-primary/40">Transportadora: {value.carrier}</span>
          )}
          {value.region && (
            <span className="px-2 py-1 rounded-full border border-theme-border bg-theme-primary/40">Región: {value.region}</span>
          )}
          {value.age && (
            <span className="px-2 py-1 rounded-full border border-theme-border bg-theme-primary/40">Antigüedad: {value.age}</span>
          )}
          {value.severity && (
            <span className="px-2 py-1 rounded-full border border-theme-border bg-theme-primary/40">Semáforo: {severityLabel(value.severity as MovementAgeSeverity)}</span>
          )}
          {value.query && (
            <span className="px-2 py-1 rounded-full border border-theme-border bg-theme-primary/40">Buscar: “{value.query}”</span>
          )}
        </div>
      )}
    </div>
  );
};

export default MovementOrdersFilters;
