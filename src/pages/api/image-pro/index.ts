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
    referenceType,  // 'style' o 'layout'
    productData, 
    aspectRatio, 
    isCorrection, 
    previousImageUrl // Usado como imagen de producto base o para edición
  } = body;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-image-preview' });

    // Consolidar el prompt estratégico - REFORZADO PARA AISLAMIENTO
    // Consolidar el prompt estratégico - MÁXIMO PODER DE MARKETING
    let strategicPrompt = `PREMIUM COMMERCIAL PHOTOGRAPHY & MARKETING DESIGN
    PRODUCT IDENTITY: ${productData.name}
    MARKETING STRATEGY (CRITICAL): 
    - SELL TO: ${productData.buyer || 'High-end premium customers'}
    - CORE ANGLE: ${productData.angle || 'Exclusivity and superior quality'}
    - VISUAL GOAL: ${productData.details || 'Professional studio lighting, sharp focus'}
    
    SECTION OBJECTIVE: ${prompt}
    
    CRITICAL INSTRUCTION (SECTION ISOLATION): 
    - You are generating a SPECIFIC section or advertisement.
    - DO NOT include pricing info, pricing tables, or marketing copy from PREVIOUS sections.
    - If you see prices or offer details in a reference image, YOU MUST IGNORE THEM. This is a NEW design with its own unique focus.
    
    STRICT VISUAL DIRECTIVES:
    - ASPECT RATIO: ${aspectRatio}
    - TYPOGRAPHY & TEXT: ${
      /RENDER|HEADLINE|TEXT|COPY|ACTION|STAMP/i.test(prompt)
        ? "RENDER professional, clean, and legible typography only for the requested headlines/copy. Integrate it artistically into the design."
        : "DO NOT add any text, labels, or watermarks to the image. Keep it purely visual."
    }
    - Focus on visual storytelling that resonates with the target audience.
    
    REFERENCE HANDLING: 
    - If REFERENCE TYPE is 'layout': Follow the composition and skeleton strictly.
    - If REFERENCE TYPE is 'style': Follow ONLY colors, lighting, and "vibe". IGNORE object placement from the reference.`;

    if (isCorrection) {
      strategicPrompt = `IMAGE REFINEMENT & CORE ALIGNMENT:
      Maintain the current visual identity, product features, and marketing core.
      CORE STRATEGY (STAY TRUE TO THIS): 
      - TARGET: ${productData.buyer || 'High-end premium customers'}
      - ANGLE: ${productData.angle || 'Exclusivity and superior quality'}
      
      NEW MODIFICATION REQUEST: ${prompt}
      
      INSTRUCTION: Apply the modification while keeping the product and brand consistency. Do not change the layout or background drastically unless the request implies it.`;
    }

    const parts: any[] = [{ text: strategicPrompt }];

    // Añadir imágenes de referencia
    
    // 1. Añadir el PRODUCTO BASE como referencia principal de objeto
    if (previousImageUrl) {
       const base64 = previousImageUrl.split(',')[1] || previousImageUrl;
       const mime = previousImageUrl.match(/data:(.*?);/)?.[1] || 'image/png';
       parts.push({ text: "ITEM 1: REFERENCE PRODUCT IDENTITY (Strictly keep this object/character):" });
       parts.push({ inlineData: { data: base64, mimeType: mime } });
    }

    // 2. Añadir la REFERENCIA DE ESTILO/LAYOUT
    if (referenceImage && referenceImage !== previousImageUrl) {
      let base64Data = referenceImage;
      let mimeType = 'image/png';

      if (referenceImage.startsWith('http')) {
        try {
          const imgRes = await fetch(referenceImage);
          const arrayBuffer = await imgRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          base64Data = buffer.toString('base64');
          mimeType = imgRes.headers.get('content-type') || 'image/png';
        } catch (fetchError) {
          console.error('Error fetching reference image from URL:', fetchError);
        }
      } else {
        base64Data = referenceImage.split(',')[1] || referenceImage;
        mimeType = referenceImage.match(/data:(.*?);/)?.[1] || 'image/png';
      }

      if (base64Data) {
        const refLabel = referenceType === 'layout' ? 'LAYOUT & COMPOSITION GUIDE' : 'VISUAL STYLE & MOOD GUIDE';
        parts.push({ text: `ITEM 2: ${refLabel} (Follow instructions for '${referenceType}' type):` });
        parts.push({ inlineData: { data: base64Data, mimeType } });
      }
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
