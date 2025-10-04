import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import CrudLayout from '../../components/layout/CrudLayout';
import { expensesDatabaseService } from '../../services/database/expensesService';
import { campaignDatabaseService } from '../../services/database/campaignService';
import { adDatabaseService } from '../../services/database/adService';
import type { DailyExpenses, Campaign, Advertisement } from '../../types/database';
import { useAppContext } from '../../contexts/AppContext';
import { useFilters } from '../../hooks/useFilters';
import DataFilters from '../../components/filters/DataFilters';
import PageHeader from '../../components/common/PageHeader';
import { FaArrowTrendDown } from 'react-icons/fa6';

export default function Expenses() {
  const [expenses, setExpenses] = useState<DailyExpenses[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Partial<DailyExpenses>>({});
  const { authData } = useAppContext();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!authData?.company_id) return;
    
    setLoading(true);
    const [expensesData, campaignsData] = await Promise.all([
      expensesDatabaseService.getExpenses(authData.company_id),
      campaignDatabaseService.getCampaigns(authData.company_id)
    ]);
    
    const adsData = await adDatabaseService.getAds(authData.company_id);
    
    setExpenses(expensesData);
    setCampaigns(campaignsData);
    setAds(adsData);
    setLoading(false);
  };

  // Usar el hook useFilters para manejar la lógica de filtros
  const {
    filteredItems: filteredExpenses,
    selectedCampaign,
    setSelectedCampaign,
    selectedAd,
    setSelectedAd,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    resetFilters
  } = useFilters<DailyExpenses>({
    items: expenses,
    ads,
    campaigns
  });

  const handleCreateNew = () => {
    setCurrentExpense({});
    setIsModalOpen(true);
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
    <ProtectedRoute moduleKey={'profitability'}>
      <DashboardLayout>
        <div className="space-y-8 max-w-6xl mx-auto">
        <PageHeader
          title={
            <>
              <FaArrowTrendDown className="inline-block mr-2 mb-1" />
              Análisis de Gastos
            </>
          }
          description="Analiza y filtra tus gastos por campaña, anuncio y fecha."
          backLink="/profitability"
          actions={
            <button
              onClick={() => handleCreateNew()}
              className="bg-primary-color hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center shadow-sm hover:shadow-md transition-all"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo
            </button>
          }
        />
        
        {/* Filtros */}
        <DataFilters
          campaigns={campaigns}
          ads={ads}
          selectedCampaign={selectedCampaign}
          setSelectedCampaign={setSelectedCampaign}
          selectedAd={selectedAd}
          setSelectedAd={setSelectedAd}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          resetFilters={resetFilters}
        />

        {/* Summary */}
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-300">Total de gastos</h3>
              <p className="text-2xl font-bold">$ {totalExpenses.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-300">Número de registros</h3>
              <p className="text-2xl font-bold">{filteredExpenses.length}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-300">Promedio diario</h3>
              <p className="text-2xl font-bold">
                $ {filteredExpenses.length ? (totalExpenses / filteredExpenses.length).toLocaleString('es-CO', { maximumFractionDigits: 0 }) : '0'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Expenses table */}
        <CrudLayout
          title="Registro de Gastos Diarios"
          backLink="/profitability"
          showHeader={false}
          items={filteredExpenses.map(expense => {
            const ad = ads.find(a => a.id === expense.advertisement_id);
            const campaign = campaigns.find(c => c.id === ad?.campaign_id);
            
            return {
              id: expense.id,
              name: `$ ${expense.amount.toLocaleString('es-CO', { maximumFractionDigits: 0 })}  (${new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long'}).format(new Date(expense.date))})  - AD: ${ad?.name ?? 'N/A'} - Campaña ${campaign?.name ?? 'N/A'}`
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
    </ProtectedRoute>
  );
}
