import { useState, useEffect } from 'react';
import type { Campaign, Product } from '../types/database';

type UseCampaignFiltersProps = {
  campaigns: Campaign[];
  products: Product[];
};

type UseCampaignFiltersReturn = {
  filteredCampaigns: Campaign[];
  selectedProduct: string;
  setSelectedProduct: (id: string) => void;
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  resetFilters: () => void;
};

export function useCampaignFilters({
  campaigns,
  products,
}: UseCampaignFiltersProps): UseCampaignFiltersReturn {
  // Estados para los filtros
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>(campaigns);

  // Aplicar filtros cuando cambian los valores
  useEffect(() => {
    applyFilters();
  }, [campaigns, selectedProduct, selectedPlatform, selectedStatus, startDate, endDate]);

  const applyFilters = () => {
    let filtered = [...campaigns];

    // Filtro por producto
    if (selectedProduct) {
      filtered = filtered.filter(campaign => campaign.product_id === selectedProduct);
    }

    // Filtro por plataforma
    if (selectedPlatform) {
      filtered = filtered.filter(campaign => campaign.platform === selectedPlatform);
    }

    // Filtro por estado
    if (selectedStatus) {
      const isActive = selectedStatus === 'true';
      filtered = filtered.filter(campaign => campaign.status === isActive);
    }

    // Filtro por fecha de inicio
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(campaign => {
        const campaignDate = new Date(campaign.launch_date);
        return campaignDate >= start;
      });
    }

    // Filtro por fecha de fin
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(campaign => {
        const campaignDate = new Date(campaign.launch_date);
        return campaignDate <= end;
      });
    }

    setFilteredCampaigns(filtered);
  };

  const resetFilters = () => {
    setSelectedProduct('');
    setSelectedPlatform('');
    setSelectedStatus('');
    setStartDate('');
    setEndDate('');
    setFilteredCampaigns(campaigns);
  };

  return {
    filteredCampaigns,
    selectedProduct,
    setSelectedProduct,
    selectedPlatform,
    setSelectedPlatform,
    selectedStatus,
    setSelectedStatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    resetFilters,
  };
}
