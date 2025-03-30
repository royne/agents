import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CrudLayout from '../../components/layout/CrudLayout';
import { salesDatabaseService } from '../../services/database/salesService';
import { campaignDatabaseService } from '../../services/database/campaignService';
import { adDatabaseService } from '../../services/database/adService';
import type { Sale, Campaign, Advertisement } from '../../types/database';
import { useAppContext } from '../../contexts/AppContext';

export default function SalesTracking() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);
  const { authData } = useAppContext();

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

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        <h1 className='text-center'>ANÁLISIS DE VENTAS</h1>
        
        {/* Tabla de ventas */}
        <CrudLayout
          title="Registro de Ventas"
          items={sales.map(sale => {
            const ad = ads.find(a => a.id === sale.advertisement_id);
            const campaign = campaigns.find(c => c.id === ad?.campaign_id);
            
            return {
              id: sale.id,
              name: `$${sale.amount}  (${new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long'}).format(new Date(sale.date))})  - AD: ${ad?.name ?? 'N/A'} - Campaña ${campaign?.name ?? 'N/A'}`
            };
          })}
          onDelete={() => {}}
          onEdit={() => {}}
          hideAddButton={true}
          children={null}
        />
      </div>
    </DashboardLayout>
  );
}
