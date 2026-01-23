import { NextRequest, NextResponse } from 'next/server';
import { LandingDesignerAgent } from '../../../../lib/agents/LandingDesignerAgent';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { productData, creativePath } = await req.json();

    if (!productData || !creativePath) {
      return NextResponse.json({ error: 'productData and creativePath are required.' }, { status: 400 });
    }

    const structure = await LandingDesignerAgent.suggestStructure(productData, creativePath);

    return NextResponse.json({
      success: true,
      data: structure
    });

  } catch (error: any) {
    console.error('[API/V2/Landing/Design] Error:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
