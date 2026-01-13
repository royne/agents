const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

/**
 * Script de ejecución manual para limpieza de imágenes.
 * Sigue la misma lógica que ImageCleanupService.ts
 */
const EXPIRATION_HOURS = 48;
const BUCKET = 'temp-generations';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('ERROR: Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRole);

async function cleanup() {
  console.log(`--- [${new Date().toISOString()}] Iniciando limpieza local (> ${EXPIRATION_HOURS}h - Plan FREE) ---`);

  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() - EXPIRATION_HOURS);
  const expirationIso = expirationDate.toISOString();

  const { data: expiredRecords, error: fetchError } = await supabase
    .from('image_generations')
    .select(`id, image_url, user_credits!inner (plan_key)`)
    .eq('user_credits.plan_key', 'free')
    .not('image_url', 'is', null)
    .lt('created_at', expirationIso);

  if (fetchError) {
    console.error('Error:', fetchError);
    return;
  }

  if (!expiredRecords || expiredRecords.length === 0) {
    console.log('No hay imágenes para limpiar.');
    return;
  }

  console.log(`Procesando ${expiredRecords.length} registros...`);

  for (const record of expiredRecords) {
    try {
      const imageUrl = record.image_url;
      if (imageUrl && imageUrl.includes(`/${BUCKET}/`)) {
        const parts = imageUrl.split(`/${BUCKET}/`);
        if (parts.length > 1) {
          const filePath = parts[1];
          await supabase.storage.from(BUCKET).remove([filePath]);
          console.log(`  [OK] Borrado de storage: ${filePath}`);
        }
      }

      await supabase.from('image_generations').update({ image_url: null }).eq('id', record.id);
      console.log(`  [OK] Registro ${record.id} actualizado.`);
    } catch (err) {
      console.error(`  [ERR] Error en ${record.id}:`, err.message);
    }
  }

  console.log('--- Limpieza completada ---');
}

cleanup();
