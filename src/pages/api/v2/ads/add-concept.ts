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
    const { productData, landingStructure, existingConcepts, launchId } = await req.json();

    if (!productData || !landingStructure || !existingConcepts) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product data, landing structure and existing concepts are required.' 
      }, { status: 400 });
    }

    console.log('[API/V2/Ads/AddConcept] Suggesting one more concept for:', productData.name);
    const newConcept = await FacebookAdsAgent.addAdConcept(productData, landingStructure, existingConcepts);

    // Update Launch record if launchId is provided
    if (launchId) {
      const launchService = LaunchService.createWithAdmin();
      const updatedConcepts = [...existingConcepts, newConcept];
      await launchService.update(launchId, { 
        ad_concepts: updatedConcepts
      });
    }

    return NextResponse.json({
      success: true,
      data: newConcept
    });

  } catch (error: any) {
    console.error('[API/V2/Ads/AddConcept] Error:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
