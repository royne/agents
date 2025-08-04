import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { campaignDatabaseService } from '../../services/database/campaignService';
import { useAppContext } from '../../contexts/AppContext';
import { 
  FaCalendarAlt, 
  FaChartLine, 
  FaRegStickyNote, 
  FaExternalLinkAlt,
  FaMoneyBillWave, 
  FaHistory,
  FaBell,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEdit,
  FaArrowUp,
  FaArrowDown,
  FaPause,
  FaPlay,
  FaRegChartBar
} from 'react-icons/fa';
import Link from 'next/link';
import type { Campaign } from '../../types/database';
import { 
  CampaignDailyRecord, 
  CampaignBudgetChange, 
  DailySummary,
  CampaignWithDailyData 
} from '../../types/campaign-control';

export default function CampaignControl() {
  const { authData } = useAppContext();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsWithData, setCampaignsWithData] = useState<CampaignWithDailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Función para formatear moneda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

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

  // Obtener el color de fondo de estado para una campaña
  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100';
      case 'paused': return 'bg-yellow-100';
      case 'limited': return 'bg-orange-100';
      case 'learning': return 'bg-blue-100';
      default: return 'bg-gray-100';
    }
  };
  
  // Obtener un ícono para el estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <FaCheckCircle className="text-green-500" />;
      case 'paused': return <FaPause className="text-yellow-500" />;
      case 'limited': return <FaExclamationTriangle className="text-orange-500" />;
      case 'learning': return <FaPlay className="text-blue-500" />;
      default: return <FaCheckCircle className="text-gray-500" />;
    }
  };

  // Obtener un ícono para el tipo de cambio
  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return <FaArrowUp className="text-green-500" />;
      case 'decrease': return <FaArrowDown className="text-orange-500" />;
      case 'pause': return <FaPause className="text-yellow-500" />;
      case 'resume': return <FaPlay className="text-green-500" />;
      default: return <FaEdit className="text-gray-500" />;
    }
  };

  // Filtrar campañas según si necesitan actualización
  const campaignsNeedingUpdate = campaignsWithData.filter(campaign => campaign.needsUpdate);

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
          {/* Fecha y selección de día */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FaCalendarAlt className="text-lg text-primary-color" />
              <h2 className="text-xl font-bold">Fecha: {new Date(selectedDate).toLocaleDateString()}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>
          </div>
          
          {/* Contenedor de tres columnas para Resumen Diario, Últimos Cambios y Pendientes de Registrar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Resumen del día */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaChartLine className="mr-2 text-primary-color" />
                Resumen Diario
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-400">Presupuesto Total</div>
                  <div className="text-2xl font-bold">{formatCurrency(dailySummary.totalBudget)}</div>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-400">Campañas Activas</div>
                  <div className="text-2xl font-bold">{dailySummary.activeCampaigns}</div>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-400">Pendientes de Actualizar</div>
                  <div className="text-2xl font-bold text-yellow-500">{dailySummary.campaignsNeedingUpdate}</div>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-400">Ingresos del Día</div>
                  <div className="text-2xl font-bold text-green-500">{formatCurrency(dailySummary.totalRevenue)}</div>
                </div>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <FaRegStickyNote className="text-primary-color mr-2" />
                    <div className="font-medium">Notas del día:</div>
                  </div>
                  <button className="text-primary-color hover:text-blue-400">
                    <FaEdit />
                  </button>
                </div>
                <div className="mt-2 text-sm">
                  {dailySummary.notes}
                </div>
              </div>
            </div>
            
            {/* Últimos cambios importantes */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaBell className="mr-2 text-primary-color" />
                Últimos Cambios y Notificaciones
              </h2>
              
              {recentChanges.length > 0 ? (
                <div className="space-y-3">
                  {recentChanges.map(change => (
                    <div key={change.id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3 mt-1">
                          {getChangeTypeIcon(change.changeType)}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <div>
                              <span className="font-medium">{change.campaignName}</span>
                              <span className="text-sm text-gray-400 ml-2">
                                {change.changeType === 'increase' ? 'Aumento de presupuesto' :
                                change.changeType === 'decrease' ? 'Reducción de presupuesto' :
                                change.changeType === 'pause' ? 'Campaña pausada' : 'Campaña reactivada'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-400">
                              {new Date(change.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <div className="mt-1 text-sm">{change.reason}</div>
                          {(change.changeType === 'increase' || change.changeType === 'decrease') && (
                            <div className="mt-1 text-sm">
                              <span className="text-gray-400">{formatCurrency(change.previousBudget)}</span>
                              <span className="mx-2">→</span>
                              <span className={change.changeType === 'increase' ? 'text-green-400' : 'text-yellow-400'}>
                                {formatCurrency(change.newBudget)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end mt-2">
                        <Link href={`/campaign-control/${change.campaignId}/daily-view`} className="text-primary-color hover:text-blue-400 flex items-center text-xs">
                          Ver detalles
                          <FaExternalLinkAlt className="ml-1 text-xs" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  No hay cambios recientes para mostrar
                </div>
              )}
            </div>
            
            {/* Campañas que necesitan actualización */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaEdit className="mr-2 text-yellow-500" />
                Pendientes de Registrar ({campaignsNeedingUpdate.length})
              </h2>
            
            <div>
              {campaignsNeedingUpdate.length > 0 ? (
                <div className="space-y-3">
                  {campaignsNeedingUpdate.map(campaign => (
                    <div key={campaign.id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div className="mr-2">{getStatusIcon(campaign.dailyData.status)}</div>
                          <div>
                            <div className="font-medium">{campaign.name}</div>
                            <div className="text-xs text-gray-400">
                              {campaign.platform || 'N/A'} | {formatCurrency(campaign.dailyData.budget)}
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className="inline-flex items-center text-sm px-2 py-1 rounded-full" 
                                style={{ backgroundColor: getStatusColor(campaign.dailyData.status) + '20' }}>
                            {getStatusText(campaign.dailyData.status)}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-end mt-3">
                        <Link href={`/campaign-control/${campaign.id}/daily-view`} 
                              className="text-primary-color hover:text-blue-400 inline-flex items-center text-sm">
                          <span className="mr-1">Registrar</span>
                          <FaExternalLinkAlt className="text-xs" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  No hay campañas pendientes de actualizar
                </div>
              )}
            </div>
            </div>
          </div>
          
          {/* Todas las campañas */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaMoneyBillWave className="mr-2 text-primary-color" />
              Todas las Campañas ({campaignsWithData.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaignsWithData.length > 0 ? campaignsWithData.map(campaign => (
                <div key={campaign.id} className="bg-gray-700 rounded-lg p-4 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium truncate flex-grow">{campaign.name}</h3>
                    <div className="ml-2 flex items-center">
                      {getStatusIcon(campaign.dailyData.status)}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-1">
                    {campaign.platform || 'N/A'} | Ppto: {formatCurrency(campaign.dailyData.budget)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div>
                      <div className="text-xs text-gray-400">Unidades Vendidas</div>
                      <div>{campaign.dailyData.units || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Ingresos Día Anterior</div>
                      <div>{campaign.dailyData.revenue ? formatCurrency(campaign.dailyData.revenue) : '$0'}</div>
                    </div>
                  </div>
                  
                  {campaign.needsUpdate && (
                    <div className="mt-2 bg-yellow-900/20 text-yellow-500 text-xs p-2 rounded">
                      Pendiente de actualizar
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-3">
                    <Link href={`/campaign-control/${campaign.id}/daily-view`} className="text-primary-color hover:text-blue-400 flex items-center text-sm">
                      Ver detalles
                      <FaExternalLinkAlt className="ml-1 text-xs" />
                    </Link>
                  </div>
                </div>
              )) : (
                <div className="col-span-3 text-center py-10 text-gray-400">
                  No hay campañas para mostrar
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
