import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CreditService } from '../../../lib/creditService';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const operationName = searchParams.get('operationName');
  
  if (!operationName) {
    return NextResponse.json({ error: 'Falta operationName' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_AI_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Falta Google AI Key' }, { status: 500 });

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`;
    const response = await fetch(url);
    const operation = await response.json();

    if (operation.error) {
      // REGISTRAR FALLO EN HISTORIAL
      const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
      await supabaseAdmin.from('image_generations')
        .update({ status: 'failed', error_message: operation.error.message })
        .eq('operation_name', operationName);

      return NextResponse.json({ error: operation.error.message }, { status: 500 });
    }

    if (operation.done) {
      if (operation.response) {
        const videoResponse = operation.response;
        
        // Estructuras posibles de respuesta segun version de API (Gemini vs Vertex vs Veo REST)
        const videoOutput = videoResponse.generateVideoResponse?.generatedSamples?.[0]?.video ||
                            videoResponse.outputs?.[0]?.video || 
                            videoResponse.predictions?.[0]?.video || 
                            videoResponse.video;

        const videoUrl = typeof videoOutput === 'string' ? videoOutput : (videoOutput?.uri || videoOutput?.url);

        if (!videoUrl) {
          // Revisar si fue por filtros de seguridad (RAI)
          if (videoResponse.generateVideoResponse?.raiMediaFilteredCount > 0) {
            const reasons = videoResponse.generateVideoResponse?.raiMediaFilteredReasons || [];
            return NextResponse.json({ 
              error: 'La generación fue bloqueada por filtros de seguridad.', 
              details: reasons.join('. '),
              raiError: true 
            }, { status: 422 });
          }

          console.error('No se pudo extraer videoUrl. Response completa:', JSON.stringify(videoResponse));
          return NextResponse.json({ error: 'No se generó un video válido en la respuesta' }, { status: 500 });
        }

        // Devolver URL a través de nuestro proxy para evitar 403 y ocultar API Key
        const proxiedUrl = `/api/video-pro/proxy?url=${encodeURIComponent(videoUrl)}`;

        // Si tenemos éxito, consumimos créditos aquí (o lo hacemos al inicio, pero mejor al éxito)
        // Necesitamos el userId para consumir créditos. Lo pasaremos en el polling o lo sacamos del token.
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
        
        if (token) {
          const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
          const { data: { user } } = await supabaseAdmin.auth.getUser(token);
          if (user) {
            await CreditService.consumeCredits(user.id, 'VIDEO_GEN', { operation: operationName }, supabaseAdmin);
            
            // ACTUALIZAR HISTORIAL
            await supabaseAdmin.from('image_generations')
              .update({ status: 'completed', image_url: proxiedUrl })
              .eq('operation_name', operationName);
          }
        }

        return NextResponse.json({ 
          done: true, 
          videoUrl: proxiedUrl,
          rawVideoUri: videoUrl,
          success: true 
        });
      }
    }

    return NextResponse.json({ done: false, message: 'Procesando...' });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
