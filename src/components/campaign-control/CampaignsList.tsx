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
    <div className="soft-card p-8">
      <h2 className="text-xl font-bold mb-8 flex items-center">
        <div className="p-2 bg-primary-color/10 rounded-lg mr-3">
          <FaMoneyBillWave className="text-primary-color" />
        </div>
        Todas las Campañas ({campaigns.length})
      </h2>

      {campaigns.length > 0 ? (
        <div className="space-y-8">
          {platforms.map(platform => {
            const accounts = Object.keys(groupedCampaigns[platform]).sort();

            return (
              <div key={platform} className="mb-10 last:mb-0">
                <div className="flex items-center mb-6 pb-3 border-b border-white/5 relative">
                  <div className="mr-3 p-1.5 bg-white/5 rounded-lg border border-white/5">{getPlatformIcon(platform)}</div>
                  <h3 className="text-lg font-bold text-theme-primary tracking-tight">{platform}</h3>
                  <span className="ml-3 text-xs font-bold text-theme-tertiary bg-white/5 px-2 py-0.5 rounded-full border border-white/5">{Object.values(groupedCampaigns[platform]).flat().length}</span>
                </div>

                {accounts.map(account => (
                  <div key={`${platform}-${account}`} className="mb-6 last:mb-0">
                    <div className="text-xs font-bold text-theme-tertiary mb-4 ml-1 flex items-center uppercase tracking-[0.1em]">
                      <span className="w-1.5 h-1.5 bg-primary-color rounded-full mr-2 shadow-[0_0_8px_rgba(18,216,250,0.5)]"></span>
                      Cuenta: <span className="text-theme-primary ml-1.5">{account}</span>
                      <span className="ml-3 text-[10px] opacity-60">({groupedCampaigns[platform][account].length})</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-0 md:ml-4">
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
        <div className="text-center py-10 text-theme-tertiary">
          No hay campañas para mostrar
        </div>
      )}
    </div>
  );
};

export default CampaignsList;
