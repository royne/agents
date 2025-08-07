import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { campaignDatabaseService } from '../../services/database/campaignService';
import { campaignDailyRecordService } from '../../services/database/campaignDailyRecordService';
import { campaignBudgetChangeService } from '../../services/database/campaignBudgetChangeService';
import { dailySummaryService } from '../../services/database/dailySummaryService';
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

  // Estado para los datos del resumen diario
  const [dailySummary, setDailySummary] = useState<DailySummary>({
    company_id: authData?.company_id || '',
    date: selectedDate,
    total_budget: 2450000,
    total_spend: 1890000,
    total_revenue: 4347000,
    total_units: 0,
    active_campaigns: 15,
    pending_updates: 8,
    avg_roas: 2.3,
    notes: 'Buen rendimiento general. Se aumentaron presupuestos en Facebook. 3 campañas presentan alertas de bajo rendimiento.'
  });

  // Estado para los cambios recientes
  const [recentChanges, setRecentChanges] = useState<CampaignBudgetChange[]>([
    {
      id: '1',
      campaign_id: '101',
      campaignName: 'FB Conversiones - Producto A',
      date: new Date(new Date().getTime() - 12 * 60 * 60 * 1000).toISOString(), // 12 horas atrás
      previous_budget: 100000,
      new_budget: 120000,
      reason: 'Aumento por buen rendimiento',
      change_type: 'increase'
    },
    {
      id: '2',
      campaign_id: '102',
      campaignName: 'Google Search - Marca',
      date: new Date(new Date().getTime() - 14 * 60 * 60 * 1000).toISOString(), // 14 horas atrás
      previous_budget: 80000,
      new_budget: 0,
      reason: 'Pausada por bajo ROAS',
      change_type: 'pause'
    },
    {
      id: '3',
      campaign_id: '103',
      campaignName: 'TikTok - Awareness',
      date: new Date(new Date().getTime() - 18 * 60 * 60 * 1000).toISOString(), // 18 horas atrás
      previous_budget: 120000,
      new_budget: 100000,
      reason: 'Reducción por ajuste de presupuesto',
      change_type: 'decrease'
    },
  ]);

  // Estado para los registros diarios de campañas
  const [campaignDailyRecords, setCampaignDailyRecords] = useState<CampaignDailyRecord[]>([
    {
      campaign_id: '1',
      date: selectedDate,
      budget: 150000,
      spend: 120000,
      units: 48,
      revenue: 240000,
      roas: 2.0,
      status: 'active'
    },
    {
      campaign_id: '2',
      date: selectedDate,
      budget: 100000,
      spend: 85000,
      units: 32,
      revenue: 160000,
      roas: 1.88,
      status: 'active'
    },
    {
      campaign_id: '3',
      date: selectedDate,
      budget: 80000,
      spend: 0,
      units: 0,
      revenue: 0,
      roas: 0,
      status: 'paused'
    },
    {
      campaign_id: '4',
      date: selectedDate,
      budget: 120000,
      spend: 65000,
      units: 12,
      revenue: 60000,
      roas: 0.92,
      status: 'active'
    },
  ]);

  // Cargar todos los datos necesarios
  useEffect(() => {
    const loadDashboardData = async () => {
      if (authData?.company_id) {
        setLoading(true);
        try {
          // 1. Cargar las campañas
          const campaignsData = await campaignDatabaseService.getCampaigns(authData.company_id);
          setCampaigns(campaignsData);
          
          // 2. Intentar cargar el resumen diario desde la base de datos
          const summary = await dailySummaryService.getDailySummary(authData.company_id, selectedDate);
          if (summary) {
            setDailySummary(summary);
          }
          
          // 3. Cargar los cambios recientes reales
          const recentChangesData = await campaignBudgetChangeService.getRecentChanges(authData.company_id, 5);
          if (recentChangesData.length > 0) {
            setRecentChanges(recentChangesData);
          }
          
          // 4. Cargar registros diarios si existen
          // Esto normalmente requeriría múltiples llamadas a la API, una por campaña
          // Por simplicidad, mantendremos los datos quemados por ahora
          
        } catch (error) {
          console.error('Error al cargar datos del dashboard:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadDashboardData();
  }, [authData, selectedDate]);

  // Usar datos reales cuando estén disponibles, de lo contrario usar los quemados
  useEffect(() => {
    if (campaigns.length > 0) {
      // Combinar datos de campañas con datos diarios simulados
      const combinedData: CampaignWithDailyData[] = campaigns.map(campaign => {
        // Buscar si hay un registro diario para esta campaña
        const dailyRecord = campaignDailyRecords.find(record => record.campaign_id === campaign.id);
        // Buscar último cambio para esta campaña
        const lastChange = recentChanges.find(change => change.campaign_id === campaign.id);
        
        // Determinar si necesita actualización basado en la fecha (campaña activa sin datos del día actual)
        const needsUpdate = campaign.status && (!dailyRecord || dailyRecord.date !== selectedDate);
        
        return {
          ...campaign,
          dailyData: dailyRecord || {
            campaign_id: campaign.id,
            date: selectedDate,
            budget: 0,
            spend: 0,
            units: 0,
            revenue: 0,
            status: campaign.status ? 'active' : 'paused'
          },
          lastChange,
          needsUpdate
        };
      });
      
      setCampaignsWithData(combinedData);
    }
  }, [campaigns, recentChanges, campaignDailyRecords, selectedDate]);

  // Manejador de cambio de fecha
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    // La recarga de datos está manejada por el useEffect que observa selectedDate
  };

  // Función para generar un nuevo resumen diario a partir de los datos actuales
  const handleGenerateSummary = async () => {
    if (authData?.company_id) {
      try {
        const summary = await dailySummaryService.generateDailySummary(
          authData.company_id,
          selectedDate
        );
        
        if (summary) {
          setDailySummary(summary);
        }
      } catch (error) {
        console.error('Error al generar resumen diario:', error);
      }
    }
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
            <DailySummaryComponent 
              summary={dailySummary} 
              onGenerateSummary={handleGenerateSummary} 
            />
            
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
