import React from 'react';
import { FaHistory } from 'react-icons/fa';
import { CampaignBudgetChange } from '../../../types/campaign-control';
import { formatCurrency } from '../../../utils/formatters';

interface CampaignBudgetHistoryProps {
  budgetChanges: CampaignBudgetChange[];
  getChangeTypeColor: (changeType: string) => string;
  getChangeTypeIcon: (changeType: string) => React.ReactNode;
  title?: string;
}

const CampaignBudgetHistory: React.FC<CampaignBudgetHistoryProps> = ({
  budgetChanges,
  getChangeTypeColor,
  getChangeTypeIcon,
  title = "Bitácora de Cambios de Presupuesto"
}) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FaHistory className="mr-2 text-primary-color" />
        {title}
      </h2>
      
      {budgetChanges.length > 0 ? (
        <div className="w-full overflow-x-auto">
          <table className="w-full table-auto bg-gray-700 rounded-lg">
            <thead className="bg-gray-800">
              <tr>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tipo</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Cambio</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Razón</th>
              </tr>
            </thead>
            <tbody>
              {budgetChanges.map((change, index) => (
                <tr key={change.id} className={index % 2 === 0 ? 'bg-gray-750' : 'bg-gray-700'}>
                  <td className="py-2 px-4 text-sm">
                    <div>{new Date(change.date).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-400">{new Date(change.date).toLocaleTimeString()}</div>
                  </td>
                  <td className="py-2 px-4">
                    <span className="inline-flex items-center">
                      <span className={`text-lg mr-2 ${getChangeTypeColor(change.changeType)}`}>
                        {getChangeTypeIcon(change.changeType)}
                      </span>
                      <span>
                        {change.changeType === 'increase' ? 'Aumento' :
                         change.changeType === 'decrease' ? 'Reducción' :
                         change.changeType === 'pause' ? 'Pausa' : 'Reactivación'}
                      </span>
                    </span>
                  </td>
                  <td className="py-2 px-4 text-sm">
                    {change.changeType !== 'pause' && change.changeType !== 'resume' ? (
                      <span>
                        {formatCurrency(change.previousBudget)} → {formatCurrency(change.newBudget)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-sm">{change.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          No hay cambios de presupuesto registrados para esta campaña
        </div>
      )}
    </div>
  );
};

export default CampaignBudgetHistory;
