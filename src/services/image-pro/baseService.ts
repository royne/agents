import { ImageProRequest, StrategicPromptResponse } from './types';

export class BaseImageProService {
  protected static buildBasePart(strategicPrompt: string): any[] {
    return [{ text: strategicPrompt }];
  }

  protected static handleImages(
    parts: any[],
    previousImageUrl?: string,
    referenceImage?: string,
    referenceType: 'style' | 'layout' = 'style'
  ) {
    // 1. Añadir el PRODUCTO BASE como referencia principal de objeto
    if (previousImageUrl) {
      const base64 = previousImageUrl.split(',')[1] || previousImageUrl;
      const mime = previousImageUrl.match(/data:(.*?);/)?.[1] || 'image/png';
      parts.push({ text: "ITEM 1: REFERENCE PRODUCT IDENTITY (Strictly keep this object/character):" });
      parts.push({ inlineData: { data: base64, mimeType: mime } });
    }

    // 2. Añadir la REFERENCIA DE ESTILO/LAYOUT
    if (referenceImage && referenceImage !== previousImageUrl) {
      const base64Data = referenceImage.split(',')[1] || referenceImage;
      const mimeType = referenceImage.match(/data:(.*?);/)?.[1] || 'image/png';

      if (base64Data) {
        const refLabel = referenceType === 'layout' ? 'LAYOUT & COMPOSITION GUIDE' : 'VISUAL STYLE & MOOD GUIDE';
        parts.push({ text: `ITEM 2: ${refLabel} (Follow instructions for '${referenceType}' type):` });
        parts.push({ inlineData: { data: base64Data, mimeType } });
      }
    }
  }

  protected static getCommonMarketingContext(productData: any): string {
    return `
    PRODUCT IDENTITY: ${productData.name}
    MARKETING STRATEGY: 
    - SELL TO: ${productData.buyer || 'High-end premium customers'}
    - CORE ANGLE: ${productData.angle || 'Exclusivity and superior quality'}`;
  }
}
