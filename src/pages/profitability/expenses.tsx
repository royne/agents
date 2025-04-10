import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CrudLayout from '../../components/layout/CrudLayout';
import { expensesDatabaseService } from '../../services/database/expensesService';
import { campaignDatabaseService } from '../../services/database/campaignService';
import { adDatabaseService } from '../../services/database/adService';
import type { DailyExpenses, Campaign, Advertisement } from '../../types/database';
import { useAppContext } from '../../contexts/AppContext';

export default function Expenses() {
  const [expenses, setExpenses] = useState<DailyExpenses[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<DailyExpenses[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Partial<DailyExpenses>>({});
  const { authData } = useAppContext();

  // filters 
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [selectedAd, setSelectedAd] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [expenses, selectedCampaign, selectedAd, startDate, endDate]);

  const fetchData = async () => {
    if (!authData?.company_id) return;
    
    setLoading(true);
    const [expensesData, campaignsData] = await Promise.all([
      expensesDatabaseService.getExpenses(authData.company_id),
      campaignDatabaseService.getCampaigns(authData.company_id)
    ]);
    
    const adsData = await adDatabaseService.getAds(authData.company_id);
    
    setExpenses(expensesData);
    setFilteredExpenses(expensesData);
    setCampaigns(campaignsData);
    setAds(adsData);
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...expenses];

    // campaign filter
    if (selectedCampaign) {
      const adsInCampaign = ads.filter(ad => ad.campaign_id === selectedCampaign).map(ad => ad.id);
      filtered = filtered.filter(expense => 
        adsInCampaign.includes(expense.advertisement_id)
      );
    }

    // ad filter
    if (selectedAd) {
      filtered = filtered.filter(expense => expense.advertisement_id === selectedAd);
    }

    // start date filter
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= start;
      });
    }

    // end date filter
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate <= end;
      });
    }

    setFilteredExpenses(filtered);
  };

  const resetFilters = () => {
    setSelectedCampaign('');
    setSelectedAd('');
    setStartDate('');
    setEndDate('');
    setFilteredExpenses(expenses);
  };

  const handleEdit = (id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setCurrentExpense(expense);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await expensesDatabaseService.deleteExpense(id);
      await fetchData();
      alert('Gasto eliminado con éxito');
    } catch (error) {
      alert('Error al eliminar el gasto: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authData?.company_id || !currentExpense.id) return;

    try {
      setLoading(true);
      // Prepare the data to update
      const expensePayload: Partial<DailyExpenses> = {
        amount: currentExpense.amount,
        advertisement_id: currentExpense.advertisement_id,
        date: currentExpense.date instanceof Date 
          ? currentExpense.date 
          : currentExpense.date 
            ? new Date(currentExpense.date) 
            : new Date()
      };

      // Call the service with the correct parameters
      await expensesDatabaseService.updateExpense(
        currentExpense.id, 
        expensePayload, 
        authData.company_id
      );
      
      await fetchData();
      alert('Gasto actualizado con éxito');
      setCurrentExpense({});
      setIsModalOpen(false);
    } catch (error) {
      alert('Error al guardar: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate the total of filtered expenses
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        <h1 className='text-center'>ANÁLISIS DE GASTOS</h1>
        
        {/* Filtros */}
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Campaña</label>
              <select
                className="w-full p-2 rounded bg-gray-700 text-white"
                value={selectedCampaign}
                onChange={(e) => {
                  setSelectedCampaign(e.target.value);
                  // Resetear el anuncio seleccionado si cambia la campaña
                  if (e.target.value) {
                    setSelectedAd('');
                  }
                }}
              >
                <option value="">Todas las campañas</option>
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Anuncio</label>
              <select
                className="w-full p-2 rounded bg-gray-700 text-white"
                value={selectedAd}
                onChange={(e) => setSelectedAd(e.target.value)}
              >
                <option value="">Todos los anuncios</option>
                {ads
                  .filter(ad => !selectedCampaign || ad.campaign_id === selectedCampaign)
                  .map(ad => (
                    <option key={ad.id} value={ad.id}>
                      {ad.name}
                    </option>
                  ))
                }
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Fecha inicio</label>
              <input
                type="date"
                className="w-full p-2 rounded bg-gray-700 text-white"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Fecha fin</label>
              <input
                type="date"
                className="w-full p-2 rounded bg-gray-700 text-white"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-300">Total de gastos</h3>
              <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-300">Número de registros</h3>
              <p className="text-2xl font-bold">{filteredExpenses.length}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-300">Promedio diario</h3>
              <p className="text-2xl font-bold">
                ${filteredExpenses.length ? (totalExpenses / filteredExpenses.length).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Expenses table */}
        <CrudLayout
          title="Registro de Gastos Diarios"
          items={filteredExpenses.map(expense => {
            const ad = ads.find(a => a.id === expense.advertisement_id);
            const campaign = campaigns.find(c => c.id === ad?.campaign_id);
            
            return {
              id: expense.id,
              name: `$${expense.amount}  (${new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long'}).format(new Date(expense.date))})  - AD: ${ad?.name ?? 'N/A'} - Campaña ${campaign?.name ?? 'N/A'}`
            };
          })}
          onDelete={handleDelete}
          onEdit={handleEdit}
          hideAddButton={true}
          children={null}
        />

        {/* Edit modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Editar Gasto</h2>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentExpense({});
                  }}
                  className="text-gray-400 hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Monto</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Monto del gasto"
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    value={currentExpense.amount || ''}
                    onChange={(e) => setCurrentExpense({...currentExpense, amount: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Fecha</label>
                  <input
                    type="date"
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    value={currentExpense.date instanceof Date 
                      ? currentExpense.date.toISOString().split('T')[0] 
                      : currentExpense.date 
                        ? new Date(currentExpense.date).toISOString().split('T')[0] 
                        : ''}
                    onChange={(e) => {
                      const dateValue = e.target.value ? new Date(e.target.value) : new Date();
                      setCurrentExpense({...currentExpense, date: dateValue});
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Anuncio</label>
                  <select
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    value={currentExpense.advertisement_id || ''}
                    onChange={(e) => setCurrentExpense({...currentExpense, advertisement_id: e.target.value})}
                    required
                  >
                    <option value="">Selecciona un anuncio</option>
                    {ads.map(ad => {
                      const campaign = campaigns.find(c => c.id === ad.campaign_id);
                      return (
                        <option key={ad.id} value={ad.id}>
                          {ad.name} - Campaña: {campaign?.name || 'N/A'}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
