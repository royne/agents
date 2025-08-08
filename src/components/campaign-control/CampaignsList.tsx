import React, { useMemo } from 'react';
import { FaMoneyBillWave, FaFacebook, FaAd } from 'react-icons/fa';
import { CampaignWithDailyData } from '../../types/campaign-control';
import CampaignCard from './CampaignCard';

interface CampaignsListProps {
  campaigns: CampaignWithDailyData[];
}

// Función para obtener el icono según la plataforma
const getPlatformIcon = (platform: string | undefined) => {
  if (!platform) return <FaAd className="text-gray-400" />;
  
  const platformLower = platform.toLowerCase();
  if (platformLower.includes('facebook') || platformLower.includes('meta') || platformLower.includes('fb')) {
    return <FaFacebook className="text-blue-500" />;
  }
  
  return <FaAd className="text-primary-color" />;
};

const CampaignsList: React.FC<CampaignsListProps> = ({ campaigns }) => {
  // Agrupar campañas por plataforma y cuenta publicitaria
  const groupedCampaigns = useMemo(() => {
    // Crear un mapa para agrupar
    const groups: Record<string, Record<string, CampaignWithDailyData[]>> = {};
    
    // Agrupar campañas por plataforma y cp
    campaigns.forEach(campaign => {
      const platform = campaign.platform || 'Sin plataforma';
      const cp = campaign.cp || 'Sin cuenta';
      
      // Inicializar la plataforma si no existe
      if (!groups[platform]) {
        groups[platform] = {};
      }
      
      // Inicializar la cuenta publicitaria si no existe
      if (!groups[platform][cp]) {
        groups[platform][cp] = [];
      }
      
      // Agregar la campaña al grupo correspondiente
      groups[platform][cp].push(campaign);
    });
    
    return groups;
  }, [campaigns]);
  
  // Obtener plataformas ordenadas alfabéticamente
  const platforms = useMemo(() => {
    return Object.keys(groupedCampaigns).sort();
  }, [groupedCampaigns]);
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FaMoneyBillWave className="mr-2 text-primary-color" />
        Todas las Campañas ({campaigns.length})
      </h2>
      
      {campaigns.length > 0 ? (
        <div className="space-y-8">
          {platforms.map(platform => {
            const accounts = Object.keys(groupedCampaigns[platform]).sort();
            
            return (
              <div key={platform} className="mb-6">
                <div className="flex items-center mb-3 pb-2 border-b border-gray-700">
                  <div className="mr-2">{getPlatformIcon(platform)}</div>
                  <h3 className="text-lg font-medium">{platform}</h3>
                  <span className="ml-2 text-sm text-gray-400">({Object.values(groupedCampaigns[platform]).flat().length})</span>
                </div>
                
                {accounts.map(account => (
                  <div key={`${platform}-${account}`} className="mb-4">
                    <div className="text-sm font-medium text-gray-300 mb-2 ml-2 flex items-center">
                      <span className="w-2 h-2 bg-primary-color rounded-full mr-2"></span>
                      Cuenta: {account}
                      <span className="ml-2 text-xs text-gray-400">({groupedCampaigns[platform][account].length})</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-4">
                      {groupedCampaigns[platform][account].map(campaign => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400">
          No hay campañas para mostrar
        </div>
      )}
    </div>
  );
};

export default CampaignsList;
