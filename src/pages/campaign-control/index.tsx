import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
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
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [dailySummary, setDailySummary] = useState<DailySummary>({
    company_id: authData?.company_id || '',
    date: selectedDate,
    total_budget: 0,
    total_spend: 0,
    total_revenue: 0,
    total_units: 0,
    active_campaigns: 0,
    pending_updates: 0,
    avg_roas: 0,
    notes: ''
  });

  const [recentChanges, setRecentChanges] = useState<CampaignBudgetChange[]>([]);

  const [campaignDailyRecords, setCampaignDailyRecords] = useState<CampaignDailyRecord[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (authData?.company_id) {
        setLoading(true);
        try {
          const campaignsData = await campaignDatabaseService.getCampaigns(authData.company_id);
          const filterCampaigns = campaignsData.filter(campaign => campaign.status === true);
          setCampaigns(filterCampaigns);
          
          const summary = await dailySummaryService.getDailySummary(authData.company_id, selectedDate);
          if (summary) {
            setDailySummary(summary);
          } else {
            try {
              const generatedSummary = await dailySummaryService.generateDailySummary(
                authData.company_id,
                selectedDate
              );
              
              if (generatedSummary) {
                setDailySummary(generatedSummary);
              }
            } catch (summaryError) {
              console.error('Error al generar resumen diario automáticamente:', summaryError);
            }
          }
          
          const recentChangesData = await campaignBudgetChangeService.getRecentChanges(authData.company_id, 20);

          if (recentChangesData.length > 0) {
            setRecentChanges(recentChangesData);
          }
          
        } catch (error) {
          console.error('Error al cargar datos del dashboard:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadDashboardData();
  }, [authData, selectedDate]);

  useEffect(() => {
    const loadDailyRecords = async () => {
      if (authData?.company_id) {
        try {
          const records = await campaignDailyRecordService.getCompanyDailyRecords(authData.company_id, selectedDate);
          if (records && records.length > 0) {
            setCampaignDailyRecords(records);
          }
        } catch (error) {
          console.error('Error al cargar registros diarios:', error);
        }
      }
    };
    
    loadDailyRecords();
  }, [authData, selectedDate]);

  useEffect(() => {
    if (campaigns.length > 0) {

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];
      
      console.log('campaignDailyRecords', campaignDailyRecords);
      console.log('campaigns', campaigns);
      const combinedData: CampaignWithDailyData[] = campaigns.map(campaign => {
        const dailyRecord = campaignDailyRecords.find(
          record => record.campaign_id === campaign.id && record.date === selectedDate
        );
        
        const lastChange = recentChanges.find(change => change.campaign_id === campaign.id);
        
        const campaignStatus = typeof campaign.status === 'boolean' ? 
          (campaign.status ? 'active' : 'paused') : 
          campaign.status;
          
        const needsUpdate = 
          campaignStatus === 'active' && 
          selectedDate <= new Date().toISOString().split('T')[0] &&
          !dailyRecord;
        
        const campaignDailyData: CampaignDailyRecord = dailyRecord || {
          id: '',
          campaign_id: campaign.id || '',
          date: selectedDate,
          budget: 0,
          spend: 0,
          units: 0,
          units_sold: 0,
          revenue: 0,
          sales: 0,
          status: typeof campaign.status === 'boolean' ? 
            (campaign.status ? 'active' : 'paused') : 
            (campaign.status === 'active' ? 'active' : 'paused')
        };
        
        return {
          ...campaign,
          dailyData: campaignDailyData,
          lastChange,
          needsUpdate
        };
      });
      
      setCampaignsWithData(combinedData);
    }
  }, [campaigns, recentChanges, campaignDailyRecords, selectedDate]);

  const handleDateChange = (date: string) => {

    setSelectedDate(date);
  };

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

  const handleSaveAdjustments = async (adjustments: {
    adjusted_units: number;
    adjusted_revenue: number;
    notes?: string;
  }) => {
    if (dailySummary.id) {
      try {
        const updatedSummary = await dailySummaryService.adjustDailySummary(
          dailySummary.id,
          adjustments
        );
        
        if (updatedSummary) {
          setDailySummary(updatedSummary);
        }
      } catch (error) {
        console.error('Error al guardar ajustes del resumen diario:', error);
      }
    }
  };

  return (
    <ProtectedRoute moduleKey={'campaign-control'}>
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
              onSaveAdjustments={handleSaveAdjustments}
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
    </ProtectedRoute>
  );
}
