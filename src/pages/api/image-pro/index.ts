import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CreditService } from '../../../lib/creditService';
import { ImageProRequest } from '../../../services/image-pro/types';
import { AdsService } from '../../../services/image-pro/adsService';
import { PersonaService } from '../../../services/image-pro/personaService';
import { LandingService } from '../../../services/image-pro/landingService';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
  }

  // Inicializar Supabase con Service Role para bypass de RLS tras validación manual
  // Necesitamos el service role porque en Edge Runtime el cliente anon no hereda la sesión automáticamente para RLS
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  // Obtener usuario mediante el token Bearer (el frontend ya lo envía)
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  
  if (!token) {
    return NextResponse.json({ error: 'No autorizado. Falta token de acceso.' }, { status: 401 });
  }

  // Validar el token con el cliente normal
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    console.error('[api/image-pro] Auth error:', authError);
    return NextResponse.json({ error: 'Sesión inválida o expirada.' }, { status: 401 });
  }

  // Obtener perfil usando el cliente admin para asegurar que RLS no bloquee la lectura administrativa
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role, plan, image_gen_count') // Ya no seleccionamos google_api_key
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('[api/image-pro] Profile error:', profileError);
    return NextResponse.json({ error: 'Perfil no encontrado.' }, { status: 403 });
  }

  const role = profile?.role?.toLowerCase();
  
  // BYPASS: Super Admin y Owner no necesitan validación de créditos (unlimited_credits se maneja en el service)
  const isSuperAdmin = role === 'owner' || role === 'superadmin' || role === 'super_admin';

  // Validar créditos ANTES de la generación
  const { can, balance } = await CreditService.canPerformAction(user.id, 'IMAGE_GEN', supabaseAdmin);
  
  if (!can && !isSuperAdmin) {
    return NextResponse.json({ 
      error: 'Créditos insuficientes.', 
      balance,
      required: 10
    }, { status: 402 });
  }

  const apiKey = process.env.GOOGLE_AI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Configuración de servidor incompleta: Falta Google AI Key.' }, { status: 500 });
  }

  // Parsear el body
  const body = await req.json() as ImageProRequest;
  const { 
    mode,
    subMode,
    prompt, 
    referenceImage, 
    referenceType,  
    productData, 
    aspectRatio, 
    isCorrection, 
    previousImageUrl 
  } = body;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-image-preview' });

    // DISPATCHER DE SERVICIOS
    let promptConfig;
    
    switch (mode) {
      case 'ads':
        promptConfig = await AdsService.buildPrompt(body);
        break;
      case 'personas':
        promptConfig = await PersonaService.buildPrompt(body);
        break;
      case 'landing':
        promptConfig = await LandingService.buildPrompt(body);
        break;
      default:
        // Lógica "Libre" o default
        const strategicPrompt = `PROFESSIONAL PHOTOGRAPHY: ${prompt} | Aspect Ratio: ${aspectRatio}`;
        const parts: any[] = [{ text: strategicPrompt }];
        // Usar lógica base para imágenes
        if (previousImageUrl) {
           const base64 = previousImageUrl.split(',')[1] || previousImageUrl;
           const mime = previousImageUrl.match(/data:(.*?);/)?.[1] || 'image/png';
           parts.push({ text: "REFERENCE IMAGE:" });
           parts.push({ inlineData: { data: base64, mimeType: mime } });
        }
        promptConfig = { strategicPrompt, parts };
    }

    // MODO DEBUG: Retornar configuración sin generar imagen
    if (body.debug) {
      return NextResponse.json({
        success: true,
        debug: true,
        strategicPrompt: promptConfig.strategicPrompt,
        partsCount: promptConfig.parts.length,
        partsPreview: promptConfig.parts.map((p: any) => ({ 
          type: p.inlineData ? 'image' : 'text', 
          content: p.text || `Reference Image (${p.inlineData?.mimeType})` 
        }))
      });
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: promptConfig.parts }]
    });

    const response = await result.response;
    const candidates = (response as any).candidates;
    let imageUrl = null;

    if (candidates && candidates[0]?.content?.parts[0]?.inlineData) {
      const imageData = candidates[0].content.parts[0].inlineData;
      imageUrl = `data:${imageData.mimeType};base64,${imageData.data}`;
    } else {
      throw new Error('No se recibió una imagen válida del modelo Imagen 3.');
    }
    
    // Actualizar contador y CONSUMIR CRÉDITOS
    await CreditService.consumeCredits(user.id, 'IMAGE_GEN', { prompt: prompt.substring(0, 100) }, supabaseAdmin);

    return NextResponse.json({ 
      success: true, 
      imageUrl: imageUrl,
      message: 'Imagen generada con éxito'
    });

  } catch (error: any) {
    console.error('Error al generar imagen:', error);
    return NextResponse.json({ error: error.message || 'Error interno al procesar la imagen' }, { status: 500 });
  }
}
