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

  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getTodayDateString = (): string => {
    const today = new Date();
    // Ajustar a la zona horaria local y formatear como YYYY-MM-DD
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Estado para la fecha seleccionada (incluye hora completa para evitar problemas de UI)
  const [selectedDate, setSelectedDate] = useState<string>(
    `${getTodayDateString()}T12:00:00.000Z` // Usar mediodía para evitar problemas de zona horaria
  );
  
  // Fecha formateada para mostrar en la UI (solo YYYY-MM-DD)
  const formattedSelectedDate = useMemo(() => {
    return selectedDate.split('T')[0];
  }, [selectedDate]);
  // Estado para el período del gráfico
  const [chartPeriod, setChartPeriod] = useState<string>('7d');
  // Estado para indicar carga de datos
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Estado para errores
  const [error, setError] = useState<string | null>(null);
  // Estado para mensajes de éxito
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Estado para el registro diario actual
  const [dailyRecord, setDailyRecord] = useState<CampaignDailyRecord>({
    id: '',
    campaign_id: campaignId as string,
    date: selectedDate,
    budget: 0,
    spend: 0,
    revenue: 0,
    units: 0,
    units_sold: 0,
    sales: 0,
    status: 'active',
    notes: ''
  });
  
  // Estado para el presupuesto inicial del día (antes de cualquier cambio)
  const [initialDailyBudget, setInitialDailyBudget] = useState<number | undefined>(undefined);
  
  // Estado para las notas de campaña
  const [campaignNotes, setCampaignNotes] = useState<string>('');
  
  // Estado para el historial de cambios de presupuesto
  const [budgetChanges, setBudgetChanges] = useState<CampaignBudgetChange[]>([]);
  
  // Estado para el historial de registros diarios
  const [dailyRecords, setDailyRecords] = useState<CampaignDailyRecord[]>([]);
  
  // Cargar datos cuando cambia la fecha o el ID de campaña
  useEffect(() => {
    // Solo cargar si tenemos un campaignId válido y company_id
    if (!campaignId || !company_id) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 0. Cargar la información completa de la campaña para tener acceso al initial_budget
        const campaign = await campaignDatabaseService.getCampaignById(campaignId as string, company_id);
        
        // 1. Cargar el registro diario
        console.log('Cargando registro diario para fecha completa:', selectedDate);
        console.log('Fecha formateada para UI:', formattedSelectedDate);
        const record = await campaignDailyRecordService.getDailyRecord(
          campaignId as string,
          selectedDate
        );
        console.log('Registro diario cargado:', record);
        
        // Si no existe registro para este día, crear uno con valores predeterminados
        if (record) {
          setDailyRecord(record);
          // Actualizar también las notas si existen
          if (record.notes) {
            console.log('Notas encontradas para la fecha:', selectedDate, 'Notas:', record.notes);
            setCampaignNotes(record.notes);
          } else {
            console.log('No se encontraron notas para la fecha:', selectedDate);
            setCampaignNotes('');
          }
        } else {
          // Crear un nuevo registro con valores predeterminados
          setDailyRecord({
            campaign_id: campaignId as string,
            date: selectedDate,
            budget: initialDailyBudget || 0,
            spend: 0,
            revenue: 0,
            units: 0,
            units_sold: 0,
            sales: 0,
            status: 'active',
            notes: ''
          });
          setCampaignNotes('');
        }
        
        // 2. Cargar el historial de cambios de presupuesto
        const changes = await campaignBudgetChangeService.getBudgetChanges(
          campaignId as string
        );
        
        // 3. Cargar el historial de registros diarios
        const records = await campaignDailyRecordService.getCampaignDailyRecords(campaignId as string);
        
        // Ordenar los cambios por fecha para asegurarnos que estén en orden correcto
        const sortedChanges = [...changes].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setBudgetChanges(sortedChanges);
        setDailyRecords(records);
        
        // 3. Establecer el presupuesto según prioridades:
        // a. Si ya hay un presupuesto definido en el registro diario, mantenerlo
        // b. Si hay cambios de presupuesto, usar el más reciente
        // c. Si no hay registro ni cambios, usar el presupuesto inicial de la campaña (default: 60000)
        
        // Calcular el presupuesto inicial del día (el último cambio de presupuesto)
        let initialBudget: number;
        
        // CORRECCIÓN: El presupuesto inicial del día debe ser el último cambio de presupuesto
        // independientemente de la fecha, ya que representa el presupuesto actual
        if (sortedChanges.length > 0) {
          // El presupuesto inicial es el último cambio de presupuesto (el más reciente)
          initialBudget = sortedChanges[0].new_budget;
          console.log('Presupuesto inicial basado en último cambio:', initialBudget);
        } else if (campaign?.initial_budget) {
          // No hay cambios, usar el presupuesto inicial de la campaña
          initialBudget = campaign.initial_budget;
          console.log('Presupuesto inicial basado en campaña:', initialBudget);
        } else {
          // Fallback al valor por defecto
          initialBudget = 60000;
          console.log('Presupuesto inicial por defecto:', initialBudget);
        }
        
        // Guardar el presupuesto inicial del día
        setInitialDailyBudget(initialBudget);
        
        // Establecer el presupuesto actual del registro diario
        if (!record?.budget) {
          if (sortedChanges.length > 0) {
            // Usar el cambio más reciente para la fecha actual
            const todayChanges = sortedChanges.filter(change => {
              const changeDate = new Date(change.date);
              const selectedDateObj = new Date(selectedDate);
              return changeDate.toDateString() === selectedDateObj.toDateString();
            });
            
            if (todayChanges.length > 0) {
              // Hay cambios para hoy, usar el más reciente
              setDailyRecord(prev => ({
                ...prev,
                budget: todayChanges[0].new_budget
              }));
            } else {
              // No hay cambios para hoy, usar el presupuesto inicial
              setDailyRecord(prev => ({
                ...prev,
                budget: initialBudget
              }));
            }
          } else if (campaign?.initial_budget) {
            // No hay cambios, usar el presupuesto inicial de la campaña
            setDailyRecord(prev => ({
              ...prev,
              budget: campaign.initial_budget || 60000
            }));
          } else {
            // Fallback al valor por defecto
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
        return <FaCircle />;
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
  
  // Manejadores de eventos para los componentes
  const handleDateChange = (date: string) => {
    // Asegurarse de que la fecha incluya la hora para evitar problemas de UI
    // Usar siempre mediodía (12:00:00) para evitar problemas de zona horaria
    setSelectedDate(`${date}T12:00:00.000Z`);
    console.log(`Fecha cambiada a: ${date}T12:00:00.000Z`);
  };

  const handleSaveData = async (data: Partial<CampaignDailyRecord>) => {
    // Mostrar indicador de carga
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Guardando datos diarios para la fecha completa:', selectedDate);
      console.log('Fecha formateada para UI:', formattedSelectedDate);
      
      // Crear objeto con los datos actualizados
      const updatedRecord = {
        ...dailyRecord,
        ...data,
        campaign_id: campaignId as string,
        date: selectedDate, // Usamos la fecha con formato completo
        // Mantener sincronizados los campos units_sold y sales con units y revenue
        units_sold: data.units || dailyRecord.units,
        sales: data.revenue || dailyRecord.revenue
      };
      
      console.log('Guardando registro con fecha:', selectedDate);
      
      // Guardar en la base de datos
      const savedRecord = await campaignDailyRecordService.saveDailyRecord(updatedRecord);
      
      if (savedRecord) {
        // Actualizar el estado local con los datos guardados
        setDailyRecord(savedRecord);
        setSuccessMessage('Datos guardados correctamente');
        // Limpiar el mensaje después de 3 segundos
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
    // En el futuro, aquí cargaríamos datos históricos para el nuevo período
    console.log('Cambiando período a:', period);
  };

  const handleSaveNotes = async (notes: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Guardando notas para la fecha completa:', selectedDate);
      console.log('Fecha formateada para UI:', formattedSelectedDate);
      
      // Actualizar el registro diario con las nuevas notas
      const updatedRecord = {
        ...dailyRecord,
        notes,
        campaign_id: campaignId as string,
        date: selectedDate // Usamos la fecha con formato completo
      };
      
      console.log('Registro a guardar:', updatedRecord);
      
      // Guardar en la base de datos
      const savedRecord = await campaignDailyRecordService.saveDailyRecord(updatedRecord);
      
      if (savedRecord) {
        console.log('Registro guardado exitosamente:', savedRecord);
        
        // Actualizar el estado local
        setCampaignNotes(notes);
        setDailyRecord(savedRecord);
        setSuccessMessage('Notas guardadas correctamente');
        
        // Limpiar el mensaje después de 3 segundos
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        console.log('No se pudo guardar el registro');
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
      // Para pausar o reactivar, no modificamos el presupuesto
      // Solo registramos el cambio de estado
      const isPauseOrResume = data.changeType === 'pause' || data.changeType === 'resume';
      
      // REGLA IMPORTANTE: Para pausar o reactivar, previous_budget y new_budget deben ser IGUALES
      // y deben ser iguales al presupuesto actual (dailyRecord.budget)
      
      // Crear una fecha con la fecha seleccionada pero con la hora actual
      const now = new Date();
      const selectedDateObj = new Date(selectedDate);
      // Mantener la fecha seleccionada pero usar la hora actual
      const dateWithCurrentTime = new Date(
        selectedDateObj.getFullYear(),
        selectedDateObj.getMonth(),
        selectedDateObj.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
      ).toISOString();
      
      console.log('Fecha con hora actual:', dateWithCurrentTime);
      
      // Crear el objeto de cambio de presupuesto
      const newChange = {
        campaign_id: campaignId as string,
        date: dateWithCurrentTime, // Usamos la fecha seleccionada con la hora actual
        // Para pausar o reactivar, usamos el mismo presupuesto en ambos campos
        previous_budget: dailyRecord.budget,
        new_budget: isPauseOrResume ? dailyRecord.budget : data.newBudget,
        reason: data.reason,
        change_type: data.changeType
        // Eliminamos created_by ya que no tenemos un UUID válido para asignar
        // y la tabla espera un UUID
      };
      
      console.log('Guardando cambio de presupuesto para la fecha completa:', selectedDate);
      console.log('Fecha formateada para UI:', formattedSelectedDate);
      console.log('Tipo de cambio:', data.changeType);
      console.log('Presupuesto anterior:', newChange.previous_budget);
      console.log('Nuevo presupuesto:', newChange.new_budget);
      
      // Guardar el cambio de presupuesto en la base de datos
      const savedChange = await campaignBudgetChangeService.saveBudgetChange(newChange);
      
      if (savedChange) {
        // Actualizar la lista de cambios con el nuevo cambio
        const updatedChanges = [savedChange, ...budgetChanges];
        setBudgetChanges(updatedChanges);
        
        // Actualizar el presupuesto inicial del día inmediatamente
        // El presupuesto inicial debe ser el último cambio de presupuesto
        if (!isPauseOrResume) {
          // Solo actualizamos el presupuesto inicial si es un cambio real de presupuesto
          setInitialDailyBudget(data.newBudget);
          console.log('Actualizando presupuesto inicial a:', data.newBudget);
        }
        
        // Actualizar el registro diario
        const updatedRecord = {
          ...dailyRecord,
          budget: isPauseOrResume ? dailyRecord.budget : data.newBudget,
          status: data.changeType === 'pause' ? 'paused' : 
                 data.changeType === 'resume' ? 'active' : 
                 dailyRecord.status,
          campaign_id: campaignId as string,
          date: selectedDate,
          // Mantener sincronizados los campos units_sold y sales con units y revenue
          units_sold: dailyRecord.units,
          sales: dailyRecord.revenue
        };
        
        // Guardar el registro diario actualizado
        const savedRecord = await campaignDailyRecordService.saveDailyRecord(updatedRecord);
        
        if (savedRecord) {
          setDailyRecord(savedRecord);
          setSuccessMessage('Cambio de presupuesto guardado correctamente');
          // Limpiar el mensaje después de 3 segundos
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
      
      {/* Mostrar mensaje de error si existe */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* Mostrar indicador de carga */}
      {isLoading && (
        <div className="mb-4 flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Cargando datos...</span>
        </div>
      )}
      
      {/* Estructura principal con grid para organizar componentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-visible">
        {/* Columna izquierda - 2/3 del ancho en pantallas grandes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Componente CampaignCurrentData */}
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
          
          {/* Componente DailyDataForm */}
          <DailyDataForm 
            dailyRecord={dailyRecord}
            onSave={handleSaveData}
            selectedDate={formattedSelectedDate}
          />
          
          {/* Componente MetricsChart */}
          <MetricsChart 
            period={chartPeriod}
            onPeriodChange={handlePeriodChange}
            dailyRecords={dailyRecords}
          />
        </div>
        
        {/* Columna derecha - 1/3 del ancho en pantallas grandes */}
        <div className="space-y-6">
          {/* Componente CampaignNotes */}
          <CampaignNotes 
            initialNotes={campaignNotes}
            onSave={handleSaveNotes}
            selectedDate={formattedSelectedDate}
          />
          
          {/* Componente BudgetChangeForm */}
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
          {/* Columna 1: Historial de cambios de presupuesto */}
          <div>
            <CampaignBudgetHistory 
              budgetChanges={budgetChanges}
              getChangeTypeColor={getChangeTypeColor}
              getChangeTypeIcon={getChangeTypeIcon}
            />
          </div>
          
          {/* Columna 2: Historial diario de la campaña */}
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
