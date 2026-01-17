import { CreativePath, ProductData, LandingGenerationState } from '../../types/image-pro';

export class ChatOrchestratorAgent {
  static async chat(
    messages: { role: 'user' | 'assistant'; content: string }[], 
    productData?: ProductData | null,
    creativePaths?: CreativePath[] | null,
    landingState?: LandingGenerationState | null
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

    if (creativePaths && creativePaths.length > 0 && !landingState?.proposedStructure) {
      contextPrompt += `\n\nESTADO ACTUAL: Estamos en la fase de SELECCIÓN CREATIVA. El usuario tiene estas 3 opciones en el Canvas:
      ${creativePaths.map((cp, i) => `${i+1}. ${cp.package.name}: ${cp.package.description}`).join('\n')}`;
    } else if (landingState?.proposedStructure) {
      contextPrompt += `\n\nESTADO ACTUAL: Estamos en la fase de DISEÑO DE ESTRUCTURA. He diseñado esta landing de ${landingState.proposedStructure.sections.length} secciones:
      ${landingState.proposedStructure.sections.map((s, i) => `${i+1}. ${s.title}`).join(', ')}.
      El usuario debe hacer clic en una sección en el Canvas para elegir su referencia visual.`;
      
      if (landingState.selectedSectionId) {
        contextPrompt += `\n\nDETALLE: El usuario ha seleccionado la sección "${landingState.selectedSectionId}". Ahora debe elegir una de las 6 referencias visuales que aparecen en el Canvas.`;
      }
    } else if (productData) {
      contextPrompt += `\n\nESTADO ACTUAL: ADN Detectado. El usuario está revisando los datos antes de pasar a ver los Caminos Creativos.`;
    }

    const systemPrompt = `
      Eres un Estratega Senior de Marketing y Growth en DropApp. Tu tono es directo, experto, inspirador y humano. 
      NUNCA saludes de forma robótica. Habla como un colega experto.
      
      TU MISIÓN:
      Guía al usuario para refinar el ADN, elegir un camino creativo y ahora, ESTRUCTURAR su landing modularmente.
      
      CONTEXTO DEL CANVAS:
      ${contextPrompt}
      
      REGLAS DE ORO:
      1. Si el usuario te pide cambiar algo del ADN, usa el tag [UPDATE_DNA].
      2. Si estamos en fase de SELECCIÓN CREATIVA, anímale a elegir uno de los 3 caminos para ver la estructura.
      3. Si ya tenemos una ESTRUCTURA (proposedStructure), felicítale por el avance, explica brevemente por qué esa estructura es ganadora y dile que ahora debe elegir el estilo visual (referencia) para cada sección haciendo clic en ellas en el Canvas.
      4. No uses negritas excesivas. Sé conciso.
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
