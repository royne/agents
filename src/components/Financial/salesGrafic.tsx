import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { salesDatabaseService } from '../../services/database/salesService';
import { expensesDatabaseService } from '../../services/database/expensesService';
import { campaignDatabaseService } from '../../services/database/campaignService';
import { adDatabaseService } from '../../services/database/adService';
import { useAppContext } from '../../contexts/AppContext';
import type { Campaign, Advertisement, Sale, DailyExpenses } from '../../types/database';
import { getCurrentLocalDate, getTodayString, formatDateForInput } from '../../utils/dateUtils';

interface ChartData {
  date: string;
  ventas: number;
  gastos: number;
  ventasCount: number;
}

interface SalesGraficProps {
  periodDays?: number;
}

const SalesGrafic = ({ periodDays = 1 }: SalesGraficProps) => {
  const [rawSales, setRawSales] = useState<Sale[]>([]);
  const [rawExpenses, setRawExpenses] = useState<DailyExpenses[]>([]);
  const [data, setData] = useState<ChartData[]>([]);
  const [filteredData, setFilteredData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [selectedAd, setSelectedAd] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [selectedView, setSelectedView] = useState<string>('barra');
  const [showOnlyToday, setShowOnlyToday] = useState<boolean>(true);
  const [customDateRange, setCustomDateRange] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>(formatDateForInput(new Date()));
  const [endDate, setEndDate] = useState<string>(formatDateForInput(new Date()));
  const { authData } = useAppContext();

  const totalVentas = filteredData.reduce((sum, item) => sum + item.ventas, 0);
  const totalGastos = filteredData.reduce((sum, item) => sum + item.gastos, 0);
  const totalVentasCount = filteredData.reduce((sum, item) => sum + item.ventasCount, 0);
  const balance = totalVentas - totalGastos;

  // Cálculo de la tasa CPA (Costo Por Adquisición)
  let cpaRate = 0;
  if (totalVentasCount > 0 && totalVentas > 0) {
    const cpa = totalGastos / totalVentasCount; // Costo por venta
    const avgSaleValue = totalVentas / totalVentasCount; // Valor promedio por venta
    cpaRate = (cpa / avgSaleValue) * 100; // Convertir a porcentaje
  }

  // Periodos predefinidos
  const periods = [
    { label: 'Hoy', days: 1 },
    { label: '3 días', days: 3 },
    { label: '7 días', days: 7 },
    { label: '14 días', days: 14 },
    { label: '30 días', days: 30 },
    { label: 'Personalizado', days: -1 }
  ];

  useEffect(() => {
    fetchData();
  }, [authData]);

  useEffect(() => {
    processDataWithFilters();
  }, [rawSales, rawExpenses, selectedCampaign, selectedAd, selectedPeriod, customDateRange, startDate, endDate]);

  const fetchData = async () => {
    if (!authData?.company_id) return;
    
    setLoading(true);
    try {
      // Obtener ventas, gastos, campañas y anuncios
      const [salesData, expensesData, campaignsData, adsData] = await Promise.all([
        salesDatabaseService.getSales(authData.company_id),
        expensesDatabaseService.getExpenses(authData.company_id),
        campaignDatabaseService.getCampaigns(authData.company_id),
        adDatabaseService.getAds(authData.company_id)
      ]);
      
      setCampaigns(campaignsData);
      setAds(adsData);
      
      // Guardar datos crudos para usarlos posteriormente en filtros
      setRawSales(salesData);
      setRawExpenses(expensesData);
    } catch (error) {
      console.error('Error al cargar datos para el gráfico:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const processDataWithFilters = () => {
    if (rawSales.length === 0 && rawExpenses.length === 0) return;
    
    // Filtrar ventas según los criterios seleccionados
    let filteredSales = [...rawSales];
    let filteredExpenses = [...rawExpenses];
    
    // Aplicar filtro de campaña
    if (selectedCampaign) {
      // Primero obtenemos los IDs de anuncios que pertenecen a esta campaña
      const campaignAdIds = ads
        .filter(ad => ad.campaign_id === selectedCampaign)
        .map(ad => ad.id);
      
      // Filtrar ventas y gastos que corresponden a estos anuncios
      filteredSales = filteredSales.filter(sale => 
        campaignAdIds.includes(sale.advertisement_id)
      );
      
      filteredExpenses = filteredExpenses.filter(expense => 
        campaignAdIds.includes(expense.advertisement_id)
      );
    }
    
    // Aplicar filtro de anuncio
    if (selectedAd) {
      filteredSales = filteredSales.filter(sale => 
        sale.advertisement_id === selectedAd
      );
      
      filteredExpenses = filteredExpenses.filter(expense => 
        expense.advertisement_id === selectedAd
      );
    }
    
    // Filtrar por rango de fechas
    let startDateObj, endDateObj;
    let dateArray: string[] = [];
    
    if (customDateRange) {
      // Usar rango de fechas personalizado
      startDateObj = new Date(startDate);
      endDateObj = new Date(endDate);
      
      // Ajustar para incluir todo el día final
      endDateObj.setHours(23, 59, 59, 999);
      
      // Crear array de fechas entre inicio y fin (inclusive)
      const tempDate = new Date(startDateObj);
      while (tempDate <= endDateObj) {
        dateArray.push(formatDateForInput(tempDate));
        tempDate.setDate(tempDate.getDate() + 1);
      }
    } else {
      // Usar período predefinido
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Final del día de hoy
      endDateObj = today;
      
      startDateObj = new Date(today);
      startDateObj.setDate(today.getDate() - (selectedPeriod - 1));
      startDateObj.setHours(0, 0, 0, 0); // Inicio del día
      
      // Crear array de fechas para el período
      for (let i = 0; i < selectedPeriod; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dateArray.push(formatDateForInput(date));
      }
    }
    
    // Filtrar ventas y gastos por el rango de fechas
    filteredSales = filteredSales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDateObj && saleDate <= endDateObj;
    });
    
    filteredExpenses = filteredExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDateObj && expenseDate <= endDateObj;
    });
    
    // Crear mapa de fechas para los datos del gráfico
    const chartData: Map<string, ChartData> = new Map();
    
    // Inicializar el mapa con todas las fechas en el rango
    dateArray.forEach(dateStr => {
      chartData.set(dateStr, { date: dateStr, ventas: 0, gastos: 0, ventasCount: 0 });
    });
    
    // Agregar ventas al mapa
    filteredSales.forEach(sale => {
      const saleDate = new Date(sale.date);
      const dateStr = formatDateForInput(saleDate);
      
      if (chartData.has(dateStr)) {
        const current = chartData.get(dateStr)!;
        chartData.set(dateStr, {
          ...current,
          ventas: current.ventas + sale.amount,
          ventasCount: current.ventasCount + 1
        });
      }
    });
    
    // Agregar gastos al mapa
    filteredExpenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const dateStr = formatDateForInput(expenseDate);
      
      if (chartData.has(dateStr)) {
        const current = chartData.get(dateStr)!;
        chartData.set(dateStr, {
          ...current,
          gastos: current.gastos + expense.amount
        });
      }
    });
    
    // Convertir el mapa a un array y ordenar por fecha
    const result = Array.from(chartData.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setData(result);
    
    // Para el filtro "Hoy", mostrar solo datos de hoy
    if (selectedPeriod === 1 && !customDateRange) {
      const todayStr = getTodayString();
      setFilteredData(result.filter(item => item.date === todayStr));
    } else {
      setFilteredData(result);
    }
  };
  
  // Corregir el problema de zona horaria que causa que la fecha se muestre un día antes
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    return localDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  // Función auxiliar para formatear fechas en el tooltip
  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    return localDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Definir tipos para los props del tooltip personalizado
  interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
  }

  // Componente de tooltip personalizado reutilizable
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (!active || !payload || !payload.length) return null;
    
    // Extraer datos de ventas y gastos
    const ventasData = payload.find(p => p.name === 'Ventas');
    const gastosData = payload.find(p => p.name === 'Gastos');
    
    // Convertir valores a números para evitar errores de TypeScript
    const ventasValue = ventasData && typeof ventasData.value === 'number' ? ventasData.value : 0;
    const gastosValue = gastosData && typeof gastosData.value === 'number' ? gastosData.value : 0;
    
    // Obtener el contador de ventas
    const ventasCount = payload[0]?.payload?.ventasCount || 0;
    
    // Calcular el balance
    const balance = ventasValue - gastosValue;
    
    return (
      <div className="bg-gray-800 border border-gray-600 p-2 rounded shadow-lg">
        <p className="text-gray-300 mb-1">{`Fecha: ${formatTooltipDate(label || '')}`}</p>
        <p className="text-green-400">{`Ventas: $${ventasValue.toLocaleString('es-ES')} (${ventasCount} ventas)`}</p>
        <p className="text-red-400">{`Gastos: $${gastosValue.toLocaleString('es-ES')}`}</p>
        <div className="mt-1 pt-1 border-t border-gray-600">
          <p className={`font-bold ${balance >= 0 ? 'text-blue-400' : 'text-yellow-400'}`}>
            {`Balance: $${balance.toLocaleString('es-ES')}`}
          </p>
        </div>
      </div>
    );
  };

  const handleCampaignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const campaignId = e.target.value;
    setSelectedCampaign(campaignId);
    setSelectedAd(''); // Resetear anuncio al cambiar campaña
  };
  
  const handleAdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAd(e.target.value);
  };
  
  const handlePeriodChange = (days: number) => {
    if (days === -1) {
      // Activar modo de rango personalizado
      setCustomDateRange(true);
      // Establecer fechas predeterminadas: hoy y hace 7 días
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      
      setStartDate(formatDateForInput(weekAgo));
      setEndDate(formatDateForInput(today));
      setShowOnlyToday(false);
    } else {
      // Desactivar modo de rango personalizado
      setCustomDateRange(false);
      setSelectedPeriod(days);
      setShowOnlyToday(days === 1);
    }
  };
  
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };
  
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };
  
  if (loading && rawSales.length === 0) {
    return <div className="flex justify-center items-center h-52">Cargando gráfico...</div>;
  }
  
  if (data.length === 0) {
    return <div className="text-center p-4">No hay datos para mostrar</div>;
  }

  return (
    <div className="w-full bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-center">
        Ventas vs Gastos {customDateRange 
          ? `(${startDate} al ${endDate})` 
          : showOnlyToday 
            ? 'de hoy' 
            : `(últimos ${selectedPeriod} días)`
        }
      </h2>
      
      {/* Filtros y controles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* Selector de periodos */}
        <div className="flex flex-wrap gap-1">
          {periods.map(period => (
            <button
              key={period.days}
              onClick={() => handlePeriodChange(period.days)}
              className={`px-2 py-1 text-xs rounded ${
                (period.days === -1 && customDateRange) || 
                (period.days !== -1 && selectedPeriod === period.days && !customDateRange)
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
        
        {/* Selector de tipo de gráfico */}
        <div>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white text-sm"
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value)}
          >
            <option value="barra">Gráfico de Barras</option>
            <option value="linea">Gráfico de Línea</option>
          </select>
        </div>
        
        {/* Selector de campaña */}
        <div>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white text-sm"
            value={selectedCampaign}
            onChange={handleCampaignChange}
          >
            <option value="">Todas las campañas</option>
            {campaigns.map(campaign => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Selector de anuncio */}
        <div>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white text-sm"
            value={selectedAd}
            onChange={handleAdChange}
            disabled={!selectedCampaign}
          >
            <option value="">Todos los anuncios</option>
            {ads
              .filter(ad => !selectedCampaign || ad.campaign_id === selectedCampaign)
              .map(ad => (
                <option key={ad.id} value={ad.id}>
                  {ad.name}
                </option>
              ))}
          </select>
        </div>
        
        {/* Selector de fechas personalizado - Ahora por debajo de los otros filtros */}
        {customDateRange && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex gap-2 mt-2">
            <div className="flex-1">
              <label className="text-xs text-gray-400 block mb-1">Desde</label>
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="w-full p-2 rounded bg-gray-700 text-white text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 block mb-1">Hasta</label>
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                className="w-full p-2 rounded bg-gray-700 text-white text-sm"
                min={startDate}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Resumen de totales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-center">
        <div className="bg-green-900/30 p-3 rounded">
          <div className="text-green-400 font-bold">Ventas</div>
          <div className="text-xl font-bold">${totalVentas.toLocaleString('es-ES')}</div>
        </div>
        <div className="bg-red-900/30 p-3 rounded">
          <div className="text-red-400 font-bold">Gastos</div>
          <div className="text-xl font-bold">${totalGastos.toLocaleString('es-ES')}</div>
        </div>
        <div className={`${balance >= 0 ? 'bg-blue-900/30' : 'bg-yellow-900/30'} p-3 rounded`}>
          <div className={`${balance >= 0 ? 'text-blue-400' : 'text-yellow-400'} font-bold`}>Balance</div>
          <div className="text-xl font-bold">${balance.toLocaleString('es-ES')}</div>
        </div>
        <div className="bg-purple-900/30 p-3 rounded">
          <div className="text-purple-400 font-bold">Tasa CPA</div>
          <div className="text-xl font-bold">
            {totalVentasCount > 0 ? `${cpaRate.toFixed(2)}%` : 'N/A'}
          </div>
        </div>
      </div>
      
      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={300}>
        {selectedView === 'barra' ? (
          <BarChart
            data={filteredData}
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate} 
              tick={{ fill: '#ddd' }}
            />
            <YAxis tick={{ fill: '#ddd' }} />
            <Tooltip 
              content={(props) => <CustomTooltip {...props} />}
            />
            <Legend wrapperStyle={{ color: '#ddd' }} />
            <Bar 
              dataKey="ventas" 
              name="Ventas" 
              fill="#4ade80" 
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              dataKey="gastos" 
              name="Gastos" 
              fill="#f87171" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        ) : (
          <LineChart
            data={filteredData}
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate} 
              tick={{ fill: '#ddd' }}
            />
            <YAxis tick={{ fill: '#ddd' }} />
            <Tooltip
              content={(props) => <CustomTooltip {...props} />}
            />
            <Legend wrapperStyle={{ color: '#ddd' }} />
            <Line 
              type="monotone" 
              dataKey="ventas" 
              stroke="#4ade80" 
              strokeWidth={2}
              dot={{ r: 4, fill: '#4ade80' }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="gastos" 
              stroke="#f87171" 
              strokeWidth={2}
              dot={{ r: 4, fill: '#f87171' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default SalesGrafic;
