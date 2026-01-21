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
    
    console.log('[AdsServiceV2] buildPrompt called with:', { 
      isCorrection, 
      hasReference: !!referenceImage, 
      prompt: prompt.substring(0, 50),
      aspectRatio 
    });

    const finalPrompt = extraInstructions 
      ? `${prompt}. ADDITIONAL USER REQUIREMENTS: ${extraInstructions}` 
      : prompt;
    
    if (isCorrection) {
      console.log('[AdsServiceV2] Mode: Correction');
      strategicPrompt = `AD REFINEMENT & VISUAL CONVERSION:
      Maintain the product's physical identity (label, shape, color) from ITEM 1.
      
      MODIFICATION TASK (PRIORITY 1): ${finalPrompt}
      
      INSTRUCTION: Apply the requested change focused on Facebook Ads performance. Highlights, colors, and text changes should be HIGH IMPACT. Preserve the overall composition if there was one, but execute the user command with priority.`;
    } else if (referenceImage) {
      console.log('[AdsServiceV2] Mode: With Reference');
      // PROMPT OPTIMIZED FOR STRUCTURAL CLONING VS CREATIVE CONCEPT
      strategicPrompt = `PREMIUM HIGH-CONVERSION FACEBOOK AD (ARCHITECTURAL CLONING)
    PRODUCT IDENTITY: ${productData.name}
    PRODUCT CONTEXT: ${productData.angle} - ${productData.details}
    
    SCENE & ATMOSPHERE (PROPRIETARY CONCEPT):
    - CORE SCENE: ${finalPrompt}.
    - ENVIRONMENT: Do NOT copy the background from ITEM 2. Create a NEW background strictly related to the PRODUCT IDENTITY and the CORE SCENE above.
    - LIGHTING & STYLE: Professional studio or lifestyle lighting tailored to the product.

    STRUCTURAL BLUEPRINT (ITEM 2 - LAYOUT ONLY):
    - MASTER LAYOUT: Duplicate the composition, spacing, and visual hierarchy of ITEM 2 with total fidelity.
    - GRAPHIC ELEMENTS: Replicate frames, stickers, UI components, and callout boxes from ITEM 2.
    - POSITIONING: Place the product and decorative elements in the same relative positions as ITEM 2.

    TEXT REPLACEMENT (ABSOLUTE RULE):
    - TARGET CONTENTS: Hook: "${adHook || ''}", Body Part: "${adBody || ''}", CTA: "${adCta || ''}"
    - NO REFERENCE TEXT: You are FORBIDDEN from using any words found in ITEM 2. 
    - REPLACEMENT MAPPING: Identify every text area in ITEM 2 (headlines, side callouts, footer texts). Fill ALL these areas using ONLY the TARGET CONTENTS above. If the reference has a large text on the right, put our Hook or Body there.

    AD VISUAL ARCHITECTURE:
    1. PRODUCT FIDELITY: ITEM 1 is the absolute referent. Label and shape must be perfect.
    2. TYPOGRAPHY: High-impact, professional font matching the layout's scale in ITEM 2.
    3. VISUAL CTA: Render the sticker/badge precisely where it appears in ITEM 2 using the text "${adCta || ''}".
    ${extraInstructions ? `- USER SPECIFIC OVERRIDE: ${extraInstructions}` : ''}
    
    FORMAT: ${aspectRatio === '1:1' ? '1:1 square' : '9:16 vertical'} orientation. 2k resolution.`;
    } else {
      console.log('[AdsServiceV2] Mode: Native (de 0)');
      // RESTORE ORIGINAL NATIVE PROMPT (DE 0)
      strategicPrompt = `HIGH-CONVERSION FACEBOOK AD (LEVEL 3-4 AWARENESS)
    PRODUCT: ${productData.name}
    STRATEGIC AUDIENCE: Awareness Levels 3 (Solution Aware) & 4 (Product Aware). 
    - The customer knows their problem and is comparing solutions. 
    - Tone: Authoritative, Solution-focused, Direct Response.

    CORE AD COPY & ELEMENTS:
    - HOOK TEXT: "${adHook || ''}"
    - VALUE PROP: "${adBody || ''}"
    - VISUAL (CTA): "${adCta || ''}"

    AD CONCEPT & VISUAL RULES:
    1. VISUAL HOOK: ${finalPrompt}. Stop the scroll immediately.
    2. TEXT OVERLAY (HOOK): Include a HIGH-IMPACT, short headline using ONLY the HOOK TEXT. 
    3. CRITICAL: Do NOT render long paragraphs or the full VALUE PROP text on the image. Keep the visual clean.
    4. VISUAL CTA: Render a modern sticker/badge, flag, button or label that says "${adCta || ''}". Use high-contrast colors (red, yellow, or neon) to make it POP. Place it strategically (corner or near product) as a conversion signal.
    5. PRODUCT FIDELITY: ITEM 1 (PREVIOUS PRODUCT) is the absolute reference. Perfect label and shape.
    6. ATMOSPHERE: High-end lifestyle or premium studio context.
    
    FORMAT OPTIMIZATION:
    - ${aspectRatio === '1:1' ? '1: square' : '9:16 vertical'}.
    - image generetion in 2k resolution`;
    }

    const parts = this.buildBasePart(strategicPrompt);
    console.log('[AdsServiceV2] Part 0 (Strategic Prompt) built.');
    
    await this.handleImages(parts, previousImageUrl, referenceImage, referenceType);
    console.log(`[AdsServiceV2] handleImages completed. Total parts: ${parts.length}`);
    
    const restPayload = await this.buildRestPayload(strategicPrompt, parts, aspectRatio);

    return { 
      strategicPrompt, 
      parts,
      instances: restPayload.instances,
      parameters: restPayload.parameters
    };
  }
}
