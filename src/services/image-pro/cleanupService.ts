import { SupabaseClient } from '@supabase/supabase-js';

export interface CleanupResult {
  success: boolean;
  processed: number;
  cleaned: number;
  error?: string;
}

export class ImageCleanupService {
  private static readonly BUCKET = 'temp-generations';
  private static readonly EXPIRATION_HOURS = 48;

  /**
   * Ejecuta la limpieza de imágenes de usuarios FREE con más de 48 horas.
   */
  static async cleanupExpiredFreeImages(supabase: SupabaseClient): Promise<CleanupResult> {
    try {
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() - this.EXPIRATION_HOURS);
      const expirationIso = expirationDate.toISOString();

      // 1. Obtener registros de usuarios FREE que tienen imagen y son antiguos
      const { data: expiredRecords, error: fetchError } = await supabase
        .from('image_generations')
        .select(`
          id, 
          image_url, 
          profiles!inner (
            plan
          )
        `)
        .eq('profiles.plan', 'free')
        .not('image_url', 'is', null)
        .lt('created_at', expirationIso);

      if (fetchError) throw fetchError;

      if (!expiredRecords || expiredRecords.length === 0) {
        return { success: true, processed: 0, cleaned: 0 };
      }

      let cleanedCount = 0;

      for (const record of expiredRecords) {
        const imageUrl = record.image_url;
        
        // Intentar borrar del storage si existe el path
        if (imageUrl && imageUrl.includes(`/${this.BUCKET}/`)) {
          const parts = imageUrl.split(`/${this.BUCKET}/`);
          if (parts.length > 1) {
            const filePath = parts[1];
            const { error: storageError } = await supabase.storage
              .from(this.BUCKET)
              .remove([filePath]);
            
            if (storageError) {
              console.error(`[CleanupService] Error borrando ${filePath}:`, storageError.message);
            }
          }
        }

        // Actualizar registro en DB
        const { error: dbError } = await supabase
          .from('image_generations')
          .update({ image_url: null })
          .eq('id', record.id);

        if (!dbError) {
          cleanedCount++;
        } else {
          console.error(`[CleanupService] Error actualizando DB para ${record.id}:`, dbError.message);
        }
      }

      return {
        success: true,
        processed: expiredRecords.length,
        cleaned: cleanedCount
      };

    } catch (error: any) {
      console.error('[CleanupService] Error fatal:', error.message);
      return {
        success: false,
        processed: 0,
        cleaned: 0,
        error: error.message
      };
    }
  }
}
