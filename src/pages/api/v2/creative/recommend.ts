import { NextRequest, NextResponse } from 'next/server';
import { CreativeDirector } from '../../../../lib/agents/CreativeDirector';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { productData } = await req.json();

    if (!productData) {
      return NextResponse.json({ error: 'Missing product data' }, { status: 400 });
    }

    const paths = await CreativeDirector.recommend(productData);

    return NextResponse.json({
      success: true,
      data: paths
    });

  } catch (error: any) {
    console.error('[API/Creative/Recommend] Error:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
