const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

/**
 * CONFIGURACIÓN
 */
const EXPIRATION_HOURS = 48;
const BUCKETS = ['temp-generations'];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('ERROR: Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRole);

async function cleanup() {
  console.log(`--- [${new Date().toISOString()}] Iniciando limpieza de imágenes (> ${EXPIRATION_HOURS}h - Plan FREE) ---`);

  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() - EXPIRATION_HOURS);
  const expirationIso = expirationDate.toISOString();

  // 1. Obtener registros de usuarios FREE que tienen imagen y son antiguos
  // Nota: Hacemos un join manual filtrando profiles.plan = 'free'
  const { data: expiredRecords, error: fetchError } = await supabase
    .from('image_generations')
    .select(`
      id, 
      image_url, 
      user_id,
      profiles!inner (
        plan
      )
    `)
    .eq('profiles.plan', 'free')
    .not('image_url', 'is', null)
    .lt('created_at', expirationIso);

  if (fetchError) {
    console.error('Error al obtener registros expirados:', fetchError);
    return;
  }

  if (!expiredRecords || expiredRecords.length === 0) {
    console.log('No hay imágenes expiradas para borrar.');
    return;
  }

  console.log(`Se encontraron ${expiredRecords.length} registros para procesar.`);

  let successCount = 0;
  let errorCount = 0;

  for (const record of expiredRecords) {
    try {
      const imageUrl = record.image_url;
      let fileDeleted = false;

      // Intentar extraer el path para cada bucket conocido
      for (const bucket of BUCKETS) {
        if (imageUrl.includes(`/${bucket}/`)) {
          // Extraer la parte después del nombre del bucket
          // Formato esperado: .../storage/v1/object/public/bucket-name/path/to/file.ext
          const parts = imageUrl.split(`/${bucket}/`);
          if (parts.length > 1) {
            const filePath = parts[1];

            console.log(`Borrando de ${bucket}: ${filePath}`);
            const { error: storageError } = await supabase.storage
              .from(bucket)
              .remove([filePath]);

            if (storageError) {
              console.error(`  [!] Error en Storage (${bucket}):`, storageError.message);
            } else {
              fileDeleted = true;
            }
          }
        }
      }

      // 2. Actualizar registro en DB sin borrarlo
      const { error: dbError } = await supabase
        .from('image_generations')
        .update({ image_url: null })
        .eq('id', record.id);

      if (dbError) {
        console.error(`  [!] Error al actualizar DB para ${record.id}:`, dbError.message);
        errorCount++;
      } else {
        console.log(`  [OK] Registro ${record.id} actualizado (image_url -> null).`);
        successCount++;
      }
    } catch (err) {
      console.error(`  [FATAL] Error procesando registro ${record.id}:`, err);
      errorCount++;
    }
  }

  console.log(`\n--- Resumen ---`);
  console.log(`Procesados: ${expiredRecords.length}`);
  console.log(`Exitosos: ${successCount}`);
  console.log(`Fallidos: ${errorCount}`);
  console.log(`--- Limpieza completada ---`);
}

cleanup().catch(err => {
  console.error('Error no controlado en el proceso de limpieza:', err);
  process.exit(1);
});
