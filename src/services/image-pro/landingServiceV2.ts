import { BaseImageProService } from './baseService';
import { ImageProRequest, StrategicPromptResponse } from './types';

export class LandingServiceV2 extends BaseImageProService {
  static async buildPrompt(req: ImageProRequest): Promise<StrategicPromptResponse> {
    const { 
      productData, 
      prompt, 
      aspectRatio = '9:16', 
      isCorrection, 
      referenceImage, 
      referenceType, 
      previousImageUrl,
      extraInstructions,
      subMode 
    } = req;
    let strategicPrompt = "";
    
    // Combine base prompt with chat instructions if any
    const finalPrompt = extraInstructions 
      ? `${prompt}. ADDITIONAL USER REQUIREMENTS: ${extraInstructions}` 
      : prompt;
    
    if (isCorrection) {
      strategicPrompt = `IMAGE EDITING & REFINEMENT MODE:
      1. BASE IMAGE (ITEM 2): Use ITEM 2 as the absolute source of truth for photo composition, lighting, background, and object placement.
      2. PRODUCT IDENTITY (ITEM 1): Ensure the product's physical identity (label, shape, color) matches ITEM 1 perfectly.
      3. STRATEGIC CONTEXT (DO NOT AUTOMATICALLY RENDER): ${prompt}
      
      MODIFICATION TASK (PRIORITY 1): ${extraInstructions || 'Apply visual refinements based on context.'}
      
      CRITICAL INSTRUCTIONS:
      - Apply ONLY the change requested in the MODIFICATION TASK.
      - DO NOT add new text, labels, or objects unless explicitly requested in the MODIFICATION TASK.
      - If the MODIFICATION TASK involves a price change, change only the number.
      - Keep EVERYTHING ELSE from ITEM 2 exactly as it is (composition, lighting, environment, text placement).
      - Do not re-imagine the scene. Perform a precise, surgical edit on the existing visual.
      - Format: ${aspectRatio === '1:1' ? '1:1 square' : '9:16 vertical'} orientation.`;
    } else {
      strategicPrompt = `PREMIUM COMMERCIAL PHOTOGRAPHY & MARKETING DESIGN
    PRODUCT IDENTITY: ${productData.name}
    MARKETING STRATEGY (CRITICAL): 
    - SELL TO: ${productData.buyer || 'High-end premium customers'}
    - CORE ANGLE: ${productData.angle || 'Exclusivity and superior quality'}
    - VISUAL GOAL: ${productData.details || 'Professional studio lighting, sharp focus'}

    SCENE DYNAMISM & VARIETY (MANDATORY):
    - Each section MUST represent a UNIQUE visual context. Do not repeat the exact same background or character pose.
    - VISUAL PROGRESSION:
      • For Hero/Benefit sections: Use wider shots, lifestyle contexts, or atmospheric setups.
      • For Technical/Detail sections: Use macro shots, clean textures, or focused lighting.
      • For Social Proof/Trust: Use relatable environments or human interaction (different poses/people).
    - The background MUST be a direct expression of the buyer and angle, but it MUST VARY from previous images to avoid monotony.
    - IMAGE QUALITY: Ultra-high definition, 2k resolution (max 2000px on the longest side), professional studio finish.
    
    ATMOSPHERE & IDENTITY:
    - Dominant colors and atmosphere derived from the product packaging and target buyer.
    - If finalPrompt includes specific color/atmosphere instructions, they take absolute priority.

    SECTION OBJECTIVE (TEXT SOURCE): ${finalPrompt}
    
    CRITICAL TEXT & IDENTITY RULES:
    - NO COPYING TEXT from ITEM 2 (Reference). The reference is for LAYOUT ONLY.
    - If the image requires text, use ONLY the core ideas from "SECTION OBJECTIVE" above. 
    - BE PROPORTIONAL: Do not render long paragraphs. Use short, punchy headlines or labels that fit the visual design.
    - If the reference shows placeholder text (lorem ipsum, etc.), IGNORE it. Replace with specific product benefits.
    
    VISUAL AUTHORITY & CONTINUITY RULES:
    - USER SPECIFIC OVERRIDES: ${extraInstructions ? `PRIORITY 1: ${extraInstructions}` : "None"}

    1. SECTION OBJECTIVE:
    - Defines the purpose, emotion, and conversion goal. Takes priority for the scene's context.

    2. REFERENCE IMAGE (ITEM 2 - LAYOUT):
    - Replicate visual hierarchy and spacing with HIGH FIDELITY. Use it as a structural blueprint only. Do NOT copy its colors or generic style.

    3. PREVIOUS IMAGE (ITEM 1 - CORE PRODUCT):
    - MAINTAIN the product (shape, label, color) with absolute fidelity.
    
    5. DESIGN CONTINUITY:
    - Maintain visual consistency in LIGHTING STYLE, COLOR TEMPERATURE, and MOOD.
    
    6. FORMAT OPTIMIZATION (CRITICAL):
    - ${aspectRatio === '1:1' ? '1:1 square' : '9:16 vertical'} orientation.
    `;
    }

    const parts = this.buildBasePart(strategicPrompt);
    // Optimization: Omit continuity image in correction mode to focus strictly on the change
    const effectiveContinuityImage = isCorrection ? undefined : req.continuityImage;
    await this.handleImages(parts, previousImageUrl, referenceImage, referenceType, effectiveContinuityImage);
    
    const restPayload = await this.buildRestPayload(strategicPrompt, parts, aspectRatio);

    return { 
      strategicPrompt, 
      parts,
      instances: restPayload.instances,
      parameters: restPayload.parameters
    };
  }
}
