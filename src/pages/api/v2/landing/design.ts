import type { NextApiRequest, NextApiResponse } from 'next';
import { LandingDesignerAgent } from '../../../../lib/agents/LandingDesignerAgent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productData, creativePath } = req.body;

    if (!productData || !creativePath) {
      return res.status(400).json({ error: 'productData and creativePath are required.' });
    }

    const structure = await LandingDesignerAgent.suggestStructure(productData, creativePath);

    return res.status(200).json({
      success: true,
      data: structure
    });

  } catch (error: any) {
    console.error('[API/V2/Landing/Design] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
