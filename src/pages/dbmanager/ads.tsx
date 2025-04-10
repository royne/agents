import DashboardLayout from '../../components/layout/DashboardLayout';
import CrudLayout from '../../components/layout/CrudLayout';
import { useState, useEffect } from 'react';
import { adDatabaseService } from '../../services/database/adService';
import { campaignDatabaseService } from '../../services/database/campaignService';
import type { Advertisement, Campaign } from '../../types/database';
import { useAppContext } from '../../contexts/AppContext';

export default function AdsPage() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentAd, setCurrentAd] = useState<Partial<Advertisement>>({});
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { authData } = useAppContext();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!authData?.company_id) return;
    
    setLoading(true);
    const [adsData, campaignsData] = await Promise.all([
      adDatabaseService.getAds(authData.company_id),
      campaignDatabaseService.getCampaigns(authData.company_id)
    ]);
    setAds(adsData);
    setCampaigns(campaignsData);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authData?.company_id) return;

    try {
      setLoading(true);
      const adPayload = {
        name: currentAd.name || '',
        campaign_id: currentAd.campaign_id || '',
        status: currentAd.status !== undefined ? currentAd.status : true,
        company_id: authData.company_id
      };

      if (currentAd.id) {
        await adDatabaseService.updateAd(currentAd.id, adPayload, authData.company_id);
      } else {
        await adDatabaseService.createAd(adPayload, authData.company_id);
      }
      
      await fetchData();
      alert(currentAd.id ? 'Anuncio actualizado' : 'Anuncio creado');
      setCurrentAd({});
      setIsModalOpen(false);
      setIsEditing(false);
    } catch (error) {
      alert('Error al guardar: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await adDatabaseService.deleteAd(id);
    await fetchData();
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      await adDatabaseService.updateAd(id, { status: !currentStatus }, authData?.company_id || '');
      await fetchData();
    } catch (error) {
      alert('Error al cambiar estado: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCurrentAd({});
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (ad: Advertisement) => {
    setCurrentAd(ad);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Anuncios</h1>
          <button
            onClick={handleCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Nuevo
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">Nombre</th>
                <th className="px-6 py-3 text-left">Campaña</th>
                <th className="px-6 py-3 text-left">Estado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((item) => {
                const campaign = campaigns.find(c => c.id === item.campaign_id);
                return (
                  <tr key={item.id} className="border-t border-gray-700">
                    <td className="px-6 py-4">{item.name}</td>
                    <td className="px-6 py-4">{campaign?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${item.status ? 'bg-green-500' : 'bg-red-500'}`}>
                        {item.status ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-3 py-1 rounded text-white text-sm bg-blue-600 hover:bg-blue-700"
                      >
                        Editar
                      </button>
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
                <h2 className="text-xl font-bold">{isEditing ? 'Editar Anuncio' : 'Nuevo Anuncio'}</h2>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentAd({});
                    setIsEditing(false);
                  }}
                  className="text-gray-400 hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre del anuncio"
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  value={currentAd.name || ''}
                  onChange={(e) => setCurrentAd({...currentAd, name: e.target.value})}
                  required
                />
                <select
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  value={currentAd.campaign_id || ''}
                  onChange={(e) => setCurrentAd({...currentAd, campaign_id: e.target.value})}
                  required
                >
                  <option value="">Selecciona una campaña</option>
                  {campaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="status"
                    className="mr-2"
                    checked={currentAd.status !== undefined ? currentAd.status : true}
                    onChange={(e) => setCurrentAd({...currentAd, status: e.target.checked})}
                  />
                  <label htmlFor="status" className="text-white">Activo</label>
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