import { NextRequest, NextResponse } from 'next/server';
import { FacebookAdsAgent } from '../../../../lib/agents/FacebookAdsAgent';
import { LaunchService } from '../../../../services/launches/launchService';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { productData, landingStructure, launchId } = await req.json();

    if (!productData || !landingStructure) {
      return NextResponse.json({ success: false, error: 'Product data and landing structure are required.' }, { status: 400 });
    }

    console.log('[API/V2/Ads/Concepts] Generating concepts for:', productData.name);
    const concepts = await FacebookAdsAgent.generateAdConcepts(productData, landingStructure);

    // Update Launch record if launchId is provided
    if (launchId) {
      const launchService = LaunchService.createWithAdmin();
      await launchService.update(launchId, { 
        ad_concepts: concepts
      });
    }

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
