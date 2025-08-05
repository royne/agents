import { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/common/PageHeader';
import CampaignDateSelector from '../../../components/campaign-control/daily-view/CampaignDateSelector';
import DailyDataForm from '../../../components/campaign-control/daily-view/DailyDataForm';
import MetricsChart from '../../../components/campaign-control/daily-view/MetricsChart';
import CampaignNotes from '../../../components/campaign-control/daily-view/CampaignNotes';
import CampaignBudgetHistory from '../../../components/campaign-control/daily-view/CampaignBudgetHistory';
import BudgetChangeForm from '../../../components/campaign-control/daily-view/BudgetChangeForm';
import CampaignCurrentData from '../../../components/campaign-control/daily-view/CampaignCurrentData';
import { useRouter } from 'next/router';
import { CampaignDailyRecord, CampaignBudgetChange } from '../../../types/campaign-control';
import { FaArrowUp, FaArrowDown, FaPause, FaPlay } from 'react-icons/fa';

export default function DailyView() {
  const router = useRouter();
  const { campaignId } = router.query;
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Datos de prueba para DailyDataForm
  const [dailyRecord, setDailyRecord] = useState<CampaignDailyRecord>({
    campaignId: campaignId as string || '1',
    date: selectedDate,
    budget: 200,
    spend: 100,
    revenue: 300,
    units: 10,
    status: 'active',
    notes: 'Notas de prueba'
  });

  // Estado para el gráfico de métricas
  const [chartPeriod, setChartPeriod] = useState<string>('7');
  
  // Estado para las notas de campaña
  const [campaignNotes, setCampaignNotes] = useState<string>('Notas iniciales de prueba para la campaña. Aquí se pueden registrar observaciones importantes sobre el rendimiento diario.');
  
  // Datos de prueba para el historial de cambios de presupuesto
  const [budgetChanges] = useState<CampaignBudgetChange[]>([
    {
      id: '1',
      campaignId: campaignId as string || '1',
      campaignName: 'Campaña de Prueba',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      previousBudget: 100,
      newBudget: 150,
      reason: 'Aumento por buen rendimiento',
      changeType: 'increase'
    },
    {
      id: '2',
      campaignId: campaignId as string || '1',
      campaignName: 'Campaña de Prueba',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      previousBudget: 150,
      newBudget: 200,
      reason: 'Aumento por temporada alta',
      changeType: 'increase'
    },
    {
      id: '3',
      campaignId: campaignId as string || '1',
      campaignName: 'Campaña de Prueba',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      previousBudget: 200,
      newBudget: 200,
      reason: 'Pausa temporal por mantenimiento',
      changeType: 'pause'
    }
  ]);
  
  // Funciones auxiliares para los componentes
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
        return null;
    }
  };
  
  // Funciones para el estado de la campaña
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
    setSelectedDate(date);
  };

  const handleSaveData = (data: Partial<CampaignDailyRecord>) => {
    setDailyRecord(prev => ({ ...prev, ...data }));
    console.log('Datos guardados:', data);
  };

  const handlePeriodChange = (period: string) => {
    setChartPeriod(period);
    console.log('Periodo cambiado:', period);
  };
  
  const handleSaveNotes = (notes: string) => {
    setCampaignNotes(notes);
    console.log('Notas guardadas:', notes);
  };
  
  const handleBudgetChange = (data: {
    newBudget: number;
    reason: string;
    changeType: 'increase' | 'decrease' | 'pause' | 'resume';
  }) => {
    // Crear un nuevo cambio de presupuesto
    const newChange: CampaignBudgetChange = {
      id: (budgetChanges.length + 1).toString(),
      campaignId: campaignId as string || '1',
      campaignName: 'Campaña de Prueba',
      date: new Date().toISOString(),
      previousBudget: dailyRecord.budget,
      newBudget: data.newBudget,
      reason: data.reason,
      changeType: data.changeType
    };
    
    // Actualizar el presupuesto en el registro diario
    setDailyRecord(prev => ({
      ...prev,
      budget: data.changeType === 'pause' ? prev.budget : data.newBudget
    }));
    
    console.log('Cambio de presupuesto registrado:', newChange);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Prueba de Vista Diaria"
        description="Prueba para identificar el problema de scroll"
        backLink="/campaign-control"
        actions={
          <CampaignDateSelector
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
        }
      />
      
      {/* Estructura principal con grid para organizar componentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - 2/3 del ancho en pantallas grandes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Componente CampaignCurrentData */}
          <CampaignCurrentData 
            dailyRecord={dailyRecord}
            lastBudgetChange={budgetChanges[budgetChanges.length - 1]}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            getChangeTypeColor={getChangeTypeColor}
            getChangeTypeIcon={getChangeTypeIcon}
          />
          
          {/* Componente DailyDataForm */}
          <DailyDataForm 
            dailyRecord={dailyRecord}
            onSave={handleSaveData}
          />
          
          {/* Componente MetricsChart */}
          <MetricsChart 
            period={chartPeriod}
            onPeriodChange={handlePeriodChange}
          />
        </div>
        
        {/* Columna derecha - 1/3 del ancho en pantallas grandes */}
        <div className="space-y-6">
          {/* Componente CampaignNotes */}
          <CampaignNotes 
            initialNotes={campaignNotes}
            onSave={handleSaveNotes}
          />
          
          {/* Componente BudgetChangeForm */}
          <BudgetChangeForm 
            currentBudget={dailyRecord.budget}
            onSave={handleBudgetChange}
          />
        </div>
      </div>

      <div className="mt-6">
        {/* Componente CampaignBudgetHistory */}
        <CampaignBudgetHistory 
          budgetChanges={budgetChanges}
          getChangeTypeColor={getChangeTypeColor}
          getChangeTypeIcon={getChangeTypeIcon}
        />
      </div>
    </DashboardLayout>
  );
}
