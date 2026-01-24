import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { CreditService } from '../../../lib/creditService';
import { VideoProService, VideoProRequest } from '../../../services/image-pro/videoService';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
  }

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

  try {
    // Usamos el modelo vea-3.1-fast-generate-preview que soporta predictLongRunning
    const modelId = "veo-3.1-fast-generate-preview";
    const restPayload = await VideoProService.buildRestInstances(body);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predictLongRunning?key=${apiKey}`;


    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(restPayload)
    });

    const operation = await response.json();

    if (operation.error) {
      // REGISTRAR FALLO EN HISTORIAL
      await supabaseAdmin.from('image_generations')
        .update({ status: 'failed', error_message: operation.error.message })
        .eq('operation_name', operation.name); // Assuming operation.name would be available even on error for tracking
      throw new Error(operation.error.message || 'Error en la API de Google');
    }

    // Retornamos el nombre de la operación para que el cliente haga polling
    // PERSISTENCIA EN DB PARA EL HISTORIAL
    try {
      await supabaseAdmin.from('image_generations').insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        status: 'pending',
        prompt: `Video: ${body.productData?.name || 'UGC'} - ${body.script?.substring(0, 100)}`,
        mode: 'video',
        operation_name: operation.name
      });
    } catch (dbErr) {
      console.warn('Error al guardar registro de video inicial:', dbErr);
    }

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
