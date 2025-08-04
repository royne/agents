import React from 'react';
import Link from 'next/link';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { CampaignWithDailyData } from '../../types/campaign-control';
import { getStatusIcon } from '../../components/campaign-control/StatusIndicators';
import { formatCurrency } from '../../components/campaign-control/utils/formatters';

interface CampaignCardProps {
  campaign: CampaignWithDailyData;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  return (
    <div className="bg-gray-700 rounded-lg p-4 flex flex-col">
      <div className="flex justify-between items-start">
        <h3 className="font-medium truncate flex-grow">{campaign.name}</h3>
        <div className="ml-2 flex items-center">
          {getStatusIcon(campaign.dailyData.status)}
        </div>
      </div>
      
      <div className="text-xs text-gray-400 mt-1">
        {campaign.platform || 'N/A'} | Ppto: {formatCurrency(campaign.dailyData.budget)}
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div>
          <div className="text-xs text-gray-400">Unidades Vendidas</div>
          <div>{campaign.dailyData.units || 0}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Ingresos Día Anterior</div>
          <div>{campaign.dailyData.revenue ? formatCurrency(campaign.dailyData.revenue) : '$0'}</div>
        </div>
      </div>
      
      {campaign.needsUpdate && (
        <div className="mt-2 bg-yellow-900/20 text-yellow-500 text-xs p-2 rounded">
          Pendiente de actualizar
        </div>
      )}
      
      <div className="flex justify-end mt-3">
        <Link href={`/campaign-control/${campaign.id}/daily-view`} className="text-primary-color hover:text-blue-400 flex items-center text-sm">
          Ver detalles
          <FaExternalLinkAlt className="ml-1 text-xs" />
        </Link>
      </div>
    </div>
  );
};

export default CampaignCard;
