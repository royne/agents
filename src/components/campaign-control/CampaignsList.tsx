import React from 'react';
import { FaMoneyBillWave } from 'react-icons/fa';
import { CampaignWithDailyData } from '../../types/campaign-control';
import CampaignCard from './CampaignCard';

interface CampaignsListProps {
  campaigns: CampaignWithDailyData[];
}

const CampaignsList: React.FC<CampaignsListProps> = ({ campaigns }) => {
  console.log('campaigns', campaigns);
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FaMoneyBillWave className="mr-2 text-primary-color" />
        Todas las Campañas ({campaigns.length})
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.length > 0 ? campaigns.map(campaign => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        )) : (
          <div className="col-span-3 text-center py-10 text-gray-400">
            No hay campañas para mostrar
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignsList;
