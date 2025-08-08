import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../../../contexts/AppContext';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/common/PageHeader';
import CampaignCurrentData from '../../../components/campaign-control/daily-view/CampaignCurrentData';
import DailyDataForm from '../../../components/campaign-control/daily-view/DailyDataForm';
import MetricsChart from '../../../components/campaign-control/daily-view/MetricsChart';
import CampaignNotes from '../../../components/campaign-control/daily-view/CampaignNotes';
import BudgetChangeForm from '../../../components/campaign-control/daily-view/BudgetChangeForm';
import CampaignBudgetHistory from '../../../components/campaign-control/daily-view/CampaignBudgetHistory';
import CampaignDateSelector from '../../../components/campaign-control/daily-view/CampaignDateSelector';
import DailyHistoryTable from '../../../components/campaign-control/daily-view/DailyHistoryTable';
import { CampaignDailyRecord, CampaignBudgetChange } from '../../../types/campaign-control';
import { campaignDailyRecordService } from '../../../services/database/campaignDailyRecordService';
import { campaignBudgetChangeService } from '../../../services/database/campaignBudgetChangeService';
import { campaignDatabaseService } from '../../../services/database/campaignService';
import { FaCircle } from 'react-icons/fa';
import { FaArrowUp, FaArrowDown, FaPause, FaPlay } from 'react-icons/fa';

export default function DailyView() {
  const router = useRouter();
  const { campaignId } = router.query;
  const { authData } = useAppContext();
  const company_id = authData?.company_id;

  const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(
    `${getTodayDateString()}T12:00:00.000Z`
  );
  
  const formattedSelectedDate = useMemo(() => {
    return selectedDate.split('T')[0];
  }, [selectedDate]);
  const [chartPeriod, setChartPeriod] = useState<string>('7d');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [dailyRecord, setDailyRecord] = useState<CampaignDailyRecord>({
    id: '',
    campaign_id: campaignId as string,
    date: selectedDate,
    budget: 0,
    spend: 0,
    revenue: 0,
    units: 0,
    status: 'active',
    notes: ''
  });
  
  const [initialDailyBudget, setInitialDailyBudget] = useState<number | undefined>(undefined);
  
  const [campaignNotes, setCampaignNotes] = useState<string>('');
  
  const [budgetChanges, setBudgetChanges] = useState<CampaignBudgetChange[]>([]);
  
  const [dailyRecords, setDailyRecords] = useState<CampaignDailyRecord[]>([]);
  
  useEffect(() => {
    if (!campaignId || !company_id) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const campaign = await campaignDatabaseService.getCampaignById(campaignId as string, company_id);
        const record = await campaignDailyRecordService.getDailyRecord(
          campaignId as string,
          selectedDate
        );

        
        if (record) {
          setDailyRecord(record);
          if (record.notes) {

            setCampaignNotes(record.notes);
          } else {

            setCampaignNotes('');
          }
        } else {
          setDailyRecord({
            campaign_id: campaignId as string,
            date: selectedDate,
            budget: initialDailyBudget || 0,
            spend: 0,
            revenue: 0,
            units: 0,
            status: 'active',
            notes: ''
          });
          setCampaignNotes('');
        }
        
        const changes = await campaignBudgetChangeService.getBudgetChanges(
          campaignId as string
        );
        
        const records = await campaignDailyRecordService.getCampaignDailyRecords(campaignId as string);
        
        const sortedChanges = [...changes].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setBudgetChanges(sortedChanges);
        setDailyRecords(records);
        
        let initialBudget: number;
        
        if (sortedChanges.length > 0) {
          initialBudget = sortedChanges[0].new_budget;

        } else if (campaign?.initial_budget) {
          initialBudget = campaign.initial_budget;

        } else {
          initialBudget = 60000;
        }
        
        setInitialDailyBudget(initialBudget);
        
        if (!record?.budget) {
          if (sortedChanges.length > 0) {
            const todayChanges = sortedChanges.filter(change => {
              const changeDate = new Date(change.date);
              const selectedDateObj = new Date(selectedDate);
              return changeDate.toDateString() === selectedDateObj.toDateString();
            });
            
            if (todayChanges.length > 0) {
              setDailyRecord(prev => ({
                ...prev,
                budget: todayChanges[0].new_budget
              }));
            } else {
              setDailyRecord(prev => ({
                ...prev,
                budget: initialBudget
              }));
            }
          } else if (campaign?.initial_budget) {
            setDailyRecord(prev => ({
              ...prev,
              budget: campaign.initial_budget || 60000
            }));
          } else {
            setDailyRecord(prev => ({
              ...prev,
              budget: 60000
            }));
          }
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [campaignId, selectedDate, company_id]);
  
  const getChangeTypeColor = (changeType: string): string => {
    switch (changeType) {
      case 'increase':
        return 'text-green-500';
      case 'decrease':
        return 'text-red-500';
      case 'pause':
        return 'text-yellow-500';
      case 'resume':
        return 'text-blue-500';
      default:
        return 'text-gray-400';
    }
  };
  
  const getChangeTypeIcon = (changeType: string): React.ReactNode => {
    switch (changeType) {
      case 'increase':
        return <FaArrowUp />;
      case 'decrease':
        return <FaArrowDown />;
      case 'pause':
        return <FaPause />;
      case 'resume':
        return <FaPlay />;
      default:
        return <FaCircle />;
    }
  };
  
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'limited':
        return 'bg-orange-500';
      case 'ended':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'paused':
        return 'Pausada';
      case 'limited':
        return 'Limitada';
      case 'ended':
        return 'Finalizada';
      default:
        return 'Desconocido';
    }
  };
  
  const handleDateChange = (date: string) => {
    setSelectedDate(`${date}T12:00:00.000Z`);
  };

  const handleSaveData = async (data: Partial<CampaignDailyRecord>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedRecord = {
        ...dailyRecord,
        ...data,
        campaign_id: campaignId as string,
        date: selectedDate 
      };
      
      const savedRecord = await campaignDailyRecordService.saveDailyRecord(updatedRecord);
      
      if (savedRecord) {
        setDailyRecord(savedRecord);
        setSuccessMessage('Datos guardados correctamente');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error al guardar datos:', err);
      setError('Error al guardar los datos. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (period: string) => {
    setChartPeriod(period);
  };

  const handleSaveNotes = async (notes: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedRecord = {
        ...dailyRecord,
        notes,
        campaign_id: campaignId as string,
        date: selectedDate 
      };
      
      const savedRecord = await campaignDailyRecordService.saveDailyRecord(updatedRecord);
      
      if (savedRecord) {
        setCampaignNotes(notes);
        setDailyRecord(savedRecord);
        setSuccessMessage('Notas guardadas correctamente');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Error al guardar las notas. Por favor, intenta de nuevo.');
      }
    } catch (err) {
      console.error('Error al guardar notas:', err);
      setError('Error al guardar las notas. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBudgetChange = async (data: {
    newBudget: number;
    reason: string;
    changeType: 'increase' | 'decrease' | 'pause' | 'resume';
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const isPauseOrResume = data.changeType === 'pause' || data.changeType === 'resume';
      const now = new Date();
      const selectedDateObj = new Date(selectedDate);
      const dateWithCurrentTime = new Date(
        selectedDateObj.getFullYear(),
        selectedDateObj.getMonth(),
        selectedDateObj.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
      ).toISOString();
      
      const newChange = {
        campaign_id: campaignId as string,
        date: dateWithCurrentTime,
        previous_budget: dailyRecord.budget,
        new_budget: isPauseOrResume ? dailyRecord.budget : data.newBudget,
        reason: data.reason,
        change_type: data.changeType
      };
      const savedChange = await campaignBudgetChangeService.saveBudgetChange(newChange);
      
      if (savedChange) {
        const updatedChanges = [savedChange, ...budgetChanges];
        setBudgetChanges(updatedChanges);
        
        if (!isPauseOrResume) {
          setInitialDailyBudget(data.newBudget);
        }
        
        const updatedRecord = {
          ...dailyRecord,
          budget: isPauseOrResume ? dailyRecord.budget : data.newBudget,
          status: data.changeType === 'pause' ? 'paused' : 
                 data.changeType === 'resume' ? 'active' : 
                 dailyRecord.status,
          campaign_id: campaignId as string,
          date: selectedDate
        };
        
        const savedRecord = await campaignDailyRecordService.saveDailyRecord(updatedRecord);
        
        if (savedRecord) {
          setDailyRecord(savedRecord);
          setSuccessMessage('Cambio de presupuesto guardado correctamente');
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      }
    } catch (err) {
      console.error('Error al guardar cambio de presupuesto:', err);
      setError('Error al guardar el cambio de presupuesto. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Vista Diaria de Campaña"
        description="Control y registro diario de métricas de campaña"
        backLink="/campaign-control"
        actions={
          <CampaignDateSelector
            selectedDate={formattedSelectedDate}
            onDateChange={handleDateChange}
          />
        }
      />
      
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {isLoading && (
        <div className="mb-4 flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Cargando datos...</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-visible">
        <div className="lg:col-span-2 space-y-6">
          <CampaignCurrentData 
            dailyRecord={dailyRecord}
            initialBudget={initialDailyBudget}
            lastBudgetChange={budgetChanges.length > 0 ? 
              // Filtrar cambios para mostrar solo los de la fecha seleccionada
              budgetChanges.filter(change => {
                const changeDate = new Date(change.date);
                const selectedDateObj = new Date(selectedDate);
                return changeDate.toDateString() === selectedDateObj.toDateString();
              })[0] || budgetChanges[0] // Si no hay cambios para hoy, mostrar el más reciente
              : undefined}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            getChangeTypeColor={getChangeTypeColor}
            getChangeTypeIcon={getChangeTypeIcon}
          />

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
              <MetricsChart 
                period={chartPeriod}
                onPeriodChange={handlePeriodChange}
                dailyRecords={dailyRecords}
              />
            </div>

            <div className="md:col-span-1">
              <DailyDataForm 
                dailyRecord={dailyRecord}
                onSave={handleSaveData}
                selectedDate={formattedSelectedDate}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <CampaignNotes 
            initialNotes={campaignNotes}
            onSave={handleSaveNotes}
            selectedDate={formattedSelectedDate}
          />
          
          <BudgetChangeForm 
            currentBudget={dailyRecord.budget}
            onSave={handleBudgetChange}
            selectedDate={formattedSelectedDate}
          />
        </div>
      </div>

      <div className="mt-6 overflow-visible">
        <h2 className="text-xl font-semibold mb-4">Historial de la Campaña</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <CampaignBudgetHistory 
              budgetChanges={budgetChanges}
              getChangeTypeColor={getChangeTypeColor}
              getChangeTypeIcon={getChangeTypeIcon}
            />
          </div>
          
          <div>
            <DailyHistoryTable 
              dailyRecords={dailyRecords}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
