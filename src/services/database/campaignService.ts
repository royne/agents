import { supabase } from '../../lib/supabase';
import type { Campaign } from '../../types/database';

export const campaignDatabaseService = {
  async createCampaign(campaignData: Omit<Campaign, 'id' | 'created_at'>, company_id: string): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from('campaigns')
      .insert({ ...campaignData, company_id, status: true })
      .select()
      .single();

    if (error) {
      console.error('Error creating campaign:', error);
      throw new Error(`Error al crear campaña: ${error.message}`);
    }
    return data;
  },

  async getCampaigns(company_id: string): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('company_id', company_id)
      .order('created_at', { ascending: false });

    return error ? [] : data;
  },

  async getCampaignById(id: string, company_id: string): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('company_id', company_id)
      .single();

    if (error) {
      console.error('Error fetching campaign:', error);
      return null;
    }
    return data;
  },

  async updateCampaign(id: string, updates: Partial<Campaign>, company_id: string): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ ...updates, company_id })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating campaign:', error);
      throw new Error(`Error al actualizar campaña: ${error.message}`);
    }
    return data;
  },

  async deleteCampaign(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    return !error;
  }
};