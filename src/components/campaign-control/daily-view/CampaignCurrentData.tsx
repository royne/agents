import React from 'react';
import { FaChartLine } from 'react-icons/fa';
import { CampaignDailyRecord, CampaignBudgetChange } from '../../../types/campaign-control';
import { formatCurrency } from '../../../utils/formatters';

interface CampaignCurrentDataProps {
  dailyRecord: CampaignDailyRecord;
  lastBudgetChange?: CampaignBudgetChange;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getChangeTypeColor: (changeType: string) => string;
  getChangeTypeIcon: (changeType: string) => React.ReactNode;
}

const CampaignCurrentData: React.FC<CampaignCurrentDataProps> = ({
  dailyRecord,
  lastBudgetChange,
  getStatusColor,
  getStatusText,
  getChangeTypeColor,
  getChangeTypeIcon
}) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <FaChartLine className="mr-2 text-primary-color" />
          Datos Actuales
        </div>
        <span className={`px-2 py-0.5 text-xs rounded-full flex items-center ${
          getStatusColor(dailyRecord.status) === 'bg-green-500' ? 'bg-green-500/20 text-green-400' : 
          getStatusColor(dailyRecord.status) === 'bg-yellow-500' ? 'bg-yellow-500/20 text-yellow-400' :
          getStatusColor(dailyRecord.status) === 'bg-orange-500' ? 'bg-orange-500/20 text-orange-400' :
          'bg-blue-500/20 text-blue-400'
        }`}>
          <span className={`${getStatusColor(dailyRecord.status)} w-2 h-2 rounded-full mr-1`}></span>
          {getStatusText(dailyRecord.status)}
        </span>
      </h2>
      
      <div className="bg-gray-700 p-4 rounded-lg mb-4">
        <div className="text-sm text-gray-400">Presupuesto Inicial del Día</div>
        <div className="text-2xl font-bold">{formatCurrency(dailyRecord.budget)}</div>
      </div>
      
      {/* Último cambio de la bitácora */}
      {lastBudgetChange && (
        <div className="bg-gray-750 p-4 rounded-lg border-l-4 border-primary-color mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className={`text-lg mr-2 ${getChangeTypeColor(lastBudgetChange.changeType)}`}>
                {getChangeTypeIcon(lastBudgetChange.changeType)}
              </span>
              <span className="font-medium">
                {lastBudgetChange.changeType === 'increase' ? 'Aumento de Presupuesto' :
                 lastBudgetChange.changeType === 'decrease' ? 'Reducción de Presupuesto' :
                 lastBudgetChange.changeType === 'pause' ? 'Campaña Pausada' : 'Campaña Reactivada'}
              </span>
            </div>
            <div className="text-xs bg-gray-700 px-2 py-1 rounded-full">
              {new Date(lastBudgetChange.date).toLocaleDateString()} - {new Date(lastBudgetChange.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
          
          {lastBudgetChange.changeType !== 'pause' && lastBudgetChange.changeType !== 'resume' && (
            <div className="flex items-center justify-between bg-gray-700 p-2 rounded-lg mb-2">
              <div className="text-sm">
                <span className="text-gray-400 mr-2">Anterior:</span>
                <span className="font-medium">{formatCurrency(lastBudgetChange.previousBudget)}</span>
              </div>
              <div className="text-lg font-bold">→</div>
              <div className="text-sm">
                <span className="text-gray-400 mr-2">Nuevo:</span>
                <span className={`font-medium ${lastBudgetChange.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(lastBudgetChange.newBudget)}
                </span>
              </div>
            </div>
          )}
          
          <div className="text-sm">
            <span className="text-gray-400">Razón: </span>
            <span>{lastBudgetChange.reason}</span>
          </div>
          
          <div className="mt-2 text-xs text-primary-color flex items-center">
            <span className="bg-primary-color/20 px-2 py-0.5 rounded-full">Último cambio</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignCurrentData;
