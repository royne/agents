import { supabase } from '../../lib/supabase';
import type { Agent } from '../../types/database';

export const agentDatabaseService = {
  async createAgent(agent: Omit<Agent, 'id' | 'created_at' | 'updated_at'>): Promise<Agent | null> {
    const { data, error } = await supabase
      .from('agents')
      .insert(agent)
      .select()
      .single();

    if (error) {
      console.error('Error creating agent:', error);
      return null;
    }

    return data;
  },

  async updateAgent(id: string, updates: Partial<Omit<Agent, 'id' | 'created_at' | 'updated_at'>>): Promise<Agent | null> {
    const { data, error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating agent:', error);
      return null;
    }

    return data;
  },

  async getAgent(id: string): Promise<Agent | null> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error getting agent:', error);
      return null;
    }

    return data;
  },

  async getAllAgents(): Promise<Agent[]> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error getting agents:', error);
      return [];
    }

    return data || [];
  },

  async deleteAgent(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting agent:', error);
      return false;
    }

    return true;
  }
};
