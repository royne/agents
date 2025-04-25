import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CrudLayout from '../../components/layout/CrudLayout';
import { salesDatabaseService } from '../../services/database/salesService';
import { campaignDatabaseService } from '../../services/database/campaignService';
import { adDatabaseService } from '../../services/database/adService';
import type { Sale, Campaign, Advertisement } from '../../types/database';
import { useAppContext } from '../../contexts/AppContext';
import { useFilters } from '../../hooks/useFilters';
import DataFilters from '../../components/filters/DataFilters';

export default function SalesTracking() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSale, setCurrentSale] = useState<Partial<Sale>>({});
  const { authData } = useAppContext();

  // Usar el hook useFilters para manejar la lógica de filtros
  const {
    filteredItems: filteredSales,
    selectedCampaign,
    setSelectedCampaign,
    selectedAd,
    setSelectedAd,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    resetFilters
  } = useFilters<Sale>({
    items: sales,
    ads,
    campaigns
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!authData?.company_id) return;
    
    setLoading(true);
    const [salesData, campaignsData] = await Promise.all([
      salesDatabaseService.getSales(authData.company_id),
      campaignDatabaseService.getCampaigns(authData.company_id)
    ]);
    
    const adsData = await adDatabaseService.getAds(authData.company_id);
    
    setSales(salesData);
    setCampaigns(campaignsData);
    setAds(adsData);
    setLoading(false);
  };

  const handleEdit = (id: string) => {
    const sale = sales.find(s => s.id === id);
    if (sale) {
      setCurrentSale(sale);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await salesDatabaseService.deleteSale(id);
      await fetchData();
      alert('Venta eliminada con éxito');
    } catch (error) {
      alert('Error al eliminar la venta: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authData?.company_id || !currentSale.id) return;

    try {
      setLoading(true);
      const salePayload: Partial<Sale> = {
        amount: currentSale.amount,
        advertisement_id: currentSale.advertisement_id,
        order_dropi: currentSale.order_dropi,
        date: currentSale.date instanceof Date 
          ? currentSale.date 
          : currentSale.date 
            ? new Date(currentSale.date) 
            : new Date()
      };

      await salesDatabaseService.updateSale(
        currentSale.id, 
        salePayload, 
        authData.company_id
      );
      
      await fetchData();
      alert('Venta actualizada con éxito');
      setCurrentSale({});
      setIsModalOpen(false);
    } catch (error) {
      alert('Error al guardar: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        <h1 className='text-center'>ANÁLISIS DE VENTAS</h1>
        
        {/* Filtros */}
        <DataFilters
          campaigns={campaigns}
          ads={ads}
          selectedCampaign={selectedCampaign}
          setSelectedCampaign={setSelectedCampaign}
          selectedAd={selectedAd}
          setSelectedAd={setSelectedAd}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          resetFilters={resetFilters}
        />

        {/* Resumen */}
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-300">Total de ventas</h3>
              <p className="text-2xl font-bold">$ {filteredSales.reduce((sum, sale) => sum + (sale.amount || 0), 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-300">Número de registros</h3>
              <p className="text-2xl font-bold">{filteredSales.length}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-300">Promedio por venta</h3>
              <p className="text-2xl font-bold">
                $ {filteredSales.length ? (filteredSales.reduce((sum, sale) => sum + (sale.amount || 0), 0) / filteredSales.length).toLocaleString('es-CO', { maximumFractionDigits: 0 }) : '0'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Tabla de ventas */}
        <CrudLayout
          title="Registro de Ventas"
          items={filteredSales.map(sale => {
            const ad = ads.find(a => a.id === sale.advertisement_id);
            const campaign = campaigns.find(c => c.id === ad?.campaign_id);
            
            return {
              id: sale.id,
              name: `$ ${sale.amount.toLocaleString('es-CO', { maximumFractionDigits: 0 })}  (${new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long'}).format(new Date(sale.date))})  ${sale.order_dropi ? `- Orden: ${sale.order_dropi}` : ''} - AD: ${ad?.name ?? 'N/A'} - Campaña ${campaign?.name ?? 'N/A'}`
            };
          })}
          onDelete={handleDelete}
          onEdit={handleEdit}
          hideAddButton={true}
          children={null}
        />

        {/* Modal de edición */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Editar Venta</h2>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentSale({});
                  }}
                  className="text-gray-400 hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Monto</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Monto de la venta"
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    value={currentSale.amount || ''}
                    onChange={(e) => setCurrentSale({...currentSale, amount: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Orden Dropi</label>
                  <input
                    type="text"
                    placeholder="Número de orden de Dropi"
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    value={currentSale.order_dropi || ''}
                    onChange={(e) => setCurrentSale({...currentSale, order_dropi: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Fecha</label>
                  <input
                    type="date"
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    value={currentSale.date instanceof Date 
                      ? currentSale.date.toISOString().split('T')[0] 
                      : currentSale.date 
                        ? new Date(currentSale.date).toISOString().split('T')[0] 
                        : ''}
                    onChange={(e) => {
                      const dateValue = e.target.value ? new Date(e.target.value) : new Date();
                      setCurrentSale({...currentSale, date: dateValue});
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Anuncio</label>
                  <select
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    value={currentSale.advertisement_id || ''}
                    onChange={(e) => setCurrentSale({...currentSale, advertisement_id: e.target.value})}
                    required
                  >
                    <option value="">Selecciona un anuncio</option>
                    {ads.map(ad => {
                      const campaign = campaigns.find(c => c.id === ad.campaign_id);
                      return (
                        <option key={ad.id} value={ad.id}>
                          {ad.name} - Campaña: {campaign?.name || 'N/A'}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
