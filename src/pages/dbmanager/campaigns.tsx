import DashboardLayout from '../../components/layout/DashboardLayout';
import { useState, useEffect } from 'react';
import { campaignDatabaseService } from '../../services/database/campaignService';
import { productDatabaseService } from '../../services/database/productService';
import type { Campaign, Product } from '../../types/database';
import { useAppContext } from '../../contexts/AppContext';

export default function CampaignPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<Partial<Campaign>>({});
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { authData } = useAppContext();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!authData?.company_id) return;
    
    setLoading(true);
    const [campaignsData, productsData] = await Promise.all([
      campaignDatabaseService.getCampaigns(authData.company_id),
      productDatabaseService.getProducts(authData.company_id)
    ]);
    setCampaigns(campaignsData);
    setProducts(productsData);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authData?.company_id) return;

    try {
      setLoading(true);
      const campaignPayload = {
        name: currentCampaign.name || '',
        launch_date: currentCampaign.launch_date || new Date(),
        product_id: currentCampaign.product_id || '',
        cp: currentCampaign.cp || '',
        status: currentCampaign.status !== undefined ? currentCampaign.status : true,
        company_id: authData.company_id
      };

      if (currentCampaign.id) {
        await campaignDatabaseService.updateCampaign(currentCampaign.id, campaignPayload, authData.company_id);
      } else {
        await campaignDatabaseService.createCampaign(campaignPayload, authData.company_id);
      }
      
      await fetchData();
      alert(currentCampaign.id ? 'Campaña actualizada' : 'Campaña creada');
      setCurrentCampaign({});
      setIsModalOpen(false);
    } catch (error) {
      alert('Error al guardar: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await campaignDatabaseService.deleteCampaign(id);
    await fetchData();
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      await campaignDatabaseService.updateCampaign(id, { status: !currentStatus }, authData?.company_id || '');
      await fetchData();
    } catch (error) {
      alert('Error al cambiar estado: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCurrentCampaign({});
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Campañas</h1>
          <button
            onClick={handleCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Nueva
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">Nombre</th>
                <th className="px-6 py-3 text-left">Producto</th>
                <th className="px-6 py-3 text-left">Fecha de lanzamiento</th>
                <th className="px-6 py-3 text-left">Cuenta publicitaria</th>
                <th className="px-6 py-3 text-left">Estado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((item) => {
                const product = products.find(p => p.id === item.product_id);
                return (
                  <tr key={item.id} className="border-t border-gray-700">
                    <td className="px-6 py-4">{item.name}</td>
                    <td className="px-6 py-4">{product?.name || '-'}</td>
                    <td className="px-6 py-4">{item.launch_date ? new Date(item.launch_date).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4">{item.cp || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${item.status ? 'bg-green-500' : 'bg-red-500'}`}>
                        {item.status ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <button 
                        onClick={() => handleToggleStatus(item.id, !!item.status)}
                        className={`px-3 py-1 rounded text-white text-sm ${item.status ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                      >
                        {item.status ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Nueva Campaña</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre de la campaña"
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  value={currentCampaign.name || ''}
                  onChange={(e) => setCurrentCampaign({...currentCampaign, name: e.target.value})}
                  required
                />
                <input
                  type="date"
                  placeholder="Fecha de lanzamiento"
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  value={currentCampaign.launch_date?.toString().split('T')[0] || ''}
                  onChange={(e) => setCurrentCampaign({...currentCampaign, launch_date: new Date(e.target.value)})}
                  required
                />
                <select
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  value={currentCampaign.product_id || ''}
                  onChange={(e) => setCurrentCampaign({...currentCampaign, product_id: e.target.value})}
                  required
                >
                  <option value="">Selecciona un producto</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Cuenta publicitaria"
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  value={currentCampaign.cp || ''}
                  onChange={(e) => setCurrentCampaign({...currentCampaign, cp: e.target.value})}
                  required
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="status"
                    className="mr-2"
                    checked={currentCampaign.status !== undefined ? currentCampaign.status : true}
                    onChange={(e) => setCurrentCampaign({...currentCampaign, status: e.target.checked})}
                  />
                  <label htmlFor="status" className="text-white">Activa</label>
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