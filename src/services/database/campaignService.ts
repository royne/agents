import { supabase } from '../../lib/supabase';
import type { Campaign } from '../../types/database';

export const campaignDatabaseService = {
  async createCampaign(campaignData: Omit<Campaign, 'id' | 'created_at'>, company_id: string): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from('campaigns')
      .insert({ ...campaignData, company_id, status: true })
      .select()
      .single();

    return error ? null : data;
  },

  async getCampaigns(company_id: string): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('company_id', company_id)
      .order('created_at', { ascending: false });

    return error ? [] : data;
  },

  async updateCampaign(id: string, updates: Partial<Campaign>, company_id: string): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ ...updates, company_id })
      .eq('id', id)
      .select()
      .single();

    return error ? null : data;
  },

  async deleteCampaign(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    return !error;
  }
};