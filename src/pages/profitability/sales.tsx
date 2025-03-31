import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { salesDatabaseService } from '../../services/database/salesService';
import { campaignDatabaseService } from '../../services/database/campaignService';
import { adDatabaseService } from '../../services/database/adService';
import type { Sale, Campaign, Advertisement } from '../../types/database';
import { useAppContext } from '../../contexts/AppContext';
import SalesForm from '../../components/Financial/salesForm';
import ExpensesForm from '../../components/Financial/expensesForm';

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(false);
  const { authData } = useAppContext();
  const [hoveredCampaign, setHoveredCampaign] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [operationType, setOperationType] = useState<'venta' | 'gasto'>('venta');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedAd) {
      setIsModalOpen(true);
    }
  }, [selectedAd]);

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

  const handleSuccess = async () => {
    await fetchData();
    setSelectedAd(null);
    setIsModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAd(null);
  };

  const ToggleSwitch = () => (
    <div className="flex items-center justify-center mb-6 bg-gray-800 p-4 rounded-lg">
      <span className={`mr-3 font-medium ${operationType === 'venta' ? 'text-green-400' : 'text-gray-300'}`}>
        Venta
      </span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only"
          checked={operationType === 'gasto'}
          onChange={() => setOperationType(operationType === 'venta' ? 'gasto' : 'venta')}
        />
        <div className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
          operationType === 'gasto' ? 'bg-red-500' : 'bg-green-500'
        }`}>
          <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 ease-in-out ${
            operationType === 'gasto' ? 'translate-x-5' : ''
          }`}></div>
        </div>
      </label>
      <span className={`ml-3 font-medium ${operationType === 'gasto' ? 'text-red-400' : 'text-gray-300'}`}>
        Gasto
      </span>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        <h1 className='text-center'>CONTROL DE VENTAS Y GASTOS</h1>
        <ToggleSwitch />

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-6">Campañas Activas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign) => (
              <div 
                key={campaign.id}
                className={`bg-gray-700 p-4 rounded-xl relative transition-all duration-300 ${
                  hoveredCampaign === campaign.id ? 
                  (operationType === 'gasto' ? 'bg-red-800/30' : 'bg-green-800/30') : ''
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
                    hoveredCampaign === campaign.id ? 
                    (operationType === 'gasto' ? 'bg-red-400' : 'bg-green-400') : 'bg-gray-500'
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

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
              className="absolute inset-0 bg-black opacity-70"
              onClick={closeModal}
            ></div>
            <div className="relative bg-gray-800 p-6 rounded-lg w-full max-w-lg mx-auto z-10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {operationType === 'venta' 
                    ? `Registrar venta para ${selectedAd?.name}`
                    : `Registrar gasto para ${selectedAd?.name}`
                  }
                </h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-300 text-3xl"
                >
                  &times;
                </button>
              </div>
              
              {operationType === 'venta' ? (
                <SalesForm 
                  selectedAd={selectedAd}
                  companyId={authData?.company_id || ''}
                  onSuccess={handleSuccess}
                  onCancel={closeModal}
                />
              ) : (
                <ExpensesForm
                  selectedAd={selectedAd}
                  companyId={authData?.company_id || ''}
                  onSuccess={handleSuccess}
                  onCancel={closeModal}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}