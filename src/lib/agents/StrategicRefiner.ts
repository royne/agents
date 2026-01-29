import { ProductData, ChatResponse } from '../../types/image-pro';

export class StrategicRefiner {
  static async refine(
    messages: { role: 'user' | 'assistant'; content: string }[],
    productDNA: ProductData
  ): Promise<any> {
    console.log('[StrategicRefiner] Refining ADN...');

    const googleKey = process.env.GOOGLE_AI_KEY;
    if (!googleKey) throw new Error('Google AI Key is missing.');

    const prompt = `
      Eres un Estratega Senior de Marketing. Tu objetivo es interactuar con el usuario para SELECCIONAR o REFINAR el ADN del producto (Nombre, Ángulo de venta, Perfil del comprador, Detalles visuales).

      ADN ACTUAL:
      - Nombre: ${productDNA.name}
      - Ángulo: ${productDNA.angle}
      - Buyer: ${productDNA.buyer}
      - Detalles: ${productDNA.details}

      INSTRUCCIONES:
      1. Escucha al usuario y determina si quiere cambiar algo del ADN.
      2. Sé extremadamente breve y profesional en tu respuesta de texto (máximo 2 líneas).
      3. Solo devuelve datos en los campos que el usuario desea CAMBIAR o AGREGAR.
      4. Si el usuario te da información nueva ("el producto cuesta 50 USD" o "es para mujeres de 30 años"), incorpóralo en 'details' o 'buyer' según corresponda.

      FORMATO DE RESPUESTA (JSON):
      {
        "text": "Respuesta breve para el usuario",
        "delta": {
          "name": { "value": "...", "updated": true/false },
          "angle": { "value": "...", "updated": true/false },
          "buyer": { "value": "...", "updated": true/false },
          "details": { "value": "...", "updated": true/false }
        }
      }
      
      IMPORTANTE: 'updated' debe ser TRUE solo si el valor ha sido modificado en esta interacción.
    `;

    try {
      const modelId = 'gemini-3-flash-preview';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${googleKey}`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: prompt }] },
          contents: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          })),
          generationConfig: {
            response_mime_type: "application/json"
          }
        })
      });

      const result = await res.json();
      const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) throw new Error('Refiner returned empty response.');

      return JSON.parse(textResponse);

    } catch (error: any) {
      console.error('[StrategicRefiner] Error:', error.message);
      throw error;
    }
  }
}
