import { BaseImageProService } from './baseService';
import { ImageProRequest, StrategicPromptResponse } from './types';

export interface VideoProRequest extends ImageProRequest {
  script?: string;
  specs?: {
    accent?: string;
    tone?: string;
    gender?: string;
  };
  lastFrameBase64?: string;
  previousVideoUri?: string;
  generationMode?: 'normal' | 'extend' | 'interpolation';
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
      SCRIPT/DIALOGUE: "${script || 'Natural interaction with the product'}"
      ${specsContext}
      
      VISUAL DIRECTIVES:
      - MODEL: VEO-3.1-FAST-GENERATE-PREVIEW (720p Optimized)
      - ASPECT RATIO: ${aspectRatio}
      - LIGHTING: Professional studio/commercial
      - MOTION: Smooth, natural UGC style
      
      STRICT INSTRUCTION:
      - Use ITEM 1 as the first frame identity reference or resource reference.
      - Maintain consistency of product labels, shapes and person identity.
      - For dialogue, ensure lip-sync and natural voice matching specs.`;
    }

    const parts = this.buildBasePart(strategicPrompt);
    // handleImages handles previousImageUrl as ITEM 1, etc.
    await this.handleImages(parts, previousImageUrl, referenceImage, 'style');
    
    return { strategicPrompt, parts };
  }

  static async buildRestInstances(req: VideoProRequest) {
    const { 
      productData, 
      prompt, 
      script, 
      specs, 
      aspectRatio = '9:16', 
      previousImageUrl, 
      lastFrameBase64,
      previousVideoUri,
      generationMode = 'normal'
    } = req;
    
    // Prompt optimizado seguin guia de Veo
    const consolidatedPrompt = `UGC Video for ${productData.name}. 
    Market Angle: ${productData.angle || 'Premium quality'}. 
    Dialogue/Script: "${script}". 
    Specs: ${specs?.tone || 'Natural'} tone, ${specs?.accent || 'Neutral'} accent, ${specs?.gender || 'Any'} gender. 
    Instruction: ${prompt}`;

    const instance: any = {
      prompt: consolidatedPrompt
    };

    // 1. Manejo de Extension de Video
    if (generationMode === 'extend' && previousVideoUri) {
      instance.video = {
        uri: previousVideoUri
      };
    }

    // 2. Manejo de Interpolacion e Imagen Inicial
    if (previousImageUrl) {
      const imageData = await this.imageUrlToBase64(previousImageUrl);
      if (imageData) {
        // Segun documentacion oficial: el campo se llama 'image' para el primer frame
        instance.image = {
          bytesBase64Encoded: imageData.data,
          mimeType: imageData.mimeType
        };
      }
    }

    if (lastFrameBase64) {
      // Si ya viene en base64 (del frontend), lo usamos directo. Si es URL, limpiamos.
      const base64Data = lastFrameBase64.includes('base64,') 
        ? lastFrameBase64.split('base64,')[1] 
        : lastFrameBase64;
      
      // Segun investigacion REST: lastFrame va en 'instances' junto a prompt e image
      instance.lastFrame = {
        bytesBase64Encoded: base64Data,
        mimeType: 'image/png' 
      };
    }

    const parameters: any = {
      aspectRatio: aspectRatio,
      // Agregamos negative prompt por defecto para calidad (soportado segun tabla)
      negativePrompt: "low quality, blurry, distorted, watermarks",
      // Para extension e interpolacion, la doc dice 8 (como numero)
      durationSeconds: 8, 
      // Permitir personas (necesario para interpolacion y generacion real)
      personGeneration: (generationMode === 'extend') ? "allow_all" : "allow_adult"
    };

    if (generationMode === 'extend') {
      parameters.resolution = "720p"; // Solo para extension
    }

    return {
      instances: [instance],
      parameters
    };
  }
}
