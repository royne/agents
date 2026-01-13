import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { ImageCleanupService } from '../../../services/image-pro/cleanupService';

/**
 * Endpoint para ejecución de Cron Job en Vercel
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Verificar secreto de Vercel Cron
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRole) {
    return res.status(500).json({ error: 'Faltan variables de configuración' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRole);

  try {
    const result = await ImageCleanupService.cleanupExpiredFreeImages(supabase);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    return res.status(200).json(result);

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
