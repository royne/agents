import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { CreditService } from '../../../lib/creditService';
import { ImageProRequest, StrategicPromptResponse } from '../../../services/image-pro/types';
import { AdsService } from '../../../services/image-pro/adsService';
import { PersonaService } from '../../../services/image-pro/personaService';
import { LandingService } from '../../../services/image-pro/landingService';
import { BaseImageProService } from '../../../services/image-pro/baseService';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: { sizeLimit: '50mb' },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const googleKey = process.env.GOOGLE_AI_KEY || '';

  // 1. Extraer el usuario REAL del token (crítico para créditos)
  const userId = get_user_id_from_auth(req);
  if (!userId) {
    return res.status(401).json({ error: 'No autorizado o token inválido' });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
  const body = req.body as ImageProRequest;
  const { mode, subMode, prompt } = body;

  // 2. Generar ID y Crear registro inicial SÍNCRONO (para evitar 404 en el polling inicial)
  const generationId = crypto.randomUUID();
  const { error: insertError } = await supabaseAdmin.from('image_generations').insert({
    id: generationId,
    user_id: userId,
    status: 'pending',
    prompt: prompt.substring(0, 500),
    mode,
    sub_mode: subMode
  });

  if (insertError) {
    console.error("Error creando registro inicial:", insertError);
    return res.status(500).json({ error: 'Error al iniciar la generación' });
  }

  res.status(200).json({ 
    success: true, 
    generationId,
    message: 'Generación iniciada'
  });

  // 3. Proceso de fondo
  setImmediate(async () => {
    try {
      console.log(`[BG] Iniciando generación ${generationId} para usuario ${userId}`);

      // B. Construir Prompt Estratégico
      let promptConfig: StrategicPromptResponse;
      switch (mode) {
        case 'ads': promptConfig = await AdsService.buildPrompt(body); break;
        case 'personas': promptConfig = await PersonaService.buildPrompt(body); break;
        case 'landing': promptConfig = await LandingService.buildPrompt(body); break;
        default:
          const parts: any[] = [{ text: `PROFESSIONAL PHOTOGRAPHY: ${prompt}` }];
          if (body.previousImageUrl) {
            const imageData = await BaseImageProService.imageUrlToBase64(body.previousImageUrl);
            if (imageData) parts.push({ inlineData: { data: imageData.data, mimeType: imageData.mimeType } });
          }
          promptConfig = { strategicPrompt: prompt, parts };
      }

      // C. Generación con Google AI
      const modelId = "gemini-3-pro-image-preview";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${googleKey}`;
      
      const geminiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: promptConfig.parts }] })
      });

      const result = await geminiRes.json();
      const imagePart = result.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

      if (!imagePart) {
        throw new Error(result.error?.message || 'Google AI no entregó imagen');
      }

      // D. Subida a Storage
      const fileName = `${generationId}.png`;
      const binaryData = Buffer.from(imagePart.inlineData.data, 'base64');

      const { error: uploadError } = await supabaseAdmin.storage
        .from('visual-references')
        .upload(`generations/${fileName}`, binaryData, { contentType: 'image/png', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('visual-references')
        .getPublicUrl(`generations/${fileName}`);

      // E. CONSUMO DE CRÉDITOS (Paso crítico)
      const creditRes = await CreditService.consumeCredits(userId, 'IMAGE_GEN', { 
        prompt: prompt.substring(0, 200), 
        generation_id: generationId, 
        image_url: publicUrl 
      }, supabaseAdmin);

      if (!creditRes.success) {
        console.warn(`[BG] Créditos no deducidos para ${userId}: ${creditRes.error}`);
      }

      // F. Finalizar registro
      await supabaseAdmin.from('image_generations').update({ 
        status: 'completed', 
        image_url: publicUrl 
      }).eq('id', generationId);
      
      console.log(`[BG] ¡Generación exitosa! ${generationId}`);

    } catch (err: any) {
      console.error(`[BG] Error fatal en generación ${generationId}:`, err.message);
      await supabaseAdmin.from('image_generations').update({ 
        status: 'failed', 
        error_message: err.message 
      }).eq('id', generationId);
    }
  });
}

/**
 * Extrae de forma segura el UUID del usuario desde el JWT o del body como último recurso (solo si coincide)
 */
function get_user_id_from_auth(req: NextApiRequest): string | null {
  try {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return payload.sub; // 'sub' es el estándar para user_id en Supabase Auth
    }
    
    // Si no hay header, intentamos del body si viene explícito (menos seguro but fallback)
    return (req.body as any).userId || null;
  } catch (err) {
    console.error("Error decodificando token:", err);
    return null;
  }
}
