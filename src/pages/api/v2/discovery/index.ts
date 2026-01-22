import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { DiscoveryService } from '../../../../lib/agents/DiscoveryService';
import { CreditService } from '../../../../lib/creditService';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    const { url, imageBase64 } = body;

    if (!url && !imageBase64) {
      return NextResponse.json({ error: 'Please provide either a product URL or an image.' }, { status: 400 });
    }

    // 1. Get User ID from headers
    const userId = get_user_id_from_auth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Credit Check (Pre-check only)
    console.log(`[API/V2/Discovery] Checking credits for user: ${userId}`);
    const { can, balance } = await CreditService.canPerformAction(userId, 'V2_PROJECT', supabaseAdmin);
    
    if (!can) {
      console.warn(`[API/V2/Discovery] Insufficient credits for user: ${userId}`);
      return NextResponse.json({ error: 'Insufficient credits', balance }, { status: 402 });
    }

    // 3. Perform AI Analysis (BEFORE consumption)
    const productData = await DiscoveryService.discover({ url, imageBase64 });

    // 4. Consume the credits (ONLY after successful analysis)
    const consumption = await CreditService.consumeCredits(userId, 'V2_PROJECT', { 
      type: 'discovery',
      input: url ? 'url' : 'image',
      productName: productData.name
    }, supabaseAdmin);

    if (!consumption.success) {
      return NextResponse.json({ error: consumption.error || 'Failed to consume credits.' }, { status: 402 });
    }

    return NextResponse.json({
      success: true,
      data: productData
    });

  } catch (error: any) {
    console.error('[API Discovery Error]:', error.message);
    
    // Si es un error de sobrecarga de Google (503), reportarlo claramente
    const isOverloaded = error.message.includes('503') || error.message.toLowerCase().includes('overloaded');
    const userMessage = isOverloaded 
      ? 'La IA de Google está sobrecargada actualmente. Por favor, reintenta en unos momentos. No se han descontado créditos.'
      : 'Error al analizar el producto. Por favor intenta de nuevo o ingresa los datos manualmente.';

    return NextResponse.json({ 
      error: userMessage,
      details: error.message,
      isOverloaded
    }, { status: 500 });
  }
}

function get_user_id_from_auth(req: NextRequest): string | null {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson);
      return payload.sub;
    }
    return null;
  } catch (err) {
    return null;
  }
}
