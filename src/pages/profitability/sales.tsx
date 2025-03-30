import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { salesDatabaseService } from '../../services/database/salesService';
import { campaignDatabaseService } from '../../services/database/campaignService';
import { adDatabaseService } from '../../services/database/adService';
import type { Sale, Campaign, Advertisement } from '../../types/database';
import { useAppContext } from '../../contexts/AppContext';

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [currentSale, setCurrentSale] = useState<Partial<Sale>>({});
  const [loading, setLoading] = useState(false);
  const { authData } = useAppContext();
  const [hoveredCampaign, setHoveredCampaign] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authData?.company_id || !selectedAd) return;

    try {
      setLoading(true);
      const salePayload = {
        advertisement_id: selectedAd.id,
        amount: 0,
        date: new Date(),
        ...currentSale,
        company_id: authData.company_id
      };

      await salesDatabaseService.createSale(salePayload, authData.company_id);
      await fetchData();
      setCurrentSale({});
      setSelectedAd(null);
      alert('Venta registrada correctamente');
    } catch (error) {
      alert('Error al guardar: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Sección de Campañas/Anuncios */}
        <h1 className='text-center'>CONTROL DE VENTAS</h1>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-6">Campañas Activas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign) => (
              <div 
                key={campaign.id}
                className={`bg-gray-700 p-4 rounded-xl relative transition-all duration-300 ${
                  hoveredCampaign === campaign.id ? 'bg-green-800/30' : ''
                }`}
                onClick={() => setHoveredCampaign(
                  hoveredCampaign === campaign.id ? null : campaign.id
                )}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">{campaign.name} - {campaign.cp}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(campaign.launch_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    hoveredCampaign === campaign.id ? 'bg-green-400' : 'bg-gray-500'
                  }`} />
                </div>

                {hoveredCampaign === campaign.id && (
                  <div className="mt-4 space-y-2">
                    {ads
                      .filter(ad => ad.campaign_id === campaign.id)
                      .map(ad => (
                        <button
                          key={ad.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAd(ad);
                          }}
                          className="w-full p-3 text-left bg-gray-800 hover:bg-gray-700 rounded-lg"
                        >
                          {ad.name}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Formulario de registro */}
        {selectedAd && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Registrar venta para {selectedAd.name}</h2>
              <button 
                onClick={() => setSelectedAd(null)}
                className="text-gray-400 hover:text-gray-300 text-3xl"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="number"
                placeholder="Monto de la venta"
                className="w-full p-3 rounded bg-gray-700 text-white"
                value={currentSale.amount || ''}
                onChange={(e) => setCurrentSale({
                  ...currentSale,
                  amount: Number(e.target.value)
                })}
                required
              />
              <input
                type="date"
                className="w-full p-3 rounded bg-gray-700 text-white"
                value={currentSale.date ? new Date(currentSale.date).toISOString().split('T')[0] : ''}
                onChange={(e) => setCurrentSale({
                  ...currentSale,
                  date: new Date(e.target.value)
                })}
                required
              />
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Registrar Venta'}
              </button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}