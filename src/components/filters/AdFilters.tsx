import React from 'react';
import type { Campaign, Advertisement } from '../../types/database';
import { PLATFORM_OPTIONS } from '../../constants/platforms';

interface AdFiltersProps {
  campaigns: Campaign[];
  selectedCampaign: string;
  setSelectedCampaign: (id: string) => void;
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  resetFilters: () => void;
}

export default function AdFilters({
  campaigns,
  selectedCampaign,
  setSelectedCampaign,
  selectedPlatform,
  setSelectedPlatform,
  selectedStatus,
  setSelectedStatus,
  resetFilters,
}: AdFiltersProps) {
  // Obtener plataformas únicas de las campañas
  const platforms = [...new Set(campaigns.map(campaign => campaign.platform).filter(Boolean))];

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-bold mb-4">Filtros</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Campaña</label>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
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
          <label className="block text-sm font-medium text-gray-300 mb-1">Plataforma</label>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
          >
            <option value="">Todas las plataformas</option>
            {PLATFORM_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
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
