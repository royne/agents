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
    const { productData, currentConcept, feedback } = await req.json();

    if (!productData || !currentConcept) {
      return NextResponse.json({ success: false, error: 'Product data and current concept are required.' }, { status: 400 });
    }

    console.log('[API/V2/Ads/Refine] Refining concept:', currentConcept.id);
    const refined = await FacebookAdsAgent.refineAdConcept(productData, currentConcept, feedback);

    return NextResponse.json({
      success: true,
      data: refined
    });

  } catch (error: any) {
    console.error('[API/V2/Ads/Refine] Error:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
