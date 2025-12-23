import React, { useState } from 'react';
import { FaChartLine, FaRegStickyNote, FaEdit, FaSave, FaTimes, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { formatCurrency, formatDate } from '../../components/campaign-control/utils/formatters';
import { DailySummary as DailySummaryType } from '../../types/campaign-control';

interface DailySummaryProps {
  summary: DailySummaryType;
  onGenerateSummary?: () => Promise<void>;
  onSaveAdjustments?: (adjustments: {
    adjusted_units: number;
    adjusted_revenue: number;
    notes?: string;
  }) => Promise<void>;
}

const DailySummary: React.FC<DailySummaryProps> = ({ summary, onGenerateSummary, onSaveAdjustments }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [adjustedUnits, setAdjustedUnits] = useState<number>(summary.adjusted_units || summary.total_units);
  const [adjustedRevenue, setAdjustedRevenue] = useState<number>(summary.adjusted_revenue || summary.total_revenue);
  const [notes, setNotes] = useState<string>(summary.notes || '');

  const calculatedCPA = summary.total_units > 0
    ? summary.total_spend / summary.total_units
    : 0;

  const calculatedCPAPercent = summary.total_revenue > 0
    ? (summary.total_spend / summary.total_revenue) * 100
    : 0;

  const adjustedCPA = adjustedUnits > 0
    ? summary.total_spend / adjustedUnits
    : 0;

  const adjustedROAS = summary.total_spend > 0
    ? adjustedRevenue / summary.total_spend
    : 0;

  const handleSaveAdjustments = async () => {
    if (onSaveAdjustments) {
      await onSaveAdjustments({
        adjusted_units: adjustedUnits,
        adjusted_revenue: adjustedRevenue,
        notes
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setAdjustedUnits(summary.adjusted_units || summary.total_units);
    setAdjustedRevenue(summary.adjusted_revenue || summary.total_revenue);
    setNotes(summary.notes || '');
    setIsEditing(false);
  };

  const unitsDiff = adjustedUnits - summary.total_units;
  const revenueDiff = adjustedRevenue - summary.total_revenue;
  const cpaDiff = calculatedCPA - adjustedCPA;

  return (
    <div className="soft-card p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <FaChartLine className="mr-2 text-primary-color" />
          Resumen Diario
        </h2>

        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveAdjustments}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center"
              >
                <FaSave className="mr-1" />
                Guardar
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm flex items-center"
              >
                <FaTimes className="mr-1" />
                Cancelar
              </button>
            </>
          ) : (
            <>
              {onGenerateSummary && (
                <button
                  onClick={() => onGenerateSummary()}
                  className="bg-primary-color hover:opacity-90 text-black px-4 py-2 rounded-xl text-sm font-bold flex items-center transition-all btn-modern shadow-lg shadow-primary-color/20"
                >
                  <FaChartLine className="mr-2" />
                  Generar
                </button>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white/5 hover:bg-white/10 text-theme-primary px-4 py-2 rounded-xl text-sm font-medium flex items-center transition-all border border-white/10"
              >
                <FaEdit className="mr-2 text-primary-color" />
                Ajustar
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
          <div className="text-xs font-bold text-theme-tertiary uppercase tracking-wider mb-2">Presupuesto Total</div>
          <div className="text-2xl font-bold text-theme-primary">{formatCurrency(summary.total_budget)}</div>
        </div>

        <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
          <div className="text-xs font-bold text-theme-tertiary uppercase tracking-wider mb-2">Total Unidades</div>
          <div className="text-2xl font-bold text-green-500">
            {summary.adjusted_units ? summary.adjusted_units : summary.total_units}
          </div>
          {summary.adjusted_units && (
            <div className="mt-1 flex items-center text-xs">
              <span className="text-theme-tertiary">Calc:</span>
              <span className="ml-2 text-theme-secondary">{summary.total_units}</span>
              {unitsDiff > 0 && <FaArrowDown className="ml-1 text-red-500" />}
              {unitsDiff < 0 && <FaArrowUp className="ml-1 text-green-500" />}
            </div>
          )}
          {isEditing && (
            <div className="mt-3">
              <input
                type="number"
                value={adjustedUnits}
                onChange={(e) => setAdjustedUnits(Number(e.target.value))}
                className="w-full bg-theme-primary/50 border border-white/10 rounded-lg px-3 py-2 text-theme-primary text-sm focus:border-primary-color outline-none"
              />
            </div>
          )}
        </div>

        <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
          <div className="text-xs font-bold text-theme-tertiary uppercase tracking-wider mb-2">Total Ingresos</div>
          <div className="text-2xl font-bold text-green-500">
            {formatCurrency(summary.adjusted_revenue || summary.total_revenue)}
          </div>
          {summary.adjusted_revenue && (
            <div className="mt-1 flex items-center text-xs">
              <span className="text-theme-tertiary">Calc:</span>
              <span className="ml-2 text-theme-secondary">{formatCurrency(summary.total_revenue)}</span>
              {revenueDiff > 0 && <FaArrowUp className="ml-1 text-green-500" />}
              {revenueDiff < 0 && <FaArrowDown className="ml-1 text-red-500" />}
            </div>
          )}
          {isEditing && (
            <div className="mt-3">
              <input
                type="number"
                value={adjustedRevenue}
                onChange={(e) => setAdjustedRevenue(Number(e.target.value))}
                className="w-full bg-theme-primary/50 border border-white/10 rounded-lg px-3 py-2 text-theme-primary text-sm focus:border-primary-color outline-none"
              />
            </div>
          )}
        </div>

        <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
          <div className="text-xs font-bold text-theme-tertiary uppercase tracking-wider mb-2">Gasto Total</div>
          <div className="text-2xl font-bold text-blue-500">{formatCurrency(summary.total_spend)}</div>
        </div>

        <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
          <div className="text-xs font-bold text-theme-tertiary uppercase tracking-wider mb-2">CPA</div>
          <div className="text-2xl font-bold text-purple-400">
            {formatCurrency(summary.adjusted_cpa || calculatedCPA)}
          </div>
          {summary.adjusted_cpa && (
            <div className="mt-1 flex items-center text-xs">
              <span className="text-theme-tertiary">Calc:</span>
              <span className="ml-2 text-theme-secondary">{formatCurrency(calculatedCPA)}</span>
              {cpaDiff > 0 && <FaArrowDown className="ml-1 text-green-500" />}
              {cpaDiff < 0 && <FaArrowUp className="ml-1 text-red-500" />}
            </div>
          )}
          {isEditing && (
            <div className="mt-3 text-xs">
              <div className="text-theme-tertiary mb-1">CPA Proyectado:</div>
              <div className="text-sm font-bold text-primary-color">{formatCurrency(adjustedCPA)}</div>
            </div>
          )}
        </div>

        <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
          <div className="text-xs font-bold text-theme-tertiary uppercase tracking-wider mb-2">ROAS</div>
          <div className="text-2xl font-bold text-yellow-500">
            {summary.adjusted_roas
              ? `${summary.adjusted_roas.toFixed(2)}x`
              : (summary.total_spend > 0
                ? `${(summary.total_revenue / summary.total_spend).toFixed(2)}x`
                : '0x')}
          </div>
          {summary.adjusted_roas && (
            <div className="mt-1 flex items-center text-xs">
              <span className="text-theme-tertiary">Calc:</span>
              <span className="ml-2 text-theme-secondary">
                {summary.total_spend > 0
                  ? `${(summary.total_revenue / summary.total_spend).toFixed(2)}x`
                  : '0x'}
              </span>
            </div>
          )}
          {isEditing && (
            <div className="mt-3 text-xs">
              <div className="text-theme-tertiary mb-1">ROAS Proyectado:</div>
              <div className="text-sm font-bold text-primary-color">{`${adjustedROAS.toFixed(2)}x`}</div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className="p-2 bg-primary-color/10 rounded-lg mr-3">
              <FaRegStickyNote className="text-primary-color" />
            </div>
            <div className="font-bold text-theme-primary text-sm uppercase tracking-wider">Notas del día</div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-primary-color"
            >
              <FaEdit />
            </button>
          )}
        </div>
        {isEditing ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-theme-primary/50 border border-white/10 rounded-xl px-4 py-3 text-theme-primary text-sm outline-none focus:border-primary-color transition-all resize-none"
            rows={3}
            placeholder="Añade notas sobre los ajustes realizados..."
          />
        ) : (
          <div className="text-theme-secondary text-sm leading-relaxed p-1">
            {summary.notes || 'No hay notas registradas para este día.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailySummary;
