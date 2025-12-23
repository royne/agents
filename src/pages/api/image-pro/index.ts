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

  // Parsear el body
  const body = await req.json();
  const { 
    prompt, 
    referenceImage, // Puede ser el estilo anterior o el template
    productData, 
    aspectRatio, 
    isCorrection, 
    previousImageUrl // Usado como imagen de producto base o para edición
  } = body;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-image-preview' });

    // Consolidar el prompt estratégico
    let strategicPrompt = `HIGH-END ADVERTISEMENT GENERATION
    PRODUCT: ${productData.name}
    CORE ANGLE: ${productData.angle}
    TARGET AUDIENCE: ${productData.buyer}
    DESIGN GUIDES: ${productData.details || 'Professional studio lighting'}
    ASPECT RATIO: ${aspectRatio}
    
    CRITICAL INSTRUCTION: You MUST keep the EXACT IDENTITY of the product shown in the images. 
    However, the ENVIRONMENT, BACKGROUND and COMPOSITION must follow the directive: ${prompt}`;

    if (isCorrection) {
      strategicPrompt = `IMAGE REFINEMENT: Keep the current image but apply these specific modifications: ${prompt}. Do not change the product identity.`;
    }

    const parts: any[] = [{ text: strategicPrompt }];

    // Añadir imágenes de referencia (Imagen 3 soporta hasta algunas imágenes como contexto)
    
    // 1. Añadir el PRODUCTO BASE como referencia principal de objeto si existe
    if (previousImageUrl) {
       const base64 = previousImageUrl.split(',')[1] || previousImageUrl;
       const mime = previousImageUrl.match(/data:(.*?);/)?.[1] || 'image/png';
       parts.push({ text: "REFERENCE PRODUCT IDENTITY (Keep this object exactly):" });
       parts.push({ inlineData: { data: base64, mimeType: mime } });
    }

    // 2. Añadir la REFERENCIA DE ESTILO (Paso anterior o Template) si existe
    if (referenceImage && referenceImage !== previousImageUrl) {
      const base64 = referenceImage.split(',')[1] || referenceImage;
      const mime = referenceImage.match(/data:(.*?);/)?.[1] || 'image/png';
      parts.push({ text: "VISUAL STYLE REFERENCE (Follow this lighting/mood):" });
      parts.push({ inlineData: { data: base64, mimeType: mime } });
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
