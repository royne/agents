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
        thumbnail_url: data.thumbnail_url,
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

  /**
   * Sube una imagen en base64 al bucket de almacenamiento centralizado.
   * Utilizado en el servidor tras el análisis exitoso de la IA.
   */
  async uploadImageFromBase64(userId: string, imageBase64: string): Promise<string> {
    try {
      // 1. Limpiar el prefijo data:image/webp;base64, si existe
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      
      // 2. Convertir a Uint8Array compatible con Edge/Node
      const binaryData = Buffer.from(base64Data, 'base64');
      
      // 3. Generar ruta única
      const timestamp = Date.now();
      const filePath = `uploads/${userId}/${timestamp}.webp`;

      // 4. Subir a Supabase Storage
      const { error: uploadError } = await this.supabase.storage
        .from('temp-generations')
        .upload(filePath, binaryData, {
          contentType: 'image/webp',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 5. Obtener URL pública
      const { data: { publicUrl } } = this.supabase.storage
        .from('temp-generations')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('[LaunchService] Error subiendo imagen:', error);
      throw error;
    }
  }

  /**
   * Obtiene las generaciones que no están vinculadas a ningún lanzamiento (Legacy V1 / Sueltos)
   */
  async getOrphanGenerations(userId: string, limit: number = 50): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('image_generations')
      .select('*')
      .eq('user_id', userId)
      .is('launch_id', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Cuenta cuántas generaciones huérfanas tiene un usuario
   */
  async getOrphanGenerationsCount(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('image_generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('launch_id', null);

    if (error) throw error;
    return count || 0;
  }
}
