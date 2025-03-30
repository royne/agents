import { supabase } from '../../lib/supabase';
import type { Sale } from '../../types/database';

export const salesDatabaseService = {
  async createSale(saleData: Omit<Sale, 'id' | 'created_at'>, company_id: string): Promise<Sale | null> {
    const { data, error } = await supabase
      .from('sales')
      .insert({ ...saleData, company_id })
      .select()
      .single();

    return error ? null : data;
  },

  async getSales(company_id: string): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        advertisements:advertisement_id (name, campaign_id),
        campaigns:advertisements (campaigns (name))
      `)
      .eq('company_id', company_id)
      .order('created_at', { ascending: false });

    return error ? [] : data;
  },

  async updateSale(id: string, updates: Partial<Sale>, company_id: string): Promise<Sale | null> {
    const { data, error } = await supabase
      .from('sales')
      .update({ ...updates, company_id })
      .eq('id', id)
      .select()
      .single();

    return error ? null : data;
  },

  async deleteSale(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id);

    return !error;
  }
};