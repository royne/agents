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
    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex flex-col group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-primary-color/5 blur-2xl rounded-full -mr-8 -mt-8"></div>

      <div className="flex justify-between items-start mb-2 relative z-10">
        <h3 className="font-bold text-theme-primary truncate flex-grow group-hover:text-primary-color transition-colors" title={campaign.name}>{campaign.name}</h3>
        <div className="ml-3 flex-shrink-0">
          {getStatusIcon(campaign.dailyData.status)}
        </div>
      </div>

      <div className="text-[10px] font-bold text-theme-tertiary uppercase tracking-widest mb-4 flex items-center">
        {campaign.platform || 'N/A'} <span className="mx-2 opacity-30">|</span> Ppto: <span className="text-theme-secondary ml-1">{formatCurrency(campaign.dailyData.budget)}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto relative z-10">
        <div className="bg-black/20 p-2 rounded-xl border border-white/5">
          <div className="text-[9px] font-bold text-theme-tertiary uppercase mb-1">Unidades</div>
          <div className="text-sm font-bold text-theme-primary">{campaign.dailyData.units || 0}</div>
        </div>
        <div className="bg-black/20 p-2 rounded-xl border border-white/5">
          <div className="text-[9px] font-bold text-theme-tertiary uppercase mb-1">Gasto</div>
          <div className="text-sm font-bold text-primary-color">{campaign.dailyData.spend ? formatCurrency(campaign.dailyData.spend) : '$0'}</div>
        </div>
      </div>

      {campaign.needsUpdate && (
        <div className="mt-4 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold p-2 rounded-lg border border-yellow-500/20 text-center animate-pulse">
          PENDIENTE DE ACTUALIZAR
        </div>
      )}

      <div className="flex justify-end mt-4 pt-3 border-t border-white/5 relative z-10">
        <Link href={`/campaign-control/${campaign.id}/daily-view`} className="text-primary-color hover:underline flex items-center text-xs font-bold uppercase tracking-wider">
          Detalles
          <FaExternalLinkAlt className="ml-1.5 text-[9px]" />
        </Link>
      </div>
    </div>
  );
};

export default CampaignCard;
