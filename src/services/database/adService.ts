import { supabase } from '../../lib/supabase';
import type { Advertisement } from '../../types/database';

export const adDatabaseService = {
  async createAd(adData: Omit<Advertisement, 'id' | 'created_at'>, company_id: string): Promise<Advertisement | null> {
    const { data, error } = await supabase
      .from('advertisements')
      .insert({ ...adData, company_id })
      .select()
      .single();

    return error ? null : data;
  },

  async getAds(company_id: string): Promise<Advertisement[]> {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .eq('company_id', company_id)
      .order('created_at', { ascending: false });

    return error ? [] : data;
  },

  async updateAd(id: string, updates: Partial<Advertisement>, company_id: string): Promise<Advertisement | null> {
    const { data, error } = await supabase
      .from('advertisements')
      .update({ ...updates, company_id })
      .eq('id', id)
      .select()
      .single();

    return error ? null : data;
  },

  async deleteAd(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', id);

    return !error;
  }
};