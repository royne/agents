import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sectionId } = req.query;

    if (!sectionId) {
      return res.status(400).json({ error: 'sectionId is required.' });
    }

    const category = `landing-${sectionId.toString().toLowerCase()}`;

    const { data: rawData, error } = await supabase
      .from('visual_references')
      .select('id, name, url, base_category')
      .eq('base_category', category)
      // Remove strict template filter for now as local images are 'inspiration'
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Aleatorizar los resultados
    const shuffledData = (rawData || []).sort(() => Math.random() - 0.5);

    return res.status(200).json({
      success: true,
      data: shuffledData
    });

  } catch (error: any) {
    console.error('[API/V2/Landing/References] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
