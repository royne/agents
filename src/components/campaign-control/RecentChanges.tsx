import React from 'react';
import { FaBell, FaExternalLinkAlt } from 'react-icons/fa';
import Link from 'next/link';
import { CampaignBudgetChange } from '../../types/campaign-control';
import { formatCurrency, formatTime } from '../../components/campaign-control/utils/formatters';
import { getChangeTypeIcon } from '../../components/campaign-control/StatusIndicators';

interface RecentChangesProps {
  changes: CampaignBudgetChange[];
}

const RecentChanges: React.FC<RecentChangesProps> = ({ changes }) => {
  
  const latestChangesByCampaign = changes.reduce((acc: Record<string, CampaignBudgetChange>, change) => {
    if (!acc[change.campaign_id] || new Date(change.date) > new Date(acc[change.campaign_id].date)) {
      acc[change.campaign_id] = change;
    }
    return acc;
  }, {});
  
  const latestChanges = Object.values(latestChangesByCampaign).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FaBell className="mr-2 text-primary-color" />
        Últimos Cambios y Notificaciones
      </h2>
      
      {latestChanges.length > 0 ? (
        <div className="space-y-3">
          {latestChanges.map(change => (
            <div key={change.id} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3 mt-1">
                  {getChangeTypeIcon(change.change_type)}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <div>
                      <span className="font-medium">{change.campaignName}</span>
                      <span className="text-sm text-gray-400 ml-2">
                        {change.change_type === 'increase' ? 'Aumento de presupuesto' :
                        change.change_type === 'decrease' ? 'Reducción de presupuesto' :
                        change.change_type === 'pause' ? 'Campaña pausada' : 'Campaña reactivada'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatTime(change.date)}
                    </div>
                  </div>
                  <div className="mt-1 text-sm">{change.reason}</div>
                  {(change.change_type === 'increase' || change.change_type === 'decrease') && (
                    <div className="mt-1 text-sm">
                      <span className="text-gray-400">{formatCurrency(change.previous_budget)}</span>
                      <span className="mx-2">→</span>
                      <span className={change.change_type === 'increase' ? 'text-green-400' : 'text-yellow-400'}>
                        {formatCurrency(change.new_budget)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <Link href={`/campaign-control/${change.campaign_id}/daily-view`} className="text-primary-color hover:text-blue-400 flex items-center text-xs">
                  Ver detalles
                  <FaExternalLinkAlt className="ml-1 text-xs" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400">
          No hay cambios recientes para mostrar
        </div>
      )}
    </div>
  );
};

export default RecentChanges;
