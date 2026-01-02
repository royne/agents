import { ImageProRequest, StrategicPromptResponse } from './types';

export class BaseImageProService {
  protected static buildBasePart(strategicPrompt: string): any[] {
    return [{ text: strategicPrompt }];
  }

  public static async imageUrlToBase64(url: string): Promise<{ data: string, mimeType: string } | null> {
    if (!url) return null;
    
    // Si ya es base64
    if (url.startsWith('data:')) {
      const data = url.split(',')[1] || url;
      const mimeType = url.match(/data:(.*?);/)?.[1] || 'image/png';
      return { data, mimeType };
    }

    // Si es una URL externa (como Supabase Storage)
    if (url.startsWith('http')) {
      console.log(`[BaseImageProService] Descargando imagen: ${url.substring(0, 50)}...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();
        const mimeType = blob.type || 'image/png';
        
        // Convertir ArrayBuffer a Base64 en Edge Runtime
        const base64 = btoa(
          new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        
        return { data: base64, mimeType };
      } catch (error: any) {
        clearTimeout(timeoutId);
        console.error(`[BaseImageProService] Error descargando imagen (${url.substring(0, 30)}): ${error.message}`);
        // Si falla la descarga, devolvemos null para no bloquear el proceso
        return null;
      }
    }

    // Default si no es URL ni data: (asumimos que puede ser base64 puro sin prefijo)
    return { data: url, mimeType: 'image/png' };
  }

  protected static async handleImages(
    parts: any[],
    previousImageUrl?: string,
    referenceImage?: string,
    referenceType: 'style' | 'layout' = 'style',
    continuityImage?: string
  ) {
    // 1. PRODUCTO (IDENTIDAD)
    if (previousImageUrl) {
      const imageData = await this.imageUrlToBase64(previousImageUrl);
      if (imageData) {
        parts.push({ text: "ITEM 1: MAIN PRODUCT IDENTITY (Keep shape and labels exactly):" });
        parts.push({ inlineData: { data: imageData.data, mimeType: imageData.mimeType } });
      }
    }

    // 2. REFERENCIA (ESTILO/COMPOSICIÓN)
    if (referenceImage && referenceImage !== previousImageUrl) {
      const imageData = await this.imageUrlToBase64(referenceImage);
      if (imageData) {
        const refLabel = referenceType === 'layout' ? 'COMPOSITION & LAYOUT GUIDE' : 'VISUAL STYLE & MOOD GUIDE';
        parts.push({ text: `ITEM 2: ${refLabel}:` });
        parts.push({ inlineData: { data: imageData.data, mimeType: imageData.mimeType } });
      }
    }

    // 3. CONTINUIDAD
    if (continuityImage && continuityImage !== previousImageUrl && continuityImage !== referenceImage) {
      const imageData = await this.imageUrlToBase64(continuityImage);
      if (imageData) {
        parts.push({ text: "ITEM 3: DESIGN CONTINUITY REFERENCE (Follow style/vibes):" });
        parts.push({ inlineData: { data: imageData.data, mimeType: imageData.mimeType } });
      }
    }
  }

  protected static getCommonMarketingContext(productData: any): string {
    const productName = productData.name || "the product in ITEM 1";
    return `
    PRODUCT: ${productName}
    MARKETING STRATEGY: 
    - TARGET AUDIENCE: ${productData.buyer || 'High-end premium market'}
    - VALUE PROPOSITION: ${productData.angle || 'Exclusivity and superior quality'}
    - VISUAL GOAL: ${productData.details || 'Professional studio lighting, clean background, sharp focus'}`;
  }

  public static async buildRestPayload(strategicPrompt: string, parts: any[], aspectRatio: string = '1:1') {
    const instance: any = {
      prompt: strategicPrompt
    };

    // Extraer imágenes de las partes para el formato REST
    const imagePart = parts.find(p => p.inlineData);
    if (imagePart) {
      instance.image = {
        bytesBase64Encoded: imagePart.inlineData.data,
        mimeType: imagePart.inlineData.mimeType
      };
    }

    return {
      instances: [instance],
      parameters: {
        aspectRatio: aspectRatio,
        negativePrompt: "low quality, blurry, distorted, watermarks"
      }
    };
  }
}
