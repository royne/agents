import { BaseImageProService } from './baseService';
import { ImageProRequest, StrategicPromptResponse } from './types';

export class AdsService extends BaseImageProService {
  static async buildPrompt(req: ImageProRequest): Promise<StrategicPromptResponse> {
    const { productData, prompt, aspectRatio = '1:1', isCorrection, referenceImage, previousImageUrl } = req;
    
    let strategicPrompt = "";
    
    if (isCorrection) {
      strategicPrompt = `AD REFINEMENT:
      Maintain marketing core from ITEM 1.
      TARGET: ${productData.buyer}
      ANGLE: ${productData.angle}
      MODIFICATION: ${prompt}
      ASPECT RATIO: ${aspectRatio}`;
    } else {
      strategicPrompt = `PREMIUM COMMERCIAL ADVERTISEMENT
      ${this.getCommonMarketingContext(productData)}
      SECTION OBJECTIVE: ${prompt}
      
      STRICT VISUAL DIRECTIVES:
      - Preserve the product from ITEM 1 exactly.
      - ASPECT RATIO: ${aspectRatio}
      - TYPOGRAPHY: ${/RENDER|HEADLINE|TEXT|COPY|ACTION|STAMP/i.test(prompt)
        ? "RENDER professional, legible typography integrated artistically."
        : "NO TEXT/LABELS."}`;
    }

    const parts = this.buildBasePart(strategicPrompt);
    this.handleImages(parts, previousImageUrl, referenceImage, req.referenceType);
    
    return { strategicPrompt, parts };
  }
}
