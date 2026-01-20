import { BaseImageProService } from './baseService';
import { ImageProRequest, StrategicPromptResponse } from './types';

export class AdsServiceV2 extends BaseImageProService {
  static async buildPrompt(req: ImageProRequest): Promise<StrategicPromptResponse> {
    const { 
      productData, 
      prompt, 
      aspectRatio = '1:1', 
      isCorrection, 
      referenceImage, 
      referenceType, 
      previousImageUrl,
      extraInstructions,
      adHook,
      adBody,
      adCta
    } = req;
    
    let strategicPrompt = "";
    
    const finalPrompt = extraInstructions 
      ? `${prompt}. ADDITIONAL USER REQUIREMENTS: ${extraInstructions}` 
      : prompt;
    
    if (isCorrection) {
      strategicPrompt = `AD REFINEMENT & VISUAL CONVERSION:
      Maintain the product's physical identity from ITEM 1.
      
      MODIFICATION TASK (PRIORITY 1): ${finalPrompt}
      
      INSTRUCTION: Apply the requested change focused on Facebook Ads performance. Highlights, colors, and text changes should be HIGH IMPACT.`;
    } else {
      strategicPrompt = `HIGH-CONVERSION FACEBOOK AD (LEVEL 3-4 AWARENESS)
    PRODUCT: ${productData.name}
    STRATEGIC AUDIENCE: Awareness Levels 3 (Solution Aware) & 4 (Product Aware). 
    - The customer knows their problem and is comparing solutions. 
    - Tone: Authoritative, Solution-focused, Direct Response.

    CORE AD COPY & ELEMENTS:
    - HOOK TEXT: "${adHook || ''}"
    - VALUE PROP: "${adBody || ''}"
    - VISUAL LABEL/STICKER (CTA): "${adCta || ''}"

    AD CONCEPT & VISUAL RULES:
    1. VISUAL HOOK: ${finalPrompt}. Stop the scroll immediately.
    2. TEXT OVERLAY (HOOK): Include a HIGH-IMPACT, short headline using the HOOK TEXT. Use professional, clean typography.
    3. VISUAL CTA (STICKER/LABEL): Render a modern, professional sticker, badge, or flag that says "${adCta || ''}". Use a high-contrast background (bright red, yellow, or neon green) to make it POP. Place it strategically (corner or near product) as a conversion signal.
    4. PRODUCT FIDELITY: ITEM 1 (PREVIOUS PRODUCT) is the absolute reference. Perfect label and shape.
    5. ATMOSPHERE: High-end lifestyle or premium studio context.
    
    FORMAT OPTIMIZATION:
    - ${aspectRatio === '1:1' ? '1: square' : '9:16 vertical'}.
    - image generetion in 2k resolution
    
    VISUAL AUTHORITY:
    - ITEM 2 (REFERENCE - LAYOUT): Replicate structural balance.`;
    }

    const parts = this.buildBasePart(strategicPrompt);
    await this.handleImages(parts, previousImageUrl, referenceImage, referenceType);
    
    const restPayload = await this.buildRestPayload(strategicPrompt, parts, aspectRatio);

    return { 
      strategicPrompt, 
      parts,
      instances: restPayload.instances,
      parameters: restPayload.parameters
    };
  }
}
