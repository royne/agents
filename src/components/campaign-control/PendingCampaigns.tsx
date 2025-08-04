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
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FaEdit className="mr-2 text-yellow-500" />
        Pendientes de Registrar ({pendingCampaigns.length})
      </h2>
    
      <div>
        {pendingCampaigns.length > 0 ? (
          <div className="space-y-3">
            {pendingCampaigns.map(campaign => (
              <div key={campaign.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="mr-2">{getStatusIcon(campaign.dailyData.status)}</div>
                    <div>
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-xs text-gray-400">
                        {campaign.platform || 'N/A'} | {formatCurrency(campaign.dailyData.budget)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="inline-flex items-center text-sm px-2 py-1 rounded-full" 
                          style={{ backgroundColor: `rgba(${getStatusColor(campaign.dailyData.status)}, 0.2)` }}>
                      {getStatusText(campaign.dailyData.status)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <Link href={`/campaign-control/${campaign.id}/daily-view`} 
                        className="text-primary-color hover:text-blue-400 inline-flex items-center text-sm">
                    <span className="mr-1">Registrar</span>
                    <FaExternalLinkAlt className="text-xs" />
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
