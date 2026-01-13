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
  private static readonly BATCH_LIMIT = 100; // Límite para evitar timeouts en Vercel (10s)

  /**
   * Ejecuta la limpieza de imágenes de usuarios FREE con más de 48 horas.
   * Optimizado para usar operaciones masivas y evitar timeouts.
   */
  static async cleanupExpiredFreeImages(supabase: SupabaseClient): Promise<CleanupResult> {
    try {
      console.log(`[CleanupService] Iniciando chequeo de imágenes expiradas...`);
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() - this.EXPIRATION_HOURS);
      const expirationIso = expirationDate.toISOString();

      // 1. Obtener registros limitados por el BATCH_LIMIT
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
        .lt('created_at', expirationIso)
        .limit(this.BATCH_LIMIT);

      if (fetchError) throw fetchError;

      if (!expiredRecords || expiredRecords.length === 0) {
        console.log(`[CleanupService] No se encontraron imágenes para limpiar.`);
        return { success: true, processed: 0, cleaned: 0 };
      }

      console.log(`[CleanupService] Procesando lote de ${expiredRecords.length} registros expirados.`);

      // 2. Extraer paths para borrado masivo en Storage
      const filePaths: string[] = [];
      const recordIds: string[] = [];

      for (const record of expiredRecords) {
        recordIds.push(record.id);
        const imageUrl = record.image_url;
        
        if (imageUrl && imageUrl.includes(`/${this.BUCKET}/`)) {
          const parts = imageUrl.split(`/${this.BUCKET}/`);
          if (parts.length > 1) {
            filePaths.push(parts[1]);
          }
        }
      }

      // 3. Borrado masivo en Storage (Una sola petición HTTP)
      if (filePaths.length > 0) {
        console.log(`[CleanupService] Borrando ${filePaths.length} archivos de storage...`);
        const { error: storageError } = await supabase.storage
          .from(this.BUCKET)
          .remove(filePaths);
        
        if (storageError) {
          console.error(`[CleanupService] Error en borrado masivo storage:`, storageError.message);
        }
      }

      // 4. Actualización masiva en DB (Una sola petición SQL)
      console.log(`[CleanupService] Actualizando ${recordIds.length} registros en DB (image_url -> null)...`);
      const { error: dbError } = await supabase
        .from('image_generations')
        .update({ image_url: null })
        .in('id', recordIds);

      if (dbError) {
        throw dbError;
      }

      console.log(`[CleanupService] ¡Limpieza completada con éxito! Registros procesados: ${expiredRecords.length}`);

      return {
        success: true,
        processed: expiredRecords.length,
        cleaned: expiredRecords.length
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
