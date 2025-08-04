import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { campaignDatabaseService } from '../../services/database/campaignService';
import { useAppContext } from '../../contexts/AppContext';
import type { Campaign } from '../../types/database';
import { 
  CampaignDailyRecord, 
  CampaignBudgetChange, 
  DailySummary,
  CampaignWithDailyData 
} from '../../types/campaign-control';

// Importación de componentes modulares
import DateSelector from '../../components/campaign-control/DateSelector';
import DailySummaryComponent from '../../components/campaign-control/DailySummary';
import RecentChanges from '../../components/campaign-control/RecentChanges';
import PendingCampaigns from '../../components/campaign-control/PendingCampaigns';
import CampaignsList from '../../components/campaign-control/CampaignsList';

export default function CampaignControl() {
  const { authData } = useAppContext();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsWithData, setCampaignsWithData] = useState<CampaignWithDailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Datos quemados para el resumen diario
  const dailySummary: DailySummary = {
    date: selectedDate,
    totalBudget: 2450000,
    totalSpend: 1890000,
    totalRevenue: 4347000,
    activeCampaigns: 15,
    campaignsNeedingUpdate: 8,
    avgROAS: 2.3,
    notes: 'Buen rendimiento general. Se aumentaron presupuestos en Facebook. 3 campañas presentan alertas de bajo rendimiento.'
  };

  // Datos quemados para los últimos cambios importantes
  const recentChanges: CampaignBudgetChange[] = [
    {
      id: '1',
      campaignId: '101',
      campaignName: 'FB Conversiones - Producto A',
      date: new Date(new Date().getTime() - 12 * 60 * 60 * 1000).toISOString(), // 12 horas atrás
      previousBudget: 100000,
      newBudget: 120000,
      reason: 'Aumento por buen rendimiento',
      changeType: 'increase'
    },
    {
      id: '2',
      campaignId: '102',
      campaignName: 'Google Search - Marca',
      date: new Date(new Date().getTime() - 14 * 60 * 60 * 1000).toISOString(), // 14 horas atrás
      previousBudget: 80000,
      newBudget: 0,
      reason: 'Pausada por bajo ROAS',
      changeType: 'pause'
    },
    {
      id: '3',
      campaignId: '103',
      campaignName: 'TikTok - Awareness',
      date: new Date(new Date().getTime() - 18 * 60 * 60 * 1000).toISOString(), // 18 horas atrás
      previousBudget: 120000,
      newBudget: 100000,
      reason: 'Reducción por ajuste de presupuesto',
      changeType: 'decrease'
    },
  ];

  // Datos quemados para los registros diarios de campañas
  const campaignDailyRecords: CampaignDailyRecord[] = [
    {
      campaignId: '1',
      date: selectedDate,
      budget: 150000,
      spend: 120000,
      units: 48,
      revenue: 240000,
      roas: 2.0,
      status: 'active',
      needsUpdate: false
    },
    {
      campaignId: '2',
      date: selectedDate,
      budget: 100000,
      spend: 85000,
      units: 32,
      revenue: 160000,
      roas: 1.88,
      status: 'active',
      needsUpdate: false
    },
    {
      campaignId: '3',
      date: selectedDate,
      budget: 80000,
      spend: 0,
      units: 0,
      revenue: 0,
      roas: 0,
      status: 'paused',
      needsUpdate: true
    },
    {
      campaignId: '4',
      date: selectedDate,
      budget: 120000,
      spend: 65000,
      units: 12,
      revenue: 60000,
      roas: 0.92,
      status: 'active',
      needsUpdate: true
    },
  ];

  // Cargar campañas desde la base de datos
  useEffect(() => {
    const loadCampaigns = async () => {
      if (authData?.company_id) {
        setLoading(true);
        try {
          const campaignsData = await campaignDatabaseService.getCampaigns(authData.company_id);
          setCampaigns(campaignsData);
        } catch (error) {
          console.error('Error al cargar campañas:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadCampaigns();
  }, [authData, selectedDate]);

  // Usar datos reales cuando estén disponibles, de lo contrario usar los quemados
  useEffect(() => {
    if (campaigns.length > 0) {
      // Combinar datos de campañas con datos diarios simulados
      const combinedData: CampaignWithDailyData[] = campaigns.map(campaign => {
        // Buscar si hay un registro diario para esta campaña
        const dailyRecord = campaignDailyRecords.find(record => record.campaignId === campaign.id);
        // Buscar último cambio para esta campaña
        const lastChange = recentChanges.find(change => change.campaignId === campaign.id);
        
        // Asegurarse de que dailyData cumpla con la interfaz CampaignDailyRecord
        const defaultDailyData: CampaignDailyRecord = {
          campaignId: campaign.id,
          date: selectedDate,
          budget: Math.floor(Math.random() * 300000) + 100000,
          spend: 0,
          units: 0,
          revenue: 0,
          roas: 0,
          status: 'active',
          needsUpdate: true
        };
        
        return {
          ...campaign,
          dailyData: dailyRecord || defaultDailyData,
          lastChange,
          needsUpdate: Boolean(Math.random() > 0.5) // Aleatoriamente para demo
        };
      });
      
      setCampaignsWithData(combinedData);
    }
  }, [campaigns, selectedDate]);

  // Manejador de cambio de fecha
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <DashboardLayout>
      <PageHeader 
        title="Control de Campañas"
        description="Monitorea el rendimiento diario y administra tus campañas publicitarias"
      />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-2xl text-gray-500">Cargando datos...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Selector de fecha */}
          <DateSelector 
            selectedDate={selectedDate} 
            onDateChange={handleDateChange} 
          />
          
          {/* Contenedor de tres columnas para Resumen Diario, Últimos Cambios y Pendientes de Registrar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Resumen del día */}
            <DailySummaryComponent summary={dailySummary} />
            
            {/* Últimos cambios importantes */}
            <RecentChanges changes={recentChanges} />
            
            {/* Campañas que necesitan actualización */}
            <PendingCampaigns campaigns={campaignsWithData} />
          </div>
          
          {/* Todas las campañas */}
          <CampaignsList campaigns={campaignsWithData} />
        </div>
      )}
    </DashboardLayout>
  );
}
