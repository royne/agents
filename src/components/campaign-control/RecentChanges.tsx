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
    <div className="soft-card p-8">
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <div className="p-2 bg-primary-color/10 rounded-lg mr-3">
          <FaBell className="text-primary-color" />
        </div>
        Últimos Cambios
      </h2>

      {latestChanges.length > 0 ? (
        <div className="space-y-3">
          {latestChanges.map(change => (
            <div key={change.id} className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4 mt-1">
                  {getChangeTypeIcon(change.change_type)}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between mb-1">
                    <div>
                      <span className="font-bold text-theme-primary">{change.campaignName}</span>
                      <p className="text-xs text-theme-tertiary mt-0.5">
                        {change.change_type === 'increase' ? 'Aumento de presupuesto' :
                          change.change_type === 'decrease' ? 'Reducción de presupuesto' :
                            change.change_type === 'pause' ? 'Campaña pausada' : 'Campaña reactivada'}
                      </p>
                    </div>
                    <div className="text-[10px] uppercase font-bold text-theme-tertiary tracking-widest mt-1">
                      {formatTime(change.date)}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-theme-secondary leading-relaxed bg-black/20 p-2 rounded-lg italic">
                    "{change.reason}"
                  </div>
                  {(change.change_type === 'increase' || change.change_type === 'decrease') && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-theme-tertiary px-2 py-0.5 bg-white/5 rounded border border-white/5">{formatCurrency(change.previous_budget)}</span>
                      <span className="text-theme-tertiary">→</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${change.change_type === 'increase' ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'}`}>
                        {formatCurrency(change.new_budget)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Link href={`/campaign-control/${change.campaign_id}/daily-view`} className="text-primary-color hover:underline flex items-center text-xs font-bold uppercase tracking-wider">
                  Detalles
                  <FaExternalLinkAlt className="ml-1.5 text-[10px]" />
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
