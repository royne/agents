import { useState, useEffect } from 'react';
import type { Campaign, Advertisement } from '../types/database';

type FilterableItem = {
  advertisement_id: string;
  date: string | Date;
  [key: string]: any;
};

type UseFiltersProps<T extends FilterableItem> = {
  items: T[];
  ads: Advertisement[];
  campaigns: Campaign[];
};

type UseFiltersReturn<T extends FilterableItem> = {
  filteredItems: T[];
  selectedCampaign: string;
  setSelectedCampaign: (id: string) => void;
  selectedAd: string;
  setSelectedAd: (id: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  resetFilters: () => void;
};

export function useFilters<T extends FilterableItem>({
  items,
  ads,
  campaigns,
}: UseFiltersProps<T>): UseFiltersReturn<T> {
  // Estados para los filtros
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [selectedAd, setSelectedAd] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filteredItems, setFilteredItems] = useState<T[]>(items);

  // Aplicar filtros cuando cambian los valores
  useEffect(() => {
    applyFilters();
  }, [items, selectedCampaign, selectedAd, startDate, endDate]);

  const applyFilters = () => {
    let filtered = [...items];

    // Filtro por campaña
    if (selectedCampaign) {
      const adsInCampaign = ads
        .filter(ad => ad.campaign_id === selectedCampaign)
        .map(ad => ad.id);
      filtered = filtered.filter(item => 
        adsInCampaign.includes(item.advertisement_id)
      );
    }

    // Filtro por anuncio
    if (selectedAd) {
      filtered = filtered.filter(item => item.advertisement_id === selectedAd);
    }

    // Filtro por fecha de inicio
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= start;
      });
    }

    // Filtro por fecha de fin
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate <= end;
      });
    }

    setFilteredItems(filtered);
  };

  const resetFilters = () => {
    setSelectedCampaign('');
    setSelectedAd('');
    setStartDate('');
    setEndDate('');
    setFilteredItems(items);
  };

  return {
    filteredItems,
    selectedCampaign,
    setSelectedCampaign,
    selectedAd,
    setSelectedAd,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    resetFilters,
  };
}
