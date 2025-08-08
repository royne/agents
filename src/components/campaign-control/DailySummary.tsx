import React from 'react';
import { FaChartLine, FaRegStickyNote, FaEdit } from 'react-icons/fa';
import { formatCurrency, formatDate } from '../../components/campaign-control/utils/formatters';
import { DailySummary as DailySummaryType } from '../../types/campaign-control';

interface DailySummaryProps {
  summary: DailySummaryType;
  onGenerateSummary?: () => Promise<void>;
}

const DailySummary: React.FC<DailySummaryProps> = ({ summary, onGenerateSummary }) => {
  console.log('summary', summary);
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <FaChartLine className="mr-2 text-primary-color" />
          Resumen Diario
        </h2>
        
        {onGenerateSummary && (
          <button 
            onClick={() => onGenerateSummary()}
            className="bg-primary-color hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm flex items-center"
          >
            <FaChartLine className="mr-1" />
            Generar Resumen
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Presupuesto Total</div>
          <div className="text-2xl font-bold">{formatCurrency(summary.total_budget)}</div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Total Unidades</div>
          <div className="text-2xl font-bold text-green-500">{summary.total_units}</div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Total Ingresos</div>
          <div className="text-2xl font-bold text-green-500">{formatCurrency(summary.total_revenue)}</div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Gasto Total</div>
          <div className="text-2xl font-bold text-blue-500">{formatCurrency(summary.total_spend)}</div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-400">CPA</div>
          <div className="text-2xl font-bold text-purple-500">
            {summary.total_units > 0 
              ? formatCurrency(summary.total_spend / summary.total_units) 
              : '$0'}
          </div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-400">% CPA</div>
          <div className="text-2xl font-bold text-yellow-500">
            {summary.total_revenue > 0 
              ? `${((summary.total_spend / summary.total_revenue) * 100).toFixed(1)}%` 
              : '0%'}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-700 p-4 rounded-lg">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <FaRegStickyNote className="text-primary-color mr-2" />
            <div className="font-medium">Notas del día:</div>
          </div>
          <button className="text-primary-color hover:text-blue-400">
            <FaEdit />
          </button>
        </div>
        <div className="mt-2 text-sm">
          {summary.notes}
        </div>
      </div>
    </div>
  );
};

export default DailySummary;
