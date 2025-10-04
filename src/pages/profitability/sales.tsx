import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { salesDatabaseService } from '../../services/database/salesService';
import { campaignDatabaseService } from '../../services/database/campaignService';
import { adDatabaseService } from '../../services/database/adService';
import type { Sale, Campaign, Advertisement } from '../../types/database';
import { useAppContext } from '../../contexts/AppContext';
import SalesForm from '../../components/Financial/salesForm';
import ExpensesForm from '../../components/Financial/expensesForm';
import PageHeader from '../../components/common/PageHeader';
import { FaDollarSign } from 'react-icons/fa';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { PLATFORMS, PLATFORM_COLORS } from '../../constants/platforms';

// Componente para mostrar una plataforma con sus campañas
interface PlatformSectionProps {
  platform: string;
  platformName: string;
  campaigns: Campaign[];
  ads: Advertisement[];
  expandedPlatforms: Record<string, boolean>;
  setExpandedPlatforms: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  hoveredCampaign: string | null;
  setHoveredCampaign: React.Dispatch<React.SetStateAction<string | null>>;
  operationType: 'venta' | 'gasto';
  setSelectedAd: React.Dispatch<React.SetStateAction<Advertisement | null>>;
}

const PlatformSection = ({
  platform,
  platformName,
  campaigns,
  ads,
  expandedPlatforms,
  setExpandedPlatforms,
  hoveredCampaign,
  setHoveredCampaign,
  operationType,
  setSelectedAd
}: PlatformSectionProps) => {
  const platformCampaigns = campaigns.filter(c => c.platform === platform);
  const isExpanded = expandedPlatforms[platform];
  
  const toggleExpand = () => {
    setExpandedPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <div 
        className="flex justify-between items-center p-4 cursor-pointer bg-gray-800 hover:bg-gray-700"
        onClick={toggleExpand}
      >
        <div className="flex items-center">
          <span className={`px-3 py-1 rounded text-white ${PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS]} font-bold`}>
            {platformName}
            <span className="ml-2 bg-white text-gray-800 text-xs px-2 py-0.5 rounded-full">
              {platformCampaigns.length}
            </span>
          </span>
        </div>
        <div>
          {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 bg-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformCampaigns.length > 0 ? (
              platformCampaigns.map((campaign) => (
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
              ))
            ) : (
              <div className="col-span-3 text-center py-4">
                <p className="text-gray-400">No hay campañas de {platformName} disponibles</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(false);
  const { authData } = useAppContext();
  const [hoveredCampaign, setHoveredCampaign] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [operationType, setOperationType] = useState<'venta' | 'gasto'>('venta');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedPlatforms, setExpandedPlatforms] = useState<Record<string, boolean>>({
    [PLATFORMS.META]: false,
    [PLATFORMS.TIKTOK]: false,
    [PLATFORMS.WHATSAPP]: false
  });

  useEffect(() => {
    fetchData();
  }, []);
  
  // Filtrar campañas cuando cambia el término de búsqueda (similar a ILIKE de PostgreSQL)
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCampaigns(campaigns);
    } else {
      // Convertir a minúsculas para búsqueda insensible a mayúsculas/minúsculas
      const term = searchTerm.toLowerCase();
      
      // Filtrar campañas que contengan el término en cualquier parte del nombre o CP
      const filtered = campaigns.filter(campaign => {
        const campaignName = campaign.name?.toLowerCase() || '';
        const campaignCp = campaign.cp?.toLowerCase() || '';
        
        // Buscar coincidencia en cualquier parte del texto (como ILIKE %term%)
        return campaignName.includes(term) || campaignCp.includes(term);
      });
      
      setFilteredCampaigns(filtered);
    }
  }, [searchTerm, campaigns]);

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
    const activeCampaigns = campaignsData.filter(campaign => campaign.status === true);
    setCampaigns(activeCampaigns);
    setFilteredCampaigns(activeCampaigns);
    setAds(adsData.filter(ad => ad.status === true));
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
    <ProtectedRoute moduleKey={'profitability'}>
      <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        <PageHeader
          title={
            <>
              <FaDollarSign className="inline-block mr-2 mb-1" />
              Control de Ventas y Gastos
            </>
          }
          description="Registra las ventas y gastos asociados a tus campañas publicitarias."
          backLink="/profitability"
        />
        <ToggleSwitch />

        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl font-bold">Campañas Activas</h2>
            
            <div className="w-full md:w-1/3 mt-4 md:mt-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar campaña..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 pl-10 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchTerm.trim() !== '' && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {campaigns.length > 0 ? (
            <div className="space-y-6">
              {searchTerm.trim() !== '' && (
                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-300 mb-2">
                    Resultados para: <span className="font-bold">"{searchTerm}"</span> 
                    ({filteredCampaigns.length} {filteredCampaigns.length === 1 ? 'campaña' : 'campañas'}):
                  </p>
                </div>
              )}
              
              {/* Secciones de plataformas usando el componente reutilizable */}
              <PlatformSection 
                platform={PLATFORMS.META}
                platformName="Meta"
                campaigns={filteredCampaigns}
                ads={ads}
                expandedPlatforms={expandedPlatforms}
                setExpandedPlatforms={setExpandedPlatforms}
                hoveredCampaign={hoveredCampaign}
                setHoveredCampaign={setHoveredCampaign}
                operationType={operationType}
                setSelectedAd={setSelectedAd}
              />
              
              <PlatformSection 
                platform={PLATFORMS.TIKTOK}
                platformName="TikTok"
                campaigns={filteredCampaigns}
                ads={ads}
                expandedPlatforms={expandedPlatforms}
                setExpandedPlatforms={setExpandedPlatforms}
                hoveredCampaign={hoveredCampaign}
                setHoveredCampaign={setHoveredCampaign}
                operationType={operationType}
                setSelectedAd={setSelectedAd}
              />
              
              <PlatformSection 
                platform={PLATFORMS.WHATSAPP}
                platformName="WhatsApp"
                campaigns={filteredCampaigns}
                ads={ads}
                expandedPlatforms={expandedPlatforms}
                setExpandedPlatforms={setExpandedPlatforms}
                hoveredCampaign={hoveredCampaign}
                setHoveredCampaign={setHoveredCampaign}
                operationType={operationType}
                setSelectedAd={setSelectedAd}
              />
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400">No hay campañas activas disponibles</p>
            </div>
          )}
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
    </ProtectedRoute>
  );
}