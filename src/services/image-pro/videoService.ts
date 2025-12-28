import { BaseImageProService } from './baseService';
import { ImageProRequest, StrategicPromptResponse } from './types';

export interface VideoProRequest extends ImageProRequest {
  script?: string;
  specs?: {
    accent?: string;
    tone?: string;
    gender?: string;
  };
}

export class VideoProService extends BaseImageProService {
  static async buildPrompt(req: VideoProRequest): Promise<StrategicPromptResponse> {
    const { 
      productData, 
      prompt, 
      script,
      specs,
      aspectRatio = '9:16', 
      isCorrection, 
      referenceImage, 
      previousImageUrl,
    } = req;
    
    let strategicPrompt = "";
    
    const specsContext = specs ? `
    SPECS:
    - ACCENT: ${specs.accent || 'Neutral'}
    - TONE: ${specs.tone || 'Professional'}
    - GENDER: ${specs.gender || 'Any'}
    ` : "";

    if (isCorrection) {
      strategicPrompt = `VIDEO REFINEMENT:
      Adjust the video based on the following request while maintaining the core product identity from ITEM 1.
      MODIFICATION REQUST: ${prompt}
      ${specsContext}`;
    } else {
      strategicPrompt = `PREMIUM UGC VIDEO GENERATION
      PRODUCT IDENTITY: ${productData.name}
      MARKETING STRATEGY: 
      - TARGET: ${productData.buyer || 'High-end premium customers'}
      - ANGLE: ${productData.angle || 'Exclusivity and superior quality'}
      
      SCENE/OBJECTIVE: ${prompt}
      SCRIPT TO FOLLOW: ${script || 'Natural interaction with the product'}
      ${specsContext}
      
      VISUAL DIRECTIVES:
      - MODEL: VEO-3.1-FAST (720p Optimized)
      - ASPECT RATIO: ${aspectRatio}
      - LIGHTING: Professional studio/commercial
      - MOTION: Smooth, natural UGC style
      
      STRICT INSTRUCTION:
      - Use ITEM 1 as the first frame identity reference. Keep product labels and shapes consistent.
      - Ensure the output is a high-quality video sequence.`;
    }

    const parts = this.buildBasePart(strategicPrompt);
    // handleImages handles previousImageUrl as ITEM 1, etc.
    await this.handleImages(parts, previousImageUrl, referenceImage, 'style');
    
    return { strategicPrompt, parts };
  }

  static async buildRestInstances(req: VideoProRequest) {
    const { productData, prompt, script, specs, aspectRatio = '9:16', previousImageUrl } = req;
    
    // El prompt consolidado para Veo 3.1
    const consolidatedPrompt = `UGC Video for ${productData.name}. 
    Angle: ${productData.angle || 'Premium'}. 
    Script: ${script}. 
    Style: ${specs?.tone || 'Natural'}. 
    Accent: ${specs?.accent || 'Neutral'}. 
    Gender: ${specs?.gender || 'Any'}. 
    Scene: ${prompt}`;

    const instances: any[] = [{
      prompt: consolidatedPrompt
    }];

    if (previousImageUrl) {
      const imageData = await this.imageUrlToBase64(previousImageUrl);
      if (imageData) {
        // Estructura verificada para veo-3.1 predictLongRunning
        instances[0].image = {
          bytesBase64Encoded: imageData.data,
          mimeType: imageData.mimeType
        };
      }
    }

    return {
      instances,
      parameters: {
        aspectRatio: aspectRatio
      }
    };
  }
}
