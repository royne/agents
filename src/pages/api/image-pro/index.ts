import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const supabase = createPagesServerClient({ req, res });
  
  let session = null;
  let user = null;

  // 1. Intentar obtener sesión por Cookies (Standard helper)
  const { data: sessionData } = await supabase.auth.getSession();
  session = sessionData.session;
  user = session?.user;

  // 2. Si no hay sesión (Cookies ausentes), intentar por Authorization Header
  if (!user) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: userData } = await supabase.auth.getUser(token);
      user = userData.user;
    }
  }

  // 3. Si aún no hay usuario, intentar por Token en el cuerpo (fallback extremo)
  if (!user) {
    const { _authToken } = req.body;
    if (_authToken) {
      const { data: userData } = await supabase.auth.getUser(_authToken);
      user = userData.user;
    }
  }

  if (!user) {
    console.error('[api/image-pro] No user found in session, header or body');
    return res.status(401).json({ error: 'No autorizado. Por favor, inicia sesión.' });
  }

  // Obtener perfil para verificar plan y obtener API Key
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, plan, google_api_key, image_gen_count')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('[api/image-pro] Profile error:', profileError);
    return res.status(403).json({ error: 'Perfil no encontrado.' });
  }

  const role = profile.role?.toLowerCase();
  const plan = profile.plan?.toLowerCase();

  if (role !== 'superadmin' && role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere ser Administrador.' });
  }

  if (plan !== 'premium') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere un Plan Premium.' });
  }

  // Limpiar el token del body si existe
  if (req.body._authToken) delete req.body._authToken;

  const apiKey = profile.google_api_key;
  if (!apiKey) {
    return res.status(400).json({ error: 'Falta la Google AI Key en tu perfil.' });
  }

  const { prompt, referenceImage, productData, aspectRatio, isCorrection, previousImageUrl } = req.body;

  try {
    // 1. Obtener plantillas globales para inspiración
    const { data: globalTemplates } = await supabase
      .from('image_pro_templates')
      .select('name, url')
      .limit(3);

    const inspirationNames = globalTemplates?.map(t => t.name).join(', ') || 'profesional';

    const genAI = new GoogleGenerativeAI(apiKey);
    // El modelo estándar para Imagen 3 Pro en la API de Gemini
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

    // Si es corrección y tenemos la imagen previa
    if (isCorrection && previousImageUrl) {
       const base64Data = previousImageUrl.split(',')[1] || previousImageUrl;
       const mimeType = previousImageUrl.match(/data:(.*?);/)?.[1] || 'image/png';
       parts.push({
         inlineData: { data: base64Data, mimeType }
       });
    } else if (referenceImage) {
      // Si hay una imagen de referencia, la incluimos como prompt multimodal
      // El formato esperado es { inlineData: { data: '...', mimeType: '...' } }
      const base64Data = referenceImage.split(',')[1] || referenceImage;
      const mimeType = referenceImage.match(/data:(.*?);/)?.[1] || 'image/png';
      
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }]
    });

    const response = await result.response;
    
    // Verificamos si la respuesta tiene la imagen generada
    // En Imagen 3 vía SDK, el resultado suele venir como una serie de candidatos 
    // que contienen la imagen codificada en base64 o metadatos.
    
    // NOTA: Si el SDK de Gemini aún no soporta retorno de imágenes directamente 
    // en todas las regiones para este método, manejamos el error o el fallback.
    const candidates = (response as any).candidates;
    let imageUrl = null;

    if (candidates && candidates[0]?.content?.parts[0]?.inlineData) {
      const imageData = candidates[0].content.parts[0].inlineData;
      imageUrl = `data:${imageData.mimeType};base64,${imageData.data}`;
    } else {
      // Fallback si la respuesta no es la esperada (depende de la versión del SDK y modelo)
      // Intentamos obtener el texto descriptivo si no hay imagen
      throw new Error('No se recibió una imagen válida del modelo Imagen 3.');
    }
    
    await supabase
      .from('profiles')
      .update({ image_gen_count: (profile.image_gen_count || 0) + 1 })
      .eq('user_id', user.id);

    return res.status(200).json({ 
      success: true, 
      imageUrl: imageUrl,
      message: 'Imagen generada con éxito'
    });

  } catch (error: any) {
    console.error('Error al generar imagen:', error);
    return res.status(500).json({ error: error.message || 'Error interno al procesar la imagen' });
  }
}
