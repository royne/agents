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
      ${landingState.proposedStructure.sections.map((s, i) => `${i+1}. Título: "${s.title}" [ID TÉCNICO: ${s.sectionId}]${s.extraInstructions ? ` (Instrucción actual: ${s.extraInstructions})` : ''}`).join('\n      ')}.
      El usuario debe hacer clic en una sección en el Canvas para elegir su referencia visual.`;
      
      if (landingState.selectedSectionId) {
        contextPrompt += `\n\nDETALLE: El usuario tiene abierta la sección con ID "${landingState.selectedSectionId}".`;
      }
    }

    const systemPrompt = `Eres un Estratega Senior de Marketing. 

TU OBJETIVO: Optimizar la estrategia de marketing (ADN) y la estructura de secciones.
COMUNICACIÓN: Sé extremadamente breve, experto y al grano. Max 2 frases por respuesta.

REGLA CRÍTICA: NO recibes imágenes reales (se omiten por rendimiento), solo recibes el TEXTO de las secciones. 
Si el usuario pide editar una imagen específica, dile: "Para cambiar el estilo visual, utiliza el botón 'Editar' directamente en la sección del Canvas."

CONTEXTO ACTUAL DEL CANVAS:
${contextPrompt}`;

    const responseSchema = {
      type: "object",
      properties: {
        text: { type: "string", description: "Respuesta humana breve y profesional" },
        protocol: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["UPDATE_DNA", "UPDATE_SECTION", "REGENERATE_STRUCTURE"] },
            data: { 
              type: "object", 
              properties: {
                name: { type: "string" },
                angle: { type: "string" },
                buyer: { type: "string" },
                details: { type: "string" },
                sectionId: { type: "string" },
                extraInstructions: { type: "string" }
              },
              description: "Datos actualizados." 
            }
          },
          required: ["action", "data"]
        }
      },
      required: ["text"]
    };

    try {
      const modelId = 'gemini-3-flash-preview';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${googleKey}`;
      
      console.log(`[ChatOrchestratorAgent] Calling Gemini (${modelId})...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // Reduced to 25s for better UX

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          })),
          generationConfig: {
            response_mime_type: "application/json",
            response_schema: responseSchema
          }
        })
      });

      clearTimeout(timeoutId);
      const result = await res.json();
      console.log('[ChatOrchestratorAgent] Gemini API Response Status:', res.status);
      
      if (result.error) {
        console.error('[ChatOrchestratorAgent] API Error:', result.error);
        return {
          text: `El servidor de inteligencia ha reportado un problema: ${result.error.message || 'Error desconocido'}. ¿Reintentamos?`,
          protocol: undefined
        };
      }

      const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        console.error('[ChatOrchestratorAgent] Empty response from Gemini. Result:', JSON.stringify(result, null, 2));
        return {
          text: 'He recibido una respuesta vacía. Quizás la instrucción fue demasiado compleja. ¿Podrías simplificarla?',
          protocol: undefined
        };
      }

      console.log('[ChatOrchestratorAgent] Raw Gemini JSON:', textResponse);
      const data = JSON.parse(textResponse);
      if (data.protocol) {
        console.log('[ChatOrchestratorAgent] Protocol triggered:', data.protocol.action);
      }
      return data;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('[ChatOrchestratorAgent] Timeout: Gemini took too long.');
        return {
          text: 'Vaya, mi cerebro está un poco lento hoy y ha superado el tiempo de espera. ¿Podrías intentar con una instrucción más corta?',
          protocol: undefined
        };
      }
      console.error('[ChatOrchestratorAgent] Global Error:', error?.message || error);
      return {
        text: 'He tenido un error de conexión con mi cerebro artificial. ¿Lo intentamos de nuevo?',
        protocol: undefined
      };
    }
  }
}
