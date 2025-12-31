import { supabase } from '../../lib/supabase';
import type { CampaignBudgetChange } from '../../types/campaign-control';

export const campaignBudgetChangeService = {
  async saveBudgetChange(change: Omit<CampaignBudgetChange, 'id' | 'created_at'>): Promise<CampaignBudgetChange | null> {
    // Asegurarnos de que la fecha incluye la hora completa
    const changeWithFullDate = {
      ...change,
      // Si la fecha no tiene formato ISO completo, lo convertimos
      date: change.date.includes('T') ? change.date : new Date(change.date).toISOString()
    };
    
    
    const { data, error } = await supabase
      .from('campaign_budget_changes')
      .insert(changeWithFullDate)
      .select()
      .single();

    if (error) {
      console.error('Error saving budget change:', error);
      throw new Error(`Error al guardar cambio de presupuesto: ${error.message}`);
    }
    return data;
  },

  async getBudgetChanges(campaignId: string, limit = 50): Promise<CampaignBudgetChange[]> {
    const { data, error } = await supabase
      .from('campaign_budget_changes')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching budget changes:', error);
      return [];
    }
    return data || [];
  },
  
  async getLastBudgetChange(campaignId: string): Promise<CampaignBudgetChange | null> {
    const { data, error } = await supabase
      .from('campaign_budget_changes')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching last budget change:', error);
    }
    return data;
  },
  
  async getRecentChanges(companyId: string, limit = 5): Promise<CampaignBudgetChange[]> {
    // Obtiene los cambios de presupuesto más recientes para todas las campañas de una empresa
    const { data, error } = await supabase
      .from('campaign_budget_changes')
      .select(`
        *,
        campaigns!inner(
          id,
          name,
          company_id
        )
      `)
      .eq('campaigns.company_id', companyId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent budget changes:', error);
      return [];
    }
    
    // Formatear la respuesta para que tenga el formato esperado por la interfaz
    return data?.map(item => ({
      ...item,
      campaignName: item.campaigns.name,
      campaign_id: item.campaigns.id
    })) || [];
  }
};
