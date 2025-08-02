import React from 'react';
import type { Campaign, Product } from '../../types/database';
import { PLATFORM_OPTIONS } from '../../constants/platforms';

interface CampaignFiltersProps {
  products: Product[];
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
  filteredCampaigns: Campaign[];
  totalCampaigns: number;
}

export default function CampaignFilters({
  products,
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
  filteredCampaigns,
  totalCampaigns,
}: CampaignFiltersProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-xl font-bold">Filtros</h2>
        <div className="mt-2 md:mt-0 px-3 py-1 bg-gray-700 rounded-full text-sm">
          <span className="font-medium">
            {filteredCampaigns.length} {filteredCampaigns.length === 1 ? 'campaña' : 'campañas'}
          </span>
          {filteredCampaigns.length !== totalCampaigns && (
            <span className="text-gray-400 ml-1">
              de {totalCampaigns} {totalCampaigns === 1 ? 'total' : 'totales'}
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Producto</label>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">Todos los productos</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}
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
            <option value="true">Activas</option>
            <option value="false">Inactivas</option>
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
