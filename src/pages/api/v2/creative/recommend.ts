import type { NextApiRequest, NextApiResponse } from 'next';
import { CreativeDirector } from '../../../../lib/agents/CreativeDirector';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productData } = req.body;

    if (!productData) {
      return res.status(400).json({ error: 'Missing product data' });
    }

    const paths = await CreativeDirector.recommend(productData);

    return res.status(200).json({
      success: true,
      data: paths
    });

  } catch (error: any) {
    console.error('[API/Creative/Recommend] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
