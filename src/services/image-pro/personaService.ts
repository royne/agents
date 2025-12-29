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
      ASPECT RATIO: ${aspectRatio}
      INSTRUCTION: Keep everything intact except the requested change.`;
    } else {
      const marketingContext = (productData.name || productData.angle || productData.buyer) 
        ? `\nMARKETING CONTEXT: ${productData.name} | Angle: ${productData.angle} | Audience: ${productData.buyer}`
        : '';

      const isFaceSwap = subMode?.startsWith('cara');
      const isFullSwap = subMode === 'cara_completo';

      const modeTitle = isFaceSwap ? 'IDENTITY TRANSFORMATION' 
                      : subMode === 'fondo' ? 'ENVIRONMENT & BACKGROUND REPLACEMENT' 
                      : subMode === 'producto' ? 'PRODUCT INTEGRATION' 
                      : 'GENERATE REALISTIC PERSONA';

      const fidelityDirectives = isFaceSwap 
        ? `- ITEM 1 (BASE MODEL): Keep the body, clothes, background, and lighting of this image exactly.
           - ITEM 2 (IDENTITY REFERENCE): Extract the features from this subject.
           - MISSION: ${isFullSwap 
               ? "Replace the HEAD (Face AND Hairstyle) in ITEM 1 with the identity from ITEM 2." 
               : "Replace ONLY the Face features in ITEM 1 with the features from ITEM 2. Keep ITEM 1's original hair."}
           - Match skin tone, lighting, and integration perfectly.`
        : subMode === 'fondo'
        ? `- ITEM 1 (MODEL & PRODUCT): Keep the person and product exactly as they are.
           - MISSION: Place them in a new environment described as: ${prompt}. Match lighting and shadows.`
        : subMode === 'producto'
        ? `- ITEM 1 (SCENE): Use this as the base environment.
           - ITEM 2 (PRODUCT): Integrate this product into the scene or subject's hands.
           - MISSION: Make it look natural with realistic shadows and reflections.`
        : `- MISSION: Generate a realistic person based on: ${prompt}. 
           - If ITEM 1 exists, use it as a reference for pose and physical traits.`;

      strategicPrompt = `HIGH-END COMMERCIAL PHOTOGRAPHY - PERSONA MODE
      GOAL: ${modeTitle}
      ${marketingContext}
      
      SPECIFIC INSTRUCTIONS: ${prompt}
      
      CORE DIRECTIVES:
      ${fidelityDirectives}
      - Aesthetics: Cinematic, 2k, ultra-realistic skin textures, professional studio lighting.
      - NO TEXT, GRAPHICS, OR WATERMARKS.
      - ASPECT RATIO: ${aspectRatio}`;
    }

    const parts = this.buildBasePart(strategicPrompt);
    await this.handleImages(parts, previousImageUrl, referenceImage, 'style');

    return { strategicPrompt, parts };
  }
}
