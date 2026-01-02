const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRole);

async function cleanup() {
  console.log('--- Iniciando limpieza de generaciones expiradas ---');

  const now = new Date().toISOString();

  // 1. Obtener registros expirados
  const { data: expiredGenerations, error: fetchError } = await supabase
    .from('image_generations')
    .select('id, image_url')
    .lt('expires_at', now);

  if (fetchError) {
    console.error('Error al obtener generaciones expiradas:', fetchError);
    return;
  }

  if (!expiredGenerations || expiredGenerations.length === 0) {
    console.log('No hay generaciones expiradas para limpiar.');
    return;
  }

  console.log(`Se encontraron ${expiredGenerations.length} registros expirados.`);

  for (const gen of expiredGenerations) {
    try {
      // 2. Borrar del Storage si tiene URL
      if (gen.image_url && gen.image_url.includes('generations/')) {
        const pathPart = gen.image_url.split('visual-references/')[1];
        if (pathPart) {
          const { error: storageError } = await supabase.storage
            .from('visual-references')
            .remove([pathPart]);

          if (storageError) {
            console.error(`Error al borrar archivo de storage para ${gen.id}:`, storageError);
          } else {
            console.log(`Archivo borrado: ${pathPart}`);
          }
        }
      }

      // 3. Borrar de la base de datos
      const { error: dbError } = await supabase
        .from('image_generations')
        .delete()
        .eq('id', gen.id);

      if (dbError) {
        console.error(`Error al borrar registro de DB para ${gen.id}:`, dbError);
      } else {
        console.log(`Registro DB borrado: ${gen.id}`);
      }
    } catch (err) {
      console.error(`Error procesando limpieza para ${gen.id}:`, err);
    }
  }

  console.log('--- Limpieza completada ---');
}

cleanup();
