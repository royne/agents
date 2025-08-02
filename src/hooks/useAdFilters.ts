import { useState, useEffect } from 'react';
import type { Advertisement, Campaign } from '../types/database';

type UseAdFiltersProps = {
  ads: Advertisement[];
  campaigns: Campaign[];
};

type UseAdFiltersReturn = {
  filteredAds: Advertisement[];
  selectedCampaign: string;
  setSelectedCampaign: (id: string) => void;
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  resetFilters: () => void;
};

export function useAdFilters({
  ads,
  campaigns,
}: UseAdFiltersProps): UseAdFiltersReturn {
  // Estados para los filtros
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [filteredAds, setFilteredAds] = useState<Advertisement[]>(ads);

  // Aplicar filtros cuando cambian los valores
  useEffect(() => {
    applyFilters();
  }, [ads, campaigns, selectedCampaign, selectedPlatform, selectedStatus]);

  const applyFilters = () => {
    let filtered = [...ads];

    // Filtro por campaña
    if (selectedCampaign) {
      filtered = filtered.filter(ad => ad.campaign_id === selectedCampaign);
    }

    // Filtro por plataforma (a través de la campaña asociada)
    if (selectedPlatform) {
      filtered = filtered.filter(ad => {
        const campaign = campaigns.find(c => c.id === ad.campaign_id);
        return campaign?.platform === selectedPlatform;
      });
    }

    // Filtro por estado
    if (selectedStatus) {
      const isActive = selectedStatus === 'true';
      filtered = filtered.filter(ad => ad.status === isActive);
    }

    setFilteredAds(filtered);
  };

  const resetFilters = () => {
    setSelectedCampaign('');
    setSelectedPlatform('');
    setSelectedStatus('');
    setFilteredAds(ads);
  };

  return {
    filteredAds,
    selectedCampaign,
    setSelectedCampaign,
    selectedPlatform,
    setSelectedPlatform,
    selectedStatus,
    setSelectedStatus,
    resetFilters,
  };
}
