import { BaseImageProService } from './baseService';
import { ImageProRequest, StrategicPromptResponse } from './types';

export class LandingService extends BaseImageProService {
  static async buildPrompt(req: ImageProRequest): Promise<StrategicPromptResponse> {
    const { productData, prompt, aspectRatio = '9:16', isCorrection, referenceImage, previousImageUrl } = req;
    
    let strategicPrompt = "";
    
    if (isCorrection) {
      strategicPrompt = `LANDING SECTION REFINEMENT:
      Maintain section purpose and brand style from ITEM 1.
      MODIFICATION: ${prompt}
      ASPECT RATIO: ${aspectRatio}`;
    } else {
      strategicPrompt = `CONVERSIÓN-FOCUSED LANDING PAGE DESIGN
      ${this.getCommonMarketingContext(productData)}
      SECTION GOAL: ${prompt}
      
      CRITICAL ISOLATION:
      - This is ONE section of many. Do not include random elements from other sections.
      - Focus strictly on the visual storytelling of this step.
      
      STYLE DIRECTIVES:
      - ASPECT RATIO: ${aspectRatio}
      - NO TEXT unless explicitly requested in the prompt.`;
    }

    const parts = this.buildBasePart(strategicPrompt);
    this.handleImages(parts, previousImageUrl, referenceImage, req.referenceType);
    
    return { strategicPrompt, parts };
  }
}
