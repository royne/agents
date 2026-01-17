import { NextRequest, NextResponse } from 'next/server';
import { DiscoveryService } from '../../../../lib/agents/DiscoveryService';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();
    const { url, imageBase64 } = body;

    if (!url && !imageBase64) {
      return NextResponse.json({ error: 'Please provide either a product URL or an image.' }, { status: 400 });
    }

    const productData = await DiscoveryService.discover({ url, imageBase64 });

    return NextResponse.json({
      success: true,
      data: productData
    });

  } catch (error: any) {
    console.error('[API Discovery Error]:', error.message);
    return NextResponse.json({ 
      error: 'Failed to analyze product. Please try again or provide details manually.',
      details: error.message 
    }, { status: 500 });
  }
}
