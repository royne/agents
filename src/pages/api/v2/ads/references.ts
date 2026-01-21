import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Para Ads, por ahora usaremos una categoría general o específica si se requiere en el futuro
    const category = 'ads-mockup';

    const { data, error } = await supabase
      .from('visual_references')
      .select('id, name, url, base_category')
      .eq('base_category', category)
      .order('created_at', { ascending: false })
      .limit(12); // Aumentamos un poco el límite para ads

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data || []
    });

  } catch (error: any) {
    console.error('[API/V2/Ads/References] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
