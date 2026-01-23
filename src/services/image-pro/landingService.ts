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
      extraInstructions,
      subMode 
    } = req;
    
    let strategicPrompt = "";
    
    // Combine base prompt with chat instructions if any
    const finalPrompt = extraInstructions 
      ? `${prompt}. ADDITIONAL USER REQUIREMENTS: ${extraInstructions}` 
      : prompt;
    
    if (isCorrection) {
      strategicPrompt = `IMAGE REFINEMENT & CORE ALIGNMENT:
      Maintain the current visual identity, product features, and marketing core.
      CORE STRATEGY (STAY TRUE TO THIS): 
      - TARGET: ${productData.buyer || 'High-end premium customers'}
      - ANGLE: ${productData.angle || 'Exclusivity and superior quality'}
      
      NEW MODIFICATION REQUEST: ${finalPrompt}
      
      INSTRUCTION: Apply the modification while keeping the product in ITEM 1 identical. Do not change the layout or background drastically unless requested.`;
    } else {
      strategicPrompt = `PREMIUM COMMERCIAL PHOTOGRAPHY & MARKETING DESIGN
    PRODUCT IDENTITY: ${productData.name}
    MARKETING STRATEGY (CRITICAL): 
    - SELL TO: ${productData.buyer || 'High-end premium customers'}
    - CORE ANGLE: ${productData.angle || 'Exclusivity and superior quality'}
    - VISUAL GOAL: ${productData.details || 'Professional studio lighting, sharp focus'}

    SCENE & ENVIRONMENT DERIVATION (MANDATORY):
    - The background, physical environment, and scene context MUST be a direct visual expression of:
      • the target buyer
      • the core sales angle
    - The scene must represent a believable place or context where this buyer expects to see or use the product.
    - DO NOT default to white, neutral, or studio backgrounds unless they are explicitly justified by the buyer and angle.
    - COLOR & ATMOSPHERE SOURCE (CRITICAL):
      • Dominant colors, background tone, and atmosphere MUST be derived from:
        - the product packaging
        - the product category
        - the target buyer’s expected aesthetic
      • The reference image may contribute texture, depth, or composition cues ONLY.
      • DO NOT import dominant colors, color temperature, or mood from the reference image.
      • Any color present in the reference image that conflicts with the product branding MUST be ignored.
      • If finalPrompt includes specific color/atmosphere instructions, they take absolute priority.

    SECTION OBJECTIVE: ${finalPrompt}
    
    CRITICAL INSTRUCTION: 
    - You are generating a HIGH-END COMMERCIAL advertisement.
    - If you see placeholders like "FOTO PRODUCTO", "FOTO MODELO", or "TEXTO" in ITEM 2, YOU MUST REPLACE THEM with real cinematic content: real professional models, real textures, and real marketing copy.
    - Each placeholder or generic block in a mockup must be semantically interpreted:
      • Headlines → benefit-driven marketing headlines
      • Icons → visual metaphors for benefits
      • Before/After → realistic transformation comparison
      • CTA blocks → conversion-focused closing visual
    - NEVER RENDER DIALECT OR PLACEHOLDER LABELS. Replace everything with professional finished assets.
    - SECTION TITLES OR PROMPT NAMES MUST NEVER APPEAR AS VISIBLE TEXT IN THE IMAGE.
    
    STRICT VISUAL DIRECTIVES:
    - ASPECT RATIO: ${aspectRatio}
    - TYPOGRAPHY & TEXT: ${
      /RENDER|HEADLINE|TEXT|COPY|ACTION|STAMP/i.test(finalPrompt)
        ? "RENDER professional, clean, and legible typography ONLY when explicitly required by the section objective. Text must be minimal, conversion-focused, and NEVER instructional or generic."
        : "KEEP IT PURELY VISUAL. No text or watermarks in the scene."
    }
    - Focus on visual storytelling and high commercial production value. 
    - IMAGE QUALITY: Ultra-high definition, 2k resolution (max 2000px on the longest side), studio lighting.
    - BRANDING PRIORITY: Color palette, mood, and visual tone must be derived from the product itself (packaging, category, buyer persona), NOT from the reference image.
      • EXCEPTION: If the reference is a MOCKUP, use it ONLY to understand layout and hierarchy, NEVER as a source of branding or color.
    
    
    VISUAL AUTHORITY & CONTINUITY RULES:
    - USER SPECIFIC OVERRIDES: ${extraInstructions ? `PRIORITY 1: ${extraInstructions}` : "None"}

    1. SECTION OBJECTIVE:
    - Defines the purpose, emotion, and conversion goal of this image.
    - Must NEVER be overridden by references or continuity.

    CONFLICT RESOLUTION RULE (CRITICAL):
    - If the reference image structure conflicts with scene derivation, branding rules, or buyer context:
      • Scene, environment, and atmosphere MUST be reinterpreted to fit the buyer and angle.
      • Layout fidelity must be preserved WITHOUT copying emptiness, background color, or minimalism from the reference.
    
    2. REFERENCE IMAGE (ITEM 2):
    - Treated as a STRUCTURAL BLUEPRINT.
    - Replicate layout, visual hierarchy, spacing, and composition with HIGH FIDELITY.
    - Do NOT copy text, colors, branding, or products from the reference.
    - Apply the structure to the current product and section objective.
    - Background color or emptiness in the reference is NOT an instruction; it must be reinterpreted according to branding rules.

    - If the reference image is a WIREFRAME or MOCKUP (flat shapes, placeholders, silhouettes, generic labels):
      • Treat it as a PURE LAYOUT SCHEMA.
      • Ignore its lack of realism.
      • Respect block positions, proportions, and visual grouping EXACTLY.
      • Translate each placeholder block into a real photographic and commercial element.
    
    3. PREVIOUS IMAGE (ITEM 1 - CORE PRODUCT IDENTITY):
    - This is the ONLY source of truth for the product properties (shape, label, color, branding).
    - MUST be replicated with absolute fidelity in the new scene.
    - DO NOT allow ITEM 2 (Reference) or ITEM 3 (Continuity) to alter the product's physical appearance.

    4. PREVIOUS IMAGE (ITEM 3 - CONTINUITY):
    - Used ONLY to maintain visual continuity across the landing.
    - Maintain consistency in:
      • Color temperature
      • Lighting style
      • Mood and atmosphere
      • Camera language (cinematic vs clean)
    - MUST NOT replicate layout or composition from the previous image.
    - MUST NOT introduce elements that conflict with the current section objective.`;
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
