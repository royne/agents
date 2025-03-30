import DashboardLayout from '../../components/layout/DashboardLayout';
import CrudLayout from '../../components/layout/CrudLayout';
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
  const { authData } = useAppContext();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!authData?.company_id) return;
    
    setLoading(true);
    const [campaignsData, productsData] = await Promise.all([
      campaignDatabaseService.getCampaigns(authData.company_id),
      productDatabaseService.getProducts()
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
        name: '',
        launch_date: new Date().toISOString(),
        product_id: '',
        ...currentCampaign,
        company_id: authData.company_id
      };

      if (currentCampaign.id) {
        await campaignDatabaseService.updateCampaign(currentCampaign.id, currentCampaign, authData.company_id);
      } else {
        await campaignDatabaseService.createCampaign({
          ...campaignPayload,
          launch_date: new Date(currentCampaign.launch_date || new Date())
        }, authData.company_id);
      }
      
      await fetchData();
      alert(currentCampaign.id ? 'Campaña actualizada' : 'Campaña creada');
      setCurrentCampaign({});
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

  const handleEdit = (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    setCurrentCampaign(campaign || {});
  };

  return (
    <DashboardLayout>
      <CrudLayout
        title="Campañas"
        items={campaigns}
        onDelete={handleDelete}
        onEdit={handleEdit}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre de la campaña"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={currentCampaign.name || ''}
            onChange={(e) => setCurrentCampaign({...currentCampaign, name: e.target.value})}
          />
          <input
            type="date"
            placeholder="Fecha de lanzamiento"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={currentCampaign.launch_date?.toString().split('T')[0] || ''}
            onChange={(e) => setCurrentCampaign({...currentCampaign, launch_date: new Date(e.target.value)})}
          />
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={currentCampaign.product_id || ''}
            onChange={(e) => setCurrentCampaign({...currentCampaign, product_id: e.target.value})}
          >
            <option value="">Selecciona un producto</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </CrudLayout>
    </DashboardLayout>
  );
}