import React from 'react';
import type { Campaign, Advertisement } from '../../types/database';

interface DataFiltersProps {
  campaigns: Campaign[];
  ads: Advertisement[];
  selectedCampaign: string;
  setSelectedCampaign: (id: string) => void;
  selectedAd: string;
  setSelectedAd: (id: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  resetFilters: () => void;
}

export default function DataFilters({
  campaigns,
  ads,
  selectedCampaign,
  setSelectedCampaign,
  selectedAd,
  setSelectedAd,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  resetFilters,
}: DataFiltersProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Filtros</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Campaña</label>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={selectedCampaign}
            onChange={(e) => {
              setSelectedCampaign(e.target.value);
              // Resetear el anuncio seleccionado si cambia la campaña
              if (e.target.value) {
                setSelectedAd('');
              }
            }}
          >
            <option value="">Todas las campañas</option>
            {campaigns.map(campaign => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Anuncio</label>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={selectedAd}
            onChange={(e) => setSelectedAd(e.target.value)}
          >
            <option value="">Todos los anuncios</option>
            {ads
              .filter(ad => !selectedCampaign || ad.campaign_id === selectedCampaign)
              .map(ad => (
                <option key={ad.id} value={ad.id}>
                  {ad.name}
                </option>
              ))
            }
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Fecha inicio</label>
          <input
            type="date"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Fecha fin</label>
          <input
            type="date"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={resetFilters}
          className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}
