import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../../../types/database';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createPagesServerClient<Database>({ req, res });

  // 1. Check authentication and roles
  let requesterId: string | undefined;
  
  // Try session first (cookie-based)
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    requesterId = session.user.id;
  } else {
    // Fallback to Bearer token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (!authError && user) {
        requesterId = user.id;
      }
    }
  }

  if (!requesterId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', requesterId)
    .single();

  const isAdmin = profile?.role === 'superadmin' || profile?.role === 'owner';
  
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden. Only superadmin can purge.' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const BUCKET = 'temp-generations';

    // Fetch all image_generations for the user
    const { data: records, error: fetchError } = await supabaseAdmin
      .from('image_generations')
      .select('id, image_url')
      .eq('user_id', userId);

    if (fetchError) throw fetchError;

    if (!records || records.length === 0) {
      return res.status(200).json({ success: true, message: 'El usuario no tiene imágenes generadas.', count: 0 });
    }

    const filePaths: string[] = [];
    const dbIds: string[] = [];

    records.forEach(record => {
      dbIds.push(record.id);
      if (record.image_url && record.image_url.includes(`/${BUCKET}/`)) {
        const parts = record.image_url.split(`/${BUCKET}/`);
        if (parts.length > 1) {
          filePaths.push(parts[1]);
        }
      }
    });

    console.log(`[PurgeUserImages] Preparando para borrar ${filePaths.length} archivos de storage y ${dbIds.length} reg en DB para user ${userId}...`);

    // Delete from storage in batches of 100 to avoid limits
    let storageDeletedCount = 0;
    const chunkSize = 100;
    for (let i = 0; i < filePaths.length; i += chunkSize) {
      const pathsChunk = filePaths.slice(i, i + chunkSize);
      const { error: storageError } = await supabaseAdmin.storage
        .from(BUCKET)
        .remove(pathsChunk);
      
      if (storageError) {
        console.error(`[PurgeUserImages] Error borrando chunk ${i}:`, storageError.message);
      } else {
        storageDeletedCount += pathsChunk.length;
      }
    }

    // Delete from DB
    const { error: dbError } = await supabaseAdmin
      .from('image_generations')
      .delete()
      .eq('user_id', userId);

    if (dbError) throw dbError;

    return res.status(200).json({ 
      success: true, 
      message: `Se limpiaron exitosamente ${storageDeletedCount} archivos del storage y ${dbIds.length} registros de la base de datos.`,
      count: dbIds.length
    });
  } catch (err: any) {
    console.error('[API/Admin/PurgeUserImages] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
