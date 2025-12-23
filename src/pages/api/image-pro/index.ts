import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''
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
    .select('role, plan, google_api_key, image_gen_count')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('[api/image-pro] Profile error:', profileError);
    return NextResponse.json({ error: 'Perfil no encontrado.' }, { status: 403 });
  }

  const role = profile.role?.toLowerCase();
  const plan = profile.plan?.toLowerCase();

  if (role !== 'superadmin' && role !== 'admin') {
    return NextResponse.json({ error: 'Acceso denegado. Se requiere ser Administrador.' }, { status: 403 });
  }

  if (plan !== 'premium') {
    return NextResponse.json({ error: 'Acceso denegado. Se requiere un Plan Premium.' }, { status: 403 });
  }

  const apiKey = profile.google_api_key;
  if (!apiKey) {
    return NextResponse.json({ error: 'Falta la Google AI Key en tu perfil.' }, { status: 400 });
  }

  // Parsear el body (en Edge se usa asincrónicamente)
  const body = await req.json();
  const { prompt, referenceImage, productData, aspectRatio, isCorrection, previousImageUrl } = body;

  try {
    // 1. Obtener plantillas globales para inspiración
    const { data: globalTemplates } = await supabaseAdmin
      .from('image_pro_templates')
      .select('name, url')
      .limit(3);

    const inspirationNames = globalTemplates?.map((t: any) => t.name).join(', ') || 'profesional';

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-image-preview' });

    // Consolidar el prompt estratégico
    let strategicPrompt = `Genera una imagen publicitaria de alta resolución para el producto: ${productData.name}. 
    Contexto: ${productData.angle}. 
    Público objetivo: ${productData.buyer}.
    Instrucciones de diseño base: ${productData.details || 'Estilo profesional y limpio'}.
    Inspiración global: Basado en estilos tipo ${inspirationNames}.
    Relación de aspecto: ${aspectRatio}.`;

    if (isCorrection) {
      strategicPrompt += `\nESTA ES UNA CORRECCIÓN. Mantén la consistencia con la imagen anterior pero aplica estos cambios: ${prompt}`;
    } else {
      strategicPrompt += `\nRequisito visual específico: ${prompt}`;
    }

    const parts: any[] = [{ text: strategicPrompt }];

    if (isCorrection && previousImageUrl) {
       const base64Data = previousImageUrl.split(',')[1] || previousImageUrl;
       const mimeType = previousImageUrl.match(/data:(.*?);/)?.[1] || 'image/png';
       parts.push({ inlineData: { data: base64Data, mimeType } });
    } else if (referenceImage) {
      const base64Data = referenceImage.split(',')[1] || referenceImage;
      const mimeType = referenceImage.match(/data:(.*?);/)?.[1] || 'image/png';
      parts.push({ inlineData: { data: base64Data, mimeType } });
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }]
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
    
    // Actualizar contador
    await supabaseAdmin
      .from('profiles')
      .update({ image_gen_count: (profile.image_gen_count || 0) + 1 })
      .eq('user_id', user.id);

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
