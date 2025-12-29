import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CreditService } from '../../../lib/creditService';
import { VideoProService, VideoProRequest } from '../../../services/image-pro/videoService';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  
  if (!token) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Sesión inválida.' }, { status: 401 });

  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('user_id', user.id).single();
  const isSuperAdmin = ['owner', 'superadmin', 'super_admin'].includes(profile?.role?.toLowerCase() || '');

  const { can, balance } = await CreditService.canPerformAction(user.id, 'VIDEO_GEN', supabaseAdmin);
  if (!can && !isSuperAdmin) return NextResponse.json({ error: 'Créditos insuficientes.', balance, required: 80 }, { status: 402 });

  const apiKey = process.env.GOOGLE_AI_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Falta Google AI Key.' }, { status: 500 });

  const body = await req.json() as VideoProRequest;
  console.log('[VideoPro API] Request:', JSON.stringify(body, null, 2));

  try {
    // Usamos el modelo vea-3.1-fast-generate-preview que soporta predictLongRunning
    const modelId = "veo-3.1-fast-generate-preview";
    const restPayload = await VideoProService.buildRestInstances(body);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predictLongRunning?key=${apiKey}`;

    console.log('[VideoPro API] Sending to Google:', JSON.stringify(restPayload, (key, value) => {
      if (typeof value === 'string' && value.length > 100) return value.substring(0, 50) + '... (truncated)';
      return value;
    }, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(restPayload)
    });

    const operation = await response.json();

    if (operation.error) {
      throw new Error(operation.error.message || 'Error en la API de Google');
    }

    // Retornamos el nombre de la operación para que el cliente haga polling
    return NextResponse.json({ 
      success: true, 
      operationName: operation.name,
      message: 'Generación iniciada'
    });

  } catch (error: any) {
    console.error('Error al iniciar generación de video:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
