import { SupabaseClient } from '@supabase/supabase-js';
import { Launch, ILaunchService } from './types';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export class LaunchService implements ILaunchService {
  constructor(private supabase: SupabaseClient) {}

  static createWithAdmin(): LaunchService {
    return new LaunchService(supabaseAdmin);
  }

  async create(userId: string, data: Partial<Launch>): Promise<Launch> {
    const { data: newLaunch, error } = await this.supabase
      .from('launches')
      .insert({
        user_id: userId,
        name: data.name || 'Nuevo Lanzamiento',
        product_dna: data.product_dna || {},
        creative_strategy: data.creative_strategy || {},
        landing_structure: data.landing_structure || { sections: [] },
        ad_concepts: data.ad_concepts || [],
        status: data.status || 'draft'
      })
      .select()
      .single();

    if (error) throw error;
    return newLaunch;
  }

  async getById(id: string): Promise<Launch | null> {
    const { data, error } = await this.supabase
      .from('launches')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async getByUser(userId: string): Promise<Launch[]> {
    const { data, error } = await this.supabase
      .from('launches')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async update(id: string, data: Partial<Launch>): Promise<Launch> {
    const { data: updatedLaunch, error } = await this.supabase
      .from('launches')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedLaunch;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('launches')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Vincula una generación de imagen a un lanzamiento
   */
  async linkGeneration(generationId: string, launchId: string): Promise<void> {
    const { error } = await this.supabase
      .from('image_generations')
      .update({ launch_id: launchId })
      .eq('id', generationId);

    if (error) throw error;
  }

  /**
   * Obtiene todas las generaciones asociadas a un lanzamiento
   */
  async getGenerationsByLaunchId(launchId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('image_generations')
      .select('*')
      .eq('launch_id', launchId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}
