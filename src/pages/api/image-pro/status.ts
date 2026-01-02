import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Falta el ID de generación' });

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  try {
    // 1. Obtener registro de la DB directamente
    // La tarea en segundo plano (waitUntil) se encarga de actualizar este registro
    const { data: gen, error: dbError } = await supabaseAdmin
      .from('image_generations')
      .select('*')
      .eq('id', id)
      .single();

    if (dbError || !gen) {
      console.error('[status] Error fetching generation:', dbError);
      return res.status(404).json({ error: 'Generación no encontrada' });
    }

    // 2. Reportar el estado actual
    if (gen.status === 'completed') {
      return res.json({ 
        done: true, 
        success: true, 
        imageUrl: gen.image_url 
      });
    }

    if (gen.status === 'failed') {
      return res.json({ 
        done: true, 
        success: false, 
        error: gen.error_message || 'Error desconocido en segundo plano' 
      });
    }

    // Si sigue en 'pending'
    return res.json({ 
      done: false, 
      status: 'pending', 
      message: 'Generando imagen en segundo plano...' 
    });

  } catch (error: any) {
    console.error('[status] General error:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
