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
    { label: '90 días', days: 90 }
  ];

  useEffect(() => {
    fetchData();
  }, [authData, selectedPeriod]);

  useEffect(() => {
    processDataWithFilters();
  }, [rawSales, rawExpenses, selectedCampaign, selectedAd, showOnlyToday, selectedPeriod]);

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
    
    // Crear mapa de fechas para los últimos N días
    const chartData: Map<string, ChartData> = new Map();
    const today = getCurrentLocalDate();
    
    // Inicializar el mapa con fechas vacías
    for (let i = 0; i < selectedPeriod; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      // Usar formatDateForInput para asegurar el formato correcto YYYY-MM-DD
      const dateStr = formatDateForInput(date);
      chartData.set(dateStr, { date: dateStr, ventas: 0, gastos: 0, ventasCount: 0 });
    }
    
    // Agregar ventas al mapa
    filteredSales.forEach(sale => {
      // Asegurarnos de tener el formato correcto YYYY-MM-DD
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
      // Asegurarnos de tener el formato correcto YYYY-MM-DD
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
    
    // Aplicar filtro de solo hoy si está activado
    if (showOnlyToday) {
      const todayStr = getTodayString();
      setFilteredData(result.filter(item => item.date === todayStr));
    } else {
      setFilteredData(result);
    }
  };
  
  const formatDate = (dateStr: string) => {
    // Corregir el problema de zona horaria que causa que la fecha se muestre un día antes
    const date = new Date(dateStr);
    // Asegurar que usamos la fecha local sin ajustes de zona horaria
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    return localDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
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
    setSelectedPeriod(days);
    setShowOnlyToday(days === 1);
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
        Ventas vs Gastos {showOnlyToday ? 'de hoy' : `(últimos ${selectedPeriod} días)`}
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
                selectedPeriod === period.days 
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
              formatter={(value, name, props) => {
                const dataPoint = props.payload;
                if (name === 'ventas') {
                  return [`$${value} (${dataPoint?.ventasCount || 0} ventas)`, 'Ventas'];
                }
                return [`$${value}`, name === 'gastos' ? 'Gastos' : name];
              }}
              labelFormatter={(label) => `Fecha: ${formatDate(label as string)}`}
              contentStyle={{ backgroundColor: '#333', border: '1px solid #666' }}
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
              formatter={(value, name, props) => {
                const dataPoint = props.payload;
                if (name === 'ventas') {
                  return [`$${value} (${dataPoint?.ventasCount || 0} ventas)`, 'Ventas'];
                }
                return [`$${value}`, name === 'gastos' ? 'Gastos' : name];
              }}
              labelFormatter={(label) => `Fecha: ${formatDate(label as string)}`}
              contentStyle={{ backgroundColor: '#333', border: '1px solid #666' }}
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
