import type { NextApiRequest, NextApiResponse } from 'next';
import { FacebookAdsAgent } from '../../../../lib/agents/FacebookAdsAgent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productData, landingStructure } = req.body;

    if (!productData || !landingStructure) {
      return res.status(400).json({ success: false, error: 'Product data and landing structure are required.' });
    }

    console.log('[API/V2/Ads/Concepts] Generating concepts for:', productData.name);
    const concepts = await FacebookAdsAgent.generateAdConcepts(productData, landingStructure);

    return res.status(200).json({
      success: true,
      data: concepts
    });

  } catch (error: any) {
    console.error('[API/V2/Ads/Concepts] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
