import React from 'react';
import { FaEdit, FaExternalLinkAlt } from 'react-icons/fa';
import Link from 'next/link';
import { CampaignWithDailyData } from '../../types/campaign-control';
import { getStatusIcon, getStatusText, getStatusColor } from '../../components/campaign-control/StatusIndicators';
import { formatCurrency } from '../../components/campaign-control/utils/formatters';

interface PendingCampaignsProps {
  campaigns: CampaignWithDailyData[];
}

const PendingCampaigns: React.FC<PendingCampaignsProps> = ({ campaigns }) => {
  // Filtrar campañas que necesitan actualización
  const pendingCampaigns = campaigns.filter(campaign => campaign.needsUpdate);

  return (
    <div className="soft-card p-8">
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <div className="p-2 bg-yellow-500/10 rounded-lg mr-3">
          <FaEdit className="text-yellow-500" />
        </div>
        Pendientes ({pendingCampaigns.length})
      </h2>

      <div>
        {pendingCampaigns.length > 0 ? (
          <div className="space-y-3">
            {pendingCampaigns.map(campaign => (
              <div key={campaign.id} className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-2 bg-theme-primary/5 rounded-lg mr-4">
                      {getStatusIcon(campaign.dailyData.status)}
                    </div>
                    <div>
                      <div className="font-bold text-theme-primary">{campaign.name}</div>
                      <div className="text-xs text-theme-tertiary mt-1 font-medium italic">
                        {campaign.platform || 'N/A'} | {formatCurrency(campaign.dailyData.budget)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-white/10 border border-white/10 text-theme-secondary">
                      {getStatusText(campaign.dailyData.status)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end mt-5">
                  <Link href={`/campaign-control/${campaign.id}/daily-view`}
                    className="bg-primary-color/10 hover:bg-primary-color/20 text-primary-color px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-primary-color/20 flex items-center gap-2">
                    Registrar
                    <FaExternalLinkAlt className="text-[10px]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            No hay campañas pendientes de actualizar
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingCampaigns;
