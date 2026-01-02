import { BaseImageProService } from './baseService';
import { ImageProRequest, StrategicPromptResponse } from './types';

export class LandingService extends BaseImageProService {
  static async buildPrompt(req: ImageProRequest): Promise<StrategicPromptResponse> {
    const { 
      productData, 
      prompt, 
      aspectRatio = '9:16', 
      isCorrection, 
      referenceImage, 
      referenceType, 
      previousImageUrl,
      subMode 
    } = req;
    
    let strategicPrompt = "";
    
    if (isCorrection) {
      strategicPrompt = `IMAGE REFINEMENT & CORE ALIGNMENT:
      Maintain the current visual identity, product features, and marketing core.
      CORE STRATEGY (STAY TRUE TO THIS): 
      - TARGET: ${productData.buyer || 'High-end premium customers'}
      - ANGLE: ${productData.angle || 'Exclusivity and superior quality'}
      
      NEW MODIFICATION REQUEST: ${prompt}
      
      INSTRUCTION: Apply the modification while keeping the product in ITEM 1 identical. Do not change the layout or background drastically unless requested.`;
    } else {
      strategicPrompt = `PREMIUM COMMERCIAL PHOTOGRAPHY & MARKETING DESIGN
    PRODUCT IDENTITY: ${productData.name}
    MARKETING STRATEGY (CRITICAL): 
    - SELL TO: ${productData.buyer || 'High-end premium customers'}
    - CORE ANGLE: ${productData.angle || 'Exclusivity and superior quality'}
    - VISUAL GOAL: ${productData.details || 'Professional studio lighting, sharp focus'}
    
    SECTION OBJECTIVE: ${prompt}
    
    CRITICAL INSTRUCTION: 
    - You are generating a HIGH-END COMMERCIAL advertisement.
    - If you see placeholders like "FOTO PRODUCTO", "FOTO MODELO", or "TEXTO" in ITEM 2, YOU MUST REPLACE THEM with real cinematic content: real professional models, real textures, and real marketing copy.
    - NEVER RENDER DIALECT OR PLACEHOLDER LABELS. Replace everything with professional finished assets.
    
    STRICT VISUAL DIRECTIVES:
    - ASPECT RATIO: ${aspectRatio}
    - TYPOGRAPHY & TEXT: ${
      /RENDER|HEADLINE|TEXT|COPY|ACTION|STAMP/i.test(prompt)
        ? "RENDER professional, clean, and legible typography only for the headlines/copy requested in the prompt. Integrate it artistically into the design."
        : "KEEP IT PURELY VISUAL. No text or watermarks in the scene."
    }
    - Focus on visual storytelling and high commercial production value (2k, studio lighting).
    
    REFERENCE HANDLING: 
    - ITEM 1 (PRODUCT): Maintain this product identity (labels, shape) perfectly.
    - If REFERENCE TYPE is 'layout': Follow the composition and skeleton strictly but FILL IT with real photographic content.
    - If REFERENCE TYPE is 'style': Follow ONLY colors, lighting, and "vibe". IGNORE object placement.
    - ITEM 3 (CONTINUITY): Maintain visual consistency (colors/lighting) with previous sections if present.`;
    }

    const parts = this.buildBasePart(strategicPrompt);
    await this.handleImages(parts, previousImageUrl, referenceImage, referenceType, req.continuityImage);
    
    const restPayload = await this.buildRestPayload(strategicPrompt, parts, aspectRatio);

    return { 
      strategicPrompt, 
      parts,
      instances: restPayload.instances,
      parameters: restPayload.parameters
    };
  }
}
