import { BaseImageProService } from '../../services/image-pro/baseService';
import { ProductData } from '../../types/image-pro';

export interface DiscoveryStrategy {
  analyze(input: string): Promise<ProductData>;
}

export class DiscoveryService {
  private strategies: Map<string, DiscoveryStrategy> = new Map();

  constructor() {
    this.strategies.set('url', new UrlAnalysisStrategy());
    this.strategies.set('image', new ImageAnalysisStrategy());
  }

  /**
   * Orchestrates the discovery process for a given product input.
   */
  static async discover(input: { url?: string; imageBase64?: string }): Promise<ProductData> {
    const service = new DiscoveryService();
    
    if (input.url) {
      return service.strategies.get('url')!.analyze(input.url);
    } else if (input.imageBase64) {
      return service.strategies.get('image')!.analyze(input.imageBase64);
    }
    
    throw new Error('Please provide either a URL or an image.');
  }
}

/**
 * Strategy for analyzing product landing pages via URL.
 */
class UrlAnalysisStrategy implements DiscoveryStrategy {
  async analyze(url: string): Promise<ProductData> {
    console.log(`[Discovery] Analyzing URL: ${url}`);
    
    // In a real implementation, we would use a scraping service or proxy 
    // to get the content and pass it to a LLM for extraction.
    // For this V2 prototype, we simulate the extraction logic.
    
    return {
      name: 'Simulated Product from URL',
      angle: 'Growth-focused marketing angle',
      buyer: 'E-commerce focused entrepreneurs',
      details: `Extracted data from ${url}: Premium quality materials, 2-year warranty.`
    };
  }
}

/**
 * Strategy for analyzing product images using Vision AI.
 */
class ImageAnalysisStrategy implements DiscoveryStrategy {
  async analyze(imageBase64: string): Promise<ProductData> {
    console.log('[Discovery] Analyzing Image with Vision AI...');

    const googleKey = process.env.GOOGLE_AI_KEY;
    if (!googleKey) throw new Error('Google AI Key is missing.');

    const imageData = await BaseImageProService.imageUrlToBase64(imageBase64);
    if (!imageData) throw new Error('Invalid image data.');

    const prompt = `
      Act as a Senior E-commerce Strategist. 
      Analyze the attached image and extract the following marketing core in JSON format.
      IMPORTANT: Provide the VALUES in Spanish for the user, but keep the KEYS in English.
      {
        "name": "Nombre conciso del producto",
        "angle": "Ángulo de venta ganador o propuesta de valor",
        "buyer": "Perfil psicográfico del comprador ideal",
        "details": "Puntos clave sobre materiales, colores y características visuales"
      }
      Respond ONLY with the JSON.
    `;

    try {
      // Usando Gemini 3 Flash Preview para máxima potencia de análisis multimodal
      const modelId = 'gemini-3-flash-preview';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${googleKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { data: imageData.data, mimeType: imageData.mimeType } }
            ]
          }]
        })
      });

      const result = await response.json();
      
      if (result.error) {
        console.error('[Discovery] Google AI API Error:', result.error);
        
        // Fallback: Si Gemini 3 falla, intentar Gemini 2.5 Flash
        if (result.error.code === 404) {
           console.log('[Discovery] Intentando fallback con gemini-2.5-flash en v1...');
           const fallbackUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${googleKey}`;
           const fallbackRes = await fetch(fallbackUrl, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               contents: [{
                 role: 'user',
                 parts: [
                   { text: prompt },
                   { inlineData: { data: imageData.data, mimeType: imageData.mimeType } }
                 ]
               }]
             })
           });
           const fallbackResult = await fallbackRes.json();
           if (fallbackResult.candidates?.[0]?.content?.parts?.[0]?.text) {
             const text = fallbackResult.candidates[0].content.parts[0].text;
             const jsonStr = text.replace(/```json|```/g, '').trim();
             return JSON.parse(jsonStr) as ProductData;
           }
        }
        throw new Error(`Google AI API Error: ${result.error.message}`);
      }

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        console.error('[Discovery] No text in candidates:', JSON.stringify(result, null, 2));
        throw new Error('Vision AI failed to analyze the image (no response text).');
      }

      // Clean markdown if present
      const jsonStr = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr) as ProductData;

    } catch (error: any) {
      console.error('[Discovery] Image Analysis Error Detail:', error);
      return {
        name: 'Unidentified Product',
        angle: 'Generic marketing angle',
        buyer: 'General audience',
        details: 'Visual analysis failed, please provide details manually.'
      };
    }
  }
}
