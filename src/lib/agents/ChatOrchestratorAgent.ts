import { CreativePath, ProductData, LandingGenerationState, ChatResponse } from '../../types/image-pro';

export class ChatOrchestratorAgent {
  static async chat(
    messages: { role: 'user' | 'assistant'; content: string }[], 
    productData?: ProductData | null,
    creativePaths?: CreativePath[] | null,
    landingState?: LandingGenerationState | null
  ): Promise<ChatResponse> {
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
      ${landingState.proposedStructure.sections.map((s, i) => `${i+1}. ${s.title}${s.extraInstructions ? ` (Extra: ${s.extraInstructions})` : ''}`).join(', ')}.
      El usuario debe hacer clic en una sección en el Canvas para elegir su referencia visual.`;
      
      if (landingState.selectedSectionId) {
        contextPrompt += `\n\nDETALLE: El usuario ha seleccionado la sección "${landingState.selectedSectionId}".`;
      }
    }

    const systemPrompt = `
      Eres un Estratega Senior de Marketing y Growth en DropApp. Tu tono es directo, experto, humano y PERSUASIVO. 
      Habla como un colega experto que está emocionado por el éxito del usuario.
      
      TU MISIÓN:
      Guía al usuario en todo el proceso de creación de su landing page.
      
      ESTADO DEL PRODUCTO (IMPORTANTE):
      ${productData ? "✅ YA TENEMOS LOS DATOS DEL PRODUCTO. No los pidas de nuevo. Procede con las modificaciones o sugerencias." : "❌ NO TENEMOS DATOS. Pide educadamente una URL o Imagen (URL o Foto) para empezar. Solo el nombre no es suficiente."}
      
      REGLAS DE PROTOCOLO (CRÍTICO):
      Si el usuario pide un cambio técnico (ADN o Secciones), DEBES usar el objeto "protocol".
      
      Protocolos disponibles:
      1. UPDATE_DNA: Si pide cambiar nombre, ángulo, buyer o detalles.
         Ej: { "action": "UPDATE_DNA", "data": { "angle": "Enfoque en artritis y movilidad" } }
      2. UPDATE_SECTION: Si pide cambiar contenido de una sección (precios, colores, etc).
         Ej: { "action": "UPDATE_SECTION", "data": { "sectionId": "hero", "extraInstructions": "Cambiar 'was' por 'antes' y precio a $99.900" } }
      3. REGENERATE_STRUCTURE: Si pide cambiar toda la estructura.
      
      REGLA DE RESPUESTA (OBLIGATORIO JSON):
      Responde SIEMPRE con un JSON válido. Sé conversacional en el campo "text".
      {
        "text": "Tu respuesta estratégica y humana aquí confirmando lo que has hecho...",
        "protocol": { "action": "...", "data": { ... } } // Opcional pero necesario para cambios
      }
      
      CONTEXTO DEL CANVAS:
      ${contextPrompt}
    `;

    try {
      const modelId = 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${googleKey}`;
      
      const res = await fetch(url, {
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
            response_mime_type: "application/json"
          }
        })
      });

      const result = await res.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      
      try {
        const parsed = JSON.parse(text);
        return {
          text: parsed.text || (productData ? '¡Perfecto! Ya he procesado ese cambio. ¿Qué más ajustamos en la estrategia?' : 'Para empezar con nivel élite, ¿podrías compartirme la URL o una foto del producto?'),
          protocol: parsed.protocol
        };
      } catch (e) {
        return { text: text || 'Tengo un pequeño cruce de cables. ¿Podrías repetirme esa última instrucción?' };
      }

    } catch (error: any) {
      console.error('[ChatOrchestratorAgent] Global Error:', error.message);
      return { text: 'He tenido un error de conexión con mi cerebro artificial. ¿Lo intentamos de nuevo?' };
    }
  }
}
