import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/common/PageHeader';
import { campaignDatabaseService } from '../../../services/database/campaignService';
import { useAppContext } from '../../../contexts/AppContext';
import { 
  FaCalendarAlt, 
  FaChartLine, 
  FaHistory, 
  FaEdit, 
  FaRegChartBar, 
  FaMoneyBillWave, 
  FaExchangeAlt, 
  FaInfoCircle, 
  FaSave,
  FaRegSave,
  FaStickyNote,
  FaBold,
  FaItalic,
  FaListUl,
  FaArrowUp,
  FaArrowDown,
  FaPlay,
  FaPause,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import Link from 'next/link';
import type { Campaign } from '../../../types/database';

// Tipos para los datos quemados
interface CampaignDailyRecord {
  campaignId: string;
  date: string;
  budget: number;
  spend: number;
  units: number; // Unidades vendidas
  revenue: number;
  roas?: number; // Retorno sobre inversión
  status: 'active' | 'paused' | 'limited' | 'learning';
  notes?: string;
}

interface BudgetChange {
  id: string;
  date: string;
  previousBudget: number;
  newBudget: number;
  reason: string;
  changeType: 'increase' | 'decrease' | 'pause' | 'resume';
}

export default function CampaignDailyView() {
  const router = useRouter();
  const { campaignId, date } = router.query;
  const { authData } = useAppContext();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    (date as string) || new Date().toISOString().split('T')[0]
  );
  
  // Datos quemados para el registro diario
  const [dailyRecord, setDailyRecord] = useState<CampaignDailyRecord | null>(null);
  
  // Datos quemados para los cambios de presupuesto
  const [budgetChanges, setBudgetChanges] = useState<BudgetChange[]>([
    {
      id: '1',
      date: '2025-08-01T10:15:00',
      previousBudget: 100,
      newBudget: 150,
      reason: 'Aumento por buen rendimiento',
      changeType: 'increase'
    },
    {
      id: '2',
      date: '2025-07-30T14:22:00',
      previousBudget: 150,
      newBudget: 100,
      reason: 'Reducción por alto CPA',
      changeType: 'decrease'
    },
    {
      id: '3',
      date: '2025-07-28T09:05:00',
      previousBudget: 0,
      newBudget: 150,
      reason: 'Reactivación de campaña',
      changeType: 'resume'
    }
  ]);
  
  // Cargar datos de la campaña
  useEffect(() => {
    const fetchCampaign = async () => {
      if (campaignId && authData?.company_id) {
        try {
          setLoading(true);
          const campaignsData = await campaignDatabaseService.getCampaigns(authData.company_id);
          const foundCampaign = campaignsData.find(c => c.id === campaignId);
          
          if (foundCampaign) {
            setCampaign(foundCampaign);
            
            // Generar datos quemados para la campaña
            const budget = Math.floor(Math.random() * 200) + 50;
            const spend = Math.floor(budget * (Math.random() * 0.4 + 0.6));
            const units = Math.floor(Math.random() * 20) + 1; // Unidades vendidas
            const revenue = units * (Math.floor(Math.random() * 50) + 30);
            const roas = spend > 0 ? revenue / spend : 0;
            
            setDailyRecord({
              campaignId: foundCampaign.id,
              date: selectedDate,
              budget,
              spend,
              units,
              revenue,
              roas,
              status: Math.random() > 0.2 ? 'active' : 
                     Math.random() > 0.5 ? 'limited' : 
                     Math.random() > 0.5 ? 'paused' : 'learning',
              notes: 'Esta campaña está teniendo un buen rendimiento hoy. El CPA se mantiene estable y las conversiones están por encima del promedio.'
            });
          }
        } catch (error) {
          console.error('Error al cargar campaña:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCampaign();
  }, [campaignId, authData, selectedDate]);

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Obtener el color de estado para una campaña
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'limited': return 'bg-orange-500';
      case 'learning': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Obtener el texto de estado para una campaña
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'paused': return 'Pausada';
      case 'limited': return 'Limitada';
      case 'learning': return 'Aprendizaje';
      default: return 'Desconocido';
    }
  };
  
  // Obtener el color para el tipo de cambio
  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'text-green-500';
      case 'decrease': return 'text-red-500';
      case 'pause': return 'text-yellow-500';
      case 'resume': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };
  
  // Obtener el icono para el tipo de cambio
  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return '↑';
      case 'decrease': return '↓';
      case 'pause': return '⏸';
      case 'resume': return '▶';
      default: return '•';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title={campaign ? campaign.name : 'Cargando...'}
          description={campaign ? `Control diario de campaña - ${campaign.cp}` : 'Cargando detalles de la campaña'}
          backLink="/campaign-control"
          actions={
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-400">Fecha:</label>
              <input
                type="date"
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          }
        />

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color mx-auto"></div>
            <p className="mt-2 text-gray-400">Cargando datos de la campaña...</p>
          </div>
        ) : campaign && dailyRecord ? (
          <>
            {/* Contenedor de dos columnas principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Columna izquierda: Datos actuales y registro */}
              <div className="space-y-6">
                {/* Datos actuales */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <FaChartLine className="mr-2 text-primary-color" />
                      Datos Actuales
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full flex items-center ${
                      getStatusColor(dailyRecord.status) === 'bg-green-500' ? 'bg-green-500/20 text-green-400' : 
                      getStatusColor(dailyRecord.status) === 'bg-yellow-500' ? 'bg-yellow-500/20 text-yellow-400' :
                      getStatusColor(dailyRecord.status) === 'bg-orange-500' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      <span className={`${getStatusColor(dailyRecord.status)} w-2 h-2 rounded-full mr-1`}></span>
                      {getStatusText(dailyRecord.status)}
                    </span>
                  </h2>
                  
                  <div className="bg-gray-700 p-4 rounded-lg mb-4">
                    <div className="text-sm text-gray-400">Presupuesto Inicial del Día</div>
                    <div className="text-2xl font-bold">{formatCurrency(dailyRecord.budget)}</div>
                  </div>
                  
                  {/* Último cambio de la bitácora */}
                  {budgetChanges.length > 0 && (
                    <div className="bg-gray-750 p-4 rounded-lg border-l-4 border-primary-color mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className={`text-lg mr-2 ${getChangeTypeColor(budgetChanges[0].changeType)}`}>
                            {getChangeTypeIcon(budgetChanges[0].changeType)}
                          </span>
                          <span className="font-medium">
                            {budgetChanges[0].changeType === 'increase' ? 'Aumento de Presupuesto' :
                             budgetChanges[0].changeType === 'decrease' ? 'Reducción de Presupuesto' :
                             budgetChanges[0].changeType === 'pause' ? 'Campaña Pausada' : 'Campaña Reactivada'}
                          </span>
                        </div>
                        <div className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                          {new Date(budgetChanges[0].date).toLocaleDateString()} - {new Date(budgetChanges[0].date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                      
                      {budgetChanges[0].changeType !== 'pause' && budgetChanges[0].changeType !== 'resume' && (
                        <div className="flex items-center justify-between bg-gray-700 p-2 rounded-lg mb-2">
                          <div className="text-sm">
                            <span className="text-gray-400 mr-2">Anterior:</span>
                            <span className="font-medium">{formatCurrency(budgetChanges[0].previousBudget)}</span>
                          </div>
                          <div className="text-lg font-bold">→</div>
                          <div className="text-sm">
                            <span className="text-gray-400 mr-2">Nuevo:</span>
                            <span className={`font-medium ${budgetChanges[0].changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                              {formatCurrency(budgetChanges[0].newBudget)}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-sm">
                        <span className="text-gray-400">Razón: </span>
                        <span>{budgetChanges[0].reason}</span>
                      </div>
                      
                      <div className="mt-2 text-xs text-primary-color flex items-center">
                        <span className="bg-primary-color/20 px-2 py-0.5 rounded-full">Último cambio</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Registro de datos del día anterior */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <FaEdit className="mr-2 text-primary-color" />
                      Registrar Datos del Día Anterior
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 mr-2">Fecha:</span>
                      <input 
                        type="date" 
                        className="bg-gray-700 border border-gray-600 rounded p-1 text-sm"
                        defaultValue={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Métricas financieras */}
                    <div className="bg-gray-750 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                        <FaMoneyBillWave className="mr-2 text-green-500" />
                        Métricas Financieras
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            Gastos (MXN)
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                              $
                            </span>
                            <input 
                              type="number" 
                              className="w-full bg-gray-700 border border-gray-600 rounded p-2 pl-6"
                              defaultValue={dailyRecord.spend}
                              step="0.01"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            Ingresos (MXN)
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                              $
                            </span>
                            <input 
                              type="number" 
                              className="w-full bg-gray-700 border border-gray-600 rounded p-2 pl-6"
                              defaultValue={dailyRecord.revenue}
                              step="0.01"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Unidades vendidas */}
                    <div className="bg-gray-750 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                        <FaRegChartBar className="mr-2 text-blue-500" />
                        Unidades Vendidas
                      </h3>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            Total de Unidades Vendidas
                          </label>
                          <input 
                            type="number" 
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                            defaultValue={dailyRecord.units || 0}
                            placeholder="Ingresa el número total de unidades vendidas"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Métricas calculadas */}
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-3 flex items-center">
                        <FaChartLine className="mr-2 text-primary-color" />
                        Métricas Financieras Calculadas
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Costo por Unidad */}
                        <div className="bg-gray-750 p-4 rounded-lg border-t-2 border-blue-500">
                          <div className="flex justify-between items-center mb-1">
                            <div className="text-xs text-gray-400 font-medium">Costo por Unidad</div>
                            <div className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                              Gasto/Unidades
                            </div>
                          </div>
                          <div className="flex items-end justify-between">
                            <div className="text-xl font-bold">
                              {dailyRecord.units > 0 ? formatCurrency(dailyRecord.spend / dailyRecord.units) : '-'}
                            </div>
                            <div className="flex items-center text-xs">
                              {(dailyRecord.spend / dailyRecord.units) < 50 ? (
                                <span className="text-green-500 flex items-center">
                                  <FaArrowDown className="mr-1" /> 8%
                                </span>
                              ) : (
                                <span className="text-red-500 flex items-center">
                                  <FaArrowUp className="mr-1" /> 5%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${(dailyRecord.spend / dailyRecord.units) < 50 ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(100, ((dailyRecord.spend / dailyRecord.units) / 100) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* ROAS */}
                        <div className="bg-gray-750 p-4 rounded-lg border-t-2 border-green-500">
                          <div className="flex justify-between items-center mb-1">
                            <div className="text-xs text-gray-400 font-medium">ROAS</div>
                            <div className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                              Retorno/Gasto
                            </div>
                          </div>
                          <div className="flex items-end justify-between">
                            <div className="text-xl font-bold text-green-500">
                              {dailyRecord.spend > 0 ? (dailyRecord.revenue / dailyRecord.spend).toFixed(1) + 'x' : '-'}
                            </div>
                            <div className="flex items-center text-xs">
                              {(dailyRecord.revenue / dailyRecord.spend) > 1.5 ? (
                                <span className="text-green-500 flex items-center">
                                  <FaArrowUp className="mr-1" /> 12%
                                </span>
                              ) : (
                                <span className="text-red-500 flex items-center">
                                  <FaArrowDown className="mr-1" /> 3%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500"
                              style={{ width: `${Math.min(100, ((dailyRecord.revenue / dailyRecord.spend) / 3) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-3">
                      <div className="text-xs text-gray-400 flex items-center">
                        <FaInfoCircle className="mr-2 text-primary-color" />
                        Última actualización: {new Date().toLocaleDateString()} a las {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      
                      <div className="flex space-x-3">
                        <button 
                          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center transition-all duration-200"
                          onClick={() => console.log('Cancelar registro de datos')}
                        >
                          <FaRegSave className="mr-2 opacity-70" />
                          Guardar borrador
                        </button>
                        <button 
                          className="bg-primary-color hover:bg-blue-600 text-white px-6 py-2 rounded-md flex items-center font-medium transition-all duration-200 shadow-lg shadow-blue-500/20"
                          onClick={() => console.log('Guardar datos diarios')}
                        >
                          <FaSave className="mr-2" />
                          Guardar Datos
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Registro de cambios de presupuesto o estado */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <FaEdit className="mr-2 text-primary-color" />
                      Registrar Cambio
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 mr-2">Fecha efectiva:</span>
                      <input 
                        type="date" 
                        className="bg-gray-700 border border-gray-600 rounded p-1 text-sm"
                        defaultValue={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-750 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                        <FaExchangeAlt className="mr-2 text-yellow-500" />
                        Detalles del Cambio
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            Tipo de Cambio
                          </label>
                          <select 
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                            onChange={(e) => {
                              // Aquí se implementaría la lógica para mostrar/ocultar campos según el tipo
                              // Por ahora es solo UI
                            }}
                          >
                            <option value="increase">Aumento de Presupuesto</option>
                            <option value="decrease">Reducción de Presupuesto</option>
                            <option value="pause">Pausar Campaña</option>
                            <option value="resume">Reactivar Campaña</option>
                            <option value="status">Cambio de Estado</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            Estado Actual
                          </label>
                          <div className="flex items-center bg-gray-700 border border-gray-600 rounded p-2 h-[38px]">
                            <span className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(dailyRecord.status)}`}></span>
                            <span>{getStatusText(dailyRecord.status)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            Presupuesto Actual
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                              $
                            </span>
                            <input 
                              type="number" 
                              className="w-full bg-gray-700 border border-gray-600 rounded p-2 pl-6"
                              value={dailyRecord.budget}
                              disabled
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            Nuevo Presupuesto
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                              $
                            </span>
                            <input 
                              type="number" 
                              className="w-full bg-gray-700 border border-gray-600 rounded p-2 pl-6"
                              defaultValue={dailyRecord.budget}
                              step="50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-750 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                        <FaInfoCircle className="mr-2 text-blue-500" />
                        Justificación
                      </h3>
                      
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Razón del Cambio
                        </label>
                        <select className="w-full bg-gray-700 border border-gray-600 rounded p-2 mb-3">
                          <option value="">Seleccionar razón...</option>
                          <option value="performance">Rendimiento de la campaña</option>
                          <option value="budget">Ajuste de presupuesto</option>
                          <option value="seasonal">Temporada/Evento especial</option>
                          <option value="strategy">Cambio de estrategia</option>
                          <option value="other">Otra razón</option>
                        </select>
                        
                        <label className="block text-xs text-gray-400 mb-1">
                          Detalles
                        </label>
                        <textarea 
                          className="w-full bg-gray-700 border border-gray-600 rounded p-2 resize-none"
                          placeholder="Explica en detalle la razón del cambio..."
                          rows={3}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-400">
                        <span className="inline-flex items-center">
                          <FaInfoCircle className="mr-1" />
                          Los cambios quedarán registrados en la bitácora
                        </span>
                      </div>
                      <div className="flex space-x-3">
                        <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">
                          Cancelar
                        </button>
                        <button className="bg-primary-color hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center">
                          <FaSave className="mr-2" />
                          Registrar Cambio
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Columna derecha: Historial y tendencia */}
              <div className="space-y-6">
                {/* Gráfico de tendencia */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <FaRegChartBar className="mr-2 text-primary-color" />
                      Tendencia y Análisis
                    </div>
                    <div>
                      <select className="bg-gray-700 border border-gray-600 rounded p-1 text-sm">
                        <option value="3">3 días</option>
                        <option value="7">7 días</option>
                        <option value="14">14 días</option>
                        <option value="30">30 días</option>
                      </select>
                    </div>
                  </h2>
                  
                  <div className="bg-gray-750 rounded-lg p-4 mb-4">
                    {/* Selector de métricas */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <button className="bg-primary-color px-3 py-1 rounded text-xs font-medium">
                        CPA
                      </button>
                      <button className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-xs">
                        ROAS
                      </button>
                      <button className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-xs">
                        Conversiones
                      </button>
                      <button className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-xs">
                        Gastos
                      </button>
                      <button className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-xs">
                        Ingresos
                      </button>
                    </div>
                    
                    {/* Gráfico simulado */}
                    <div className="h-[200px] w-full bg-gray-700 rounded-lg p-3 flex items-center justify-center">
                      <div className="relative w-full h-full">
                        {/* Eje Y */}
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-400 py-2">
                          <div>$500</div>
                          <div>$400</div>
                          <div>$300</div>
                          <div>$200</div>
                          <div>$100</div>
                          <div>$0</div>
                        </div>
                        
                        {/* Contenido del gráfico */}
                        <div className="absolute left-12 right-0 top-0 bottom-0">
                          {/* Líneas horizontales de referencia */}
                          <div className="h-full w-full flex flex-col justify-between">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                              <div key={i} className="border-t border-gray-600 w-full h-0"></div>
                            ))}
                          </div>
                          
                          {/* Barras simuladas */}
                          <div className="absolute inset-0 flex items-end justify-around">
                            <div className="w-[15%] bg-gradient-to-t from-blue-500/80 to-blue-500/20 rounded-t-sm" style={{ height: '40%' }}>
                              <div className="text-center text-xs mt-2 text-blue-300">$200</div>
                            </div>
                            <div className="w-[15%] bg-gradient-to-t from-blue-500/80 to-blue-500/20 rounded-t-sm" style={{ height: '60%' }}>
                              <div className="text-center text-xs mt-2 text-blue-300">$300</div>
                            </div>
                            <div className="w-[15%] bg-gradient-to-t from-blue-500/80 to-blue-500/20 rounded-t-sm" style={{ height: '50%' }}>
                              <div className="text-center text-xs mt-2 text-blue-300">$250</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Leyenda del eje X */}
                    <div className="flex justify-around mt-2 text-xs text-gray-400">
                      <div>{new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                      <div>{new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                      <div>{new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  {/* Estadísticas de resumen */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-750 p-3 rounded-lg">
                      <div className="text-xs text-gray-400">CPA Promedio</div>
                      <div className="text-lg font-bold">{formatCurrency(250)}</div>
                      <div className="text-xs text-green-500 flex items-center">
                        <span className="mr-1">↓</span> 5% vs periodo anterior
                      </div>
                    </div>
                    
                    <div className="bg-gray-750 p-3 rounded-lg">
                      <div className="text-xs text-gray-400">ROAS Promedio</div>
                      <div className="text-lg font-bold text-green-500">2.4x</div>
                      <div className="text-xs text-green-500 flex items-center">
                        <span className="mr-1">↑</span> 12% vs periodo anterior
                      </div>
                    </div>
                    
                    <div className="bg-gray-750 p-3 rounded-lg">
                      <div className="text-xs text-gray-400">Conversiones</div>
                      <div className="text-lg font-bold text-blue-500">24</div>
                      <div className="text-xs text-red-500 flex items-center">
                        <span className="mr-1">↓</span> 3% vs periodo anterior
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* La sección de Bitácora de Cambios Recientes ha sido eliminada y el último cambio se muestra ahora en la sección de Datos Actuales */}
                
                {/* Notas del día */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <FaStickyNote className="mr-2 text-primary-color" />
                      Notas Importantes
                    </div>
                    <div className="text-xs text-gray-400">
                      Última actualización: {new Date().toLocaleDateString()}
                    </div>
                  </h2>
                  
                  <div className="bg-gray-750 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-3">
                      <div className="flex space-x-2">
                        <button className="bg-gray-700 hover:bg-gray-600 p-1 rounded text-xs">
                          <FaBold className="text-gray-300" />
                        </button>
                        <button className="bg-gray-700 hover:bg-gray-600 p-1 rounded text-xs">
                          <FaItalic className="text-gray-300" />
                        </button>
                        <button className="bg-gray-700 hover:bg-gray-600 p-1 rounded text-xs">
                          <FaListUl className="text-gray-300" />
                        </button>
                      </div>
                      <div className="ml-auto flex items-center">
                        <div className="text-xs text-gray-400 mr-2">Categoría:</div>
                        <select className="bg-gray-700 border border-gray-600 rounded p-1 text-xs">
                          <option value="general">General</option>
                          <option value="importante">Importante</option>
                          <option value="seguimiento">Seguimiento</option>
                          <option value="optimizacion">Optimización</option>
                        </select>
                      </div>
                    </div>
                    
                    <textarea 
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-4 text-white"
                      rows={4}
                      value={dailyRecord.notes || ''}
                      onChange={(e) => setDailyRecord({...dailyRecord, notes: e.target.value})}
                      placeholder="Añade notas importantes sobre la campaña..."
                    />
                  </div>
                  
                  {/* Historial de notas anteriores */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-300">Notas anteriores</h3>
                      <button className="text-xs text-primary-color hover:underline">Ver todas</button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="bg-gray-700 p-3 rounded-lg border-l-2 border-yellow-500">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-yellow-500">Importante</span>
                          <span className="text-xs text-gray-400">01/08/2025</span>
                        </div>
                        <p className="text-sm">Campaña con rendimiento por debajo del objetivo. Considerar ajuste de presupuesto.</p>
                      </div>
                      
                      <div className="bg-gray-700 p-3 rounded-lg border-l-2 border-blue-500">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-blue-500">Seguimiento</span>
                          <span className="text-xs text-gray-400">31/07/2025</span>
                        </div>
                        <p className="text-sm">Nuevos creativos implementados. Monitorear CTR durante los próximos días.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center">
                      <FaRegSave className="mr-2" />
                      Guardar como borrador
                    </button>
                    <button className="bg-primary-color hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center">
                      <FaSave className="mr-2" />
                      Publicar nota
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Historial completo de cambios */}
            <div id="historial-completo" className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaHistory className="mr-2 text-primary-color" />
                Historial Completo de Cambios
              </h2>
              
              {/* Filtros */}
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex-grow md:flex-grow-0">
                  <label className="block text-xs text-gray-400 mb-1">Tipo de Cambio</label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded p-1.5 text-sm">
                    <option value="">Todos</option>
                    <option value="increase">Aumento de Presupuesto</option>
                    <option value="decrease">Reducción de Presupuesto</option>
                    <option value="pause">Pausar Campaña</option>
                    <option value="resume">Reactivar Campaña</option>
                  </select>
                </div>
                
                <div className="flex-grow md:flex-grow-0">
                  <label className="block text-xs text-gray-400 mb-1">Desde</label>
                  <input 
                    type="date" 
                    className="w-full bg-gray-700 border border-gray-600 rounded p-1.5 text-sm"
                  />
                </div>
                
                <div className="flex-grow md:flex-grow-0">
                  <label className="block text-xs text-gray-400 mb-1">Hasta</label>
                  <input 
                    type="date" 
                    className="w-full bg-gray-700 border border-gray-600 rounded p-1.5 text-sm"
                  />
                </div>
                
                <div className="flex-grow md:flex-grow-0 self-end">
                  <button className="w-full bg-primary-color hover:bg-blue-600 text-white px-4 py-1.5 rounded text-sm">
                    Filtrar
                  </button>
                </div>
              </div>
              
              {/* Tabla de cambios */}
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha</th>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tipo</th>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Cambio</th>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Razón</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetChanges.map((change, index) => (
                      <tr key={change.id} className={index % 2 === 0 ? 'bg-gray-750' : 'bg-gray-700'}>
                        <td className="py-2 px-4 text-sm">
                          <div>{new Date(change.date).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-400">{new Date(change.date).toLocaleTimeString()}</div>
                        </td>
                        <td className="py-2 px-4">
                          <span className="inline-flex items-center">
                            <span className={`text-lg mr-2 ${getChangeTypeColor(change.changeType)}`}>
                              {getChangeTypeIcon(change.changeType)}
                            </span>
                            <span>
                              {change.changeType === 'increase' ? 'Aumento' :
                               change.changeType === 'decrease' ? 'Reducción' :
                               change.changeType === 'pause' ? 'Pausa' : 'Reactivación'}
                            </span>
                          </span>
                        </td>
                        <td className="py-2 px-4 text-sm">
                          {change.changeType !== 'pause' && change.changeType !== 'resume' ? (
                            <span>
                              {formatCurrency(change.previousBudget)} → {formatCurrency(change.newBudget)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-2 px-4 text-sm">{change.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Paginación */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-400">
                  Mostrando {budgetChanges.length} cambios
                </div>
                <div className="flex space-x-2">
                  <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm disabled:opacity-50" disabled>
                    Anterior
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm disabled:opacity-50" disabled>
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <p className="text-gray-400">No se encontró la campaña o ocurrió un error al cargar los datos.</p>
            <Link href="/campaign-control">
              <button className="mt-4 bg-primary-color hover:bg-blue-600 text-white px-4 py-2 rounded">
                Volver al Dashboard
              </button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
