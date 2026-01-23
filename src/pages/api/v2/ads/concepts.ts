import { NextRequest, NextResponse } from 'next/server';
import { FacebookAdsAgent } from '../../../../lib/agents/FacebookAdsAgent';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { productData, landingStructure } = await req.json();

    if (!productData || !landingStructure) {
      return NextResponse.json({ success: false, error: 'Product data and landing structure are required.' }, { status: 400 });
    }

    console.log('[API/V2/Ads/Concepts] Generating concepts for:', productData.name);
    const concepts = await FacebookAdsAgent.generateAdConcepts(productData, landingStructure);

    return NextResponse.json({
      success: true,
      data: concepts
    });

  } catch (error: any) {
    console.error('[API/V2/Ads/Concepts] Error:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
