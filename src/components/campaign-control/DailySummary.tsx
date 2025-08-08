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
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
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
                  className="bg-primary-color hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm flex items-center"
                >
                  <FaChartLine className="mr-1" />
                  Generar Resumen
                </button>
              )}
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm flex items-center"
              >
                <FaEdit className="mr-1" />
                Ajustar
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Presupuesto Total</div>
          <div className="text-2xl font-bold">{formatCurrency(summary.total_budget)}</div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-400">
            Total Unidades
          </div>
          
          {/* Mostrar el valor ajustado como principal si existe */}
          <div className="text-2xl font-bold text-green-500">
            {summary.adjusted_units ? summary.adjusted_units : summary.total_units}
          </div>
          
          {/* Mostrar el valor calculado como referencia si hay un valor ajustado */}
          {summary.adjusted_units && (
            <div className="mt-1 flex items-center">
              <span className="text-xs text-gray-400">Calculado:</span>
              <span className="ml-2 text-xs text-gray-300">{summary.total_units}</span>
              {unitsDiff > 0 && <FaArrowDown className="ml-1 text-red-500 text-xs" />}
              {unitsDiff < 0 && <FaArrowUp className="ml-1 text-green-500 text-xs" />}
            </div>
          )}
          
          {/* Campo de edición */}
          {isEditing && (
            <div className="mt-2">
              <div className="text-sm text-blue-400">Ajustar unidades:</div>
              <input
                type="number"
                value={adjustedUnits}
                onChange={(e) => setAdjustedUnits(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
              />
            </div>
          )}
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-400">
            Total Ingresos
          </div>
          
          {/* Mostrar el valor ajustado como principal si existe */}
          <div className="text-2xl font-bold text-green-500">
            {formatCurrency(summary.adjusted_revenue || summary.total_revenue)}
          </div>
          
          {/* Mostrar el valor calculado como referencia si hay un valor ajustado */}
          {summary.adjusted_revenue && (
            <div className="mt-1 flex items-center">
              <span className="text-xs text-gray-400">Calculado:</span>
              <span className="ml-2 text-xs text-gray-300">{formatCurrency(summary.total_revenue)}</span>
              {revenueDiff > 0 && <FaArrowUp className="ml-1 text-green-500 text-xs" />}
              {revenueDiff < 0 && <FaArrowDown className="ml-1 text-red-500 text-xs" />}
            </div>
          )}
          
          {/* Campo de edición */}
          {isEditing && (
            <div className="mt-2">
              <div className="text-sm text-blue-400">Ajustar ingresos:</div>
              <input
                type="number"
                value={adjustedRevenue}
                onChange={(e) => setAdjustedRevenue(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
              />
            </div>
          )}
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Gasto Total</div>
          <div className="text-2xl font-bold text-blue-500">{formatCurrency(summary.total_spend)}</div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-400">
            CPA
          </div>
          
          {/* Mostrar el valor ajustado como principal si existe */}
          <div className="text-2xl font-bold text-purple-500">
            {formatCurrency(summary.adjusted_cpa || calculatedCPA)}
          </div>
          
          {/* Mostrar el valor calculado como referencia si hay un valor ajustado */}
          {summary.adjusted_cpa && (
            <div className="mt-1 flex items-center">
              <span className="text-xs text-gray-400">Calculado:</span>
              <span className="ml-2 text-xs text-gray-300">{formatCurrency(calculatedCPA)}</span>
              {cpaDiff > 0 && <FaArrowDown className="ml-1 text-green-500 text-xs" />}
              {cpaDiff < 0 && <FaArrowUp className="ml-1 text-red-500 text-xs" />}
            </div>
          )}
          
          {/* En modo edición, mostrar el CPA ajustado calculado en tiempo real */}
          {isEditing && (
            <div className="mt-2">
              <div className="text-sm text-blue-400">CPA con ajustes:</div>
              <div className="text-lg font-bold text-blue-400">
                {formatCurrency(adjustedCPA)}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-400">
            ROAS
          </div>
          
          {/* Mostrar el valor ajustado como principal si existe */}
          <div className="text-2xl font-bold text-yellow-500">
            {summary.adjusted_roas 
              ? `${summary.adjusted_roas.toFixed(2)}x` 
              : (summary.total_spend > 0 
                ? `${(summary.total_revenue / summary.total_spend).toFixed(2)}x` 
                : '0x')}
          </div>
          
          {/* Mostrar el valor calculado como referencia si hay un valor ajustado */}
          {summary.adjusted_roas && (
            <div className="mt-1 flex items-center">
              <span className="text-xs text-gray-400">Calculado:</span>
              <span className="ml-2 text-xs text-gray-300">
                {summary.total_spend > 0 
                  ? `${(summary.total_revenue / summary.total_spend).toFixed(2)}x` 
                  : '0x'}
              </span>
            </div>
          )}
          
          {/* En modo edición, mostrar el ROAS ajustado calculado en tiempo real */}
          {isEditing && (
            <div className="mt-2">
              <div className="text-sm text-blue-400">ROAS con ajustes:</div>
              <div className="text-lg font-bold text-blue-400">
                {`${adjustedROAS.toFixed(2)}x`}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-700 p-4 rounded-lg">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <FaRegStickyNote className="text-primary-color mr-2" />
            <div className="font-medium">Notas del día:</div>
          </div>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-primary-color hover:text-blue-400"
            >
              <FaEdit />
            </button>
          )}
        </div>
        {isEditing ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white mt-2"
            rows={3}
            placeholder="Añade notas sobre los ajustes realizados..."
          />
        ) : (
          <div className="mt-2 text-sm">
            {summary.notes || 'No hay notas para este día.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailySummary;
