import { CreativePath, ProductData } from '../../types/image-pro';

export class ChatOrchestratorAgent {
  static async chat(
    messages: { role: 'user' | 'assistant'; content: string }[], 
    productData?: ProductData | null,
    creativePaths?: CreativePath[] | null
  ): Promise<string> {
    console.log('[ChatOrchestratorAgent] Generating response...');

    const googleKey = process.env.GOOGLE_AI_KEY;
    if (!googleKey) throw new Error('Google AI Key is missing.');

    let contextPrompt = productData 
      ? `ADN DEL PRODUCTO ACTUAL en el Canvas:
         - Nombre: ${productData.name}
         - Ángulo: ${productData.angle}
         - Buyer: ${productData.buyer}
         - Detalles: ${productData.details}`
      : 'Aún no hemos detectado un producto. Pide al usuario una URL o imagen para extraer el ADN.';

    if (creativePaths && creativePaths.length > 0) {
      contextPrompt += `\n\nESTADO ACTUAL: Estamos en la fase de SELECCIÓN CREATIVA. El usuario tiene estas 3 opciones en el Canvas:
      ${creativePaths.map((cp, i) => `${i+1}. ${cp.package.name}: ${cp.package.description}`).join('\n')}`;
    } else if (productData) {
      contextPrompt += `\n\nESTADO ACTUAL: ADN Detectado. El usuario está revisando los datos antes de pasar a ver los Caminos Creativos.`;
    }

    const systemPrompt = `
      Eres un Estratega Senior de Marketing y Growth en DropApp. Tu tono es directo, experto, inspirador y humano. 
      NUNCA saludes como "Soy el orquestador" o de forma robótica. Habla como un colega experto que está ayudando a lanzar un negocio exitoso.
      
      TU MISIÓN:
      Guía al usuario para refinar el ADN de su producto y elegir la mejor estrategia visual.
      
      CONTEXTO DEL CANVAS:
      ${contextPrompt}
      
      REGLAS DE ORO:
      1. Si el usuario te pide cambiar algo del ADN (ej: "cambia el ángulo", "ponle este nombre", "busca otro buyer"), DEBES responder con el texto normal Y AL FINAL incluir un tag de actualización EXACTAMENTE así:
         [UPDATE_DNA] { "name": "...", "angle": "...", "buyer": "...", "details": "..." }
         Asegúrate de que el JSON del tag tenga los 4 campos actualizados basándote en lo que ya tenemos y lo que el usuario pidió.
      2. No uses negritas excesivas ni emojis infantiles. Usa un lenguaje de negocios premium (español de España/Latam neutro).
      3. Si te preguntan por más ángulos, dales 3 opciones potentes y pregunta si quieren aplicar alguna al Canvas.
      4. Sé conciso. Ve al grano.
    `;

    try {
      const modelId = 'gemini-3-flash-preview';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${googleKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            ...messages.map(m => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.content }]
            }))
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
          }
        })
      });

      const result = await response.json();
      
      if (result.error) {
         // Fallback a v1/gemini-2.5-flash
         const fallbackUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${googleKey}`;
         const fallbackRes = await fetch(fallbackUrl, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             contents: [
               { role: 'user', parts: [{ text: systemPrompt }] },
               ...messages.map(m => ({
                 role: m.role === 'user' ? 'user' : 'model',
                 parts: [{ text: m.content }]
               }))
             ]
           })
         });
         const fallbackResult = await fallbackRes.json();
         return fallbackResult.candidates?.[0]?.content?.parts?.[0]?.text || 'Tengo un pequeño problema técnico, ¿podemos retomar en un segundo?';
      }

      return result.candidates?.[0]?.content?.parts?.[0]?.text || 'No he podido procesar eso, ¿me lo repites?';

    } catch (error: any) {
      console.error('[ChatOrchestratorAgent] Error:', error.message);
      return 'He tenido un error de conexión. ¿Lo intentamos de nuevo?';
    }
  }
}
