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
      console.log(`[BaseImageProService] Descargando imagen: ${url.substring(0, 60)}...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const buffer = await response.arrayBuffer();
        const mimeType = response.headers.get('content-type') || 'image/png';
        
        // Convertir ArrayBuffer a Base64 de forma eficiente y compatible con Edge Runtime (por bloques)
        const bytes = new Uint8Array(buffer);
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
        }
        const base64 = btoa(binary);
        return { data: base64, mimeType };
      } catch (error: any) {
        clearTimeout(timeoutId);
        console.error(`[BaseImageProService] Error descargando imagen (${url.substring(0, 30)}): ${error.message}`);
        return null;
      }
    }

    // Default si no es URL ni data:
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
      console.log('[BaseService] Processing ITEM 1 (Product Identity)...');
      const imageData = await this.imageUrlToBase64(previousImageUrl);
      if (imageData) {
        console.log('[BaseService] ITEM 1 Base64 size:', imageData.data.length);
        parts.push({ text: "ITEM 1: MAIN PRODUCT IDENTITY (Keep shape and labels exactly):" });
        parts.push({ inlineData: { data: imageData.data, mimeType: imageData.mimeType } });
      } else {
        console.warn('[BaseService] FAILED to get Base64 for ITEM 1');
      }
    }

    // 2. REFERENCIA (ESTILO/COMPOSICIÓN)
    if (referenceImage && referenceImage !== previousImageUrl) {
      console.log(`[BaseService] Processing ITEM 2 (Reference: ${referenceType})...`);
      const imageData = await this.imageUrlToBase64(referenceImage);
      if (imageData) {
        console.log('[BaseService] ITEM 2 Base64 size:', imageData.data.length);
        const refLabel = referenceType === 'layout' ? 'COMPOSITION & LAYOUT GUIDE' : 'VISUAL STYLE & MOOD GUIDE';
        parts.push({ text: `ITEM 2: ${refLabel}:` });
        parts.push({ inlineData: { data: imageData.data, mimeType: imageData.mimeType } });
      } else {
        console.warn('[BaseService] FAILED to get Base64 for ITEM 2');
      }
    }

    // 3. CONTINUIDAD
    if (continuityImage && continuityImage !== previousImageUrl && continuityImage !== referenceImage) {
      console.log('[BaseService] Processing ITEM 3 (Continuity)...');
      const imageData = await this.imageUrlToBase64(continuityImage);
      if (imageData) {
        console.log('[BaseService] ITEM 3 Base64 size:', imageData.data.length);
        parts.push({ text: "ITEM 3: DESIGN CONTINUITY REFERENCE (Follow style/vibes):" });
        parts.push({ inlineData: { data: imageData.data, mimeType: imageData.mimeType } });
      } else {
        console.warn('[BaseService] FAILED to get Base64 for ITEM 3');
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
