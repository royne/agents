import { BaseImageProService } from './baseService';
import { ImageProRequest, StrategicPromptResponse } from './types';

export class PersonaService extends BaseImageProService {
  static async buildPrompt(req: ImageProRequest): Promise<StrategicPromptResponse> {
    const { subMode, prompt, productData, referenceImage, previousImageUrl, aspectRatio = '9:16', isCorrection } = req;
    
    let strategicPrompt = "";

    if (isCorrection) {
      strategicPrompt = `PERSONA IMAGE REFINEMENT:
      Maintain human identity and consistency from ITEM 1.
      MODIFICATION: ${prompt}
      ASPECT RATIO: ${aspectRatio}`;
    } else {
      const marketingContext = (productData.name || productData.angle || productData.buyer) 
        ? `\nCONTEXT: ${productData.name} ${productData.angle ? `| Angle: ${productData.angle}` : ''} ${productData.buyer ? `| Audience: ${productData.buyer}` : ''}`
        : '';

      strategicPrompt = `HIGH-END FASHION & PERSONA PHOTOGRAPHY
      GOAL: ${subMode === 'cara' ? 'SWAP FACE' : subMode === 'fondo' ? 'CHANGE BACKGROUND' : subMode === 'producto' ? 'INTEGRATE PRODUCT' : 'GENERATE PERSONA'}
      
      INSTRUCTION: ${prompt}
      ${marketingContext}
      
      CRITICAL FIDELITY:
      ${subMode === 'cara' 
        ? "- Use the subject in ITEM 1 but REPLACE the face with the face from ITEM 2. Match lighting, age, and skin tone perfectly." 
        : subMode === 'fondo'
        ? "- Maintain the model and product from ITEM 1 exactly. ONLY change the background/environment to a premium setting."
        : subMode === 'producto'
        ? "- Integrate the product from ITEM 2 into the person's hands or scene in ITEM 1. Match shadows and reflections."
        : "- Generate a realistic person. If ITEM 1 is provided, use it as a base for physical features and pose."}
      
      COMPOSITION:
      - Preserve original lighting and textures if ITEM 1 exists.
      - Cinematic aesthetic, high-detail skin, luxury photographic finish.
      - NO TEXT OR GRAPHICS.
      - ASPECT RATIO: ${aspectRatio}`;
    }

    const parts = this.buildBasePart(strategicPrompt);
    await this.handleImages(parts, previousImageUrl, referenceImage, 'style');

    return { strategicPrompt, parts };
  }
}
