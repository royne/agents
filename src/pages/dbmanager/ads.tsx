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
        name: '',
        campaign_id: '',
        ...currentAd,
        company_id: authData.company_id
      };

      if (currentAd.id) {
        await adDatabaseService.updateAd(currentAd.id, currentAd, authData.company_id);
      } else {
        await adDatabaseService.createAd(adPayload, authData.company_id);
      }
      
      await fetchData();
      alert(currentAd.id ? 'Anuncio actualizado' : 'Anuncio creado');
      setCurrentAd({});
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

  const handleEdit = (id: string) => {
    const ad = ads.find(a => a.id === id);
    setCurrentAd(ad || {});
  };

  return (
    <DashboardLayout>
      <CrudLayout
        title="Anuncios"
        items={ads}
        onDelete={handleDelete}
        onEdit={handleEdit}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre del anuncio"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={currentAd.name || ''}
            onChange={(e) => setCurrentAd({...currentAd, name: e.target.value})}
          />
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={currentAd.campaign_id || ''}
            onChange={(e) => setCurrentAd({...currentAd, campaign_id: e.target.value})}
          >
            <option value="">Selecciona una campaña</option>
            {campaigns.map(campaign => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
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