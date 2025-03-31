import { supabase } from '../../lib/supabase';
import type { DailyExpenses } from '../../types/database';

export const expensesDatabaseService = {
  async createExpense(expenseData: Omit<DailyExpenses, 'id' | 'created_at'>, company_id: string): Promise<DailyExpenses | null> {
    const { data, error } = await supabase
      .from('daily_expenses')
      .insert({ ...expenseData, company_id })
      .select()
      .single();

    return error ? null : data;
  },

  async getExpenses(company_id: string): Promise<DailyExpenses[]> {
    const { data, error } = await supabase
      .from('daily_expenses')
      .select(`
        *,
        advertisements:advertisement_id (name, campaign_id),
        campaigns:advertisements (campaigns (name))
      `)
      .eq('company_id', company_id)
      .order('created_at', { ascending: false });

    return error ? [] : data;
  },

  async updateExpense(id: string, updates: Partial<DailyExpenses>, company_id: string): Promise<DailyExpenses | null> {
    const { data, error } = await supabase
      .from('daily_expenses')
      .update({ ...updates, company_id })
      .eq('id', id)
      .select()
      .single();

    return error ? null : data;
  },

  async deleteExpense(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('daily_expenses')
      .delete()
      .eq('id', id);

    return !error;
  }
};