export interface AdConcept {
  id: string;
  title: string;
  hook: string;
  body: string;
  adCta?: string;
  visualPrompt: string;
}

export class FacebookAdsAgent {
  static async generateAdConcepts(productData: any, landingStructure: any): Promise<AdConcept[]> {
    const googleKey = process.env.GOOGLE_AI_KEY;
    if (!googleKey) throw new Error('Google AI Key is missing.');

    const systemPrompt = `You are a Facebook Ads expert specialized in Direct Response Marketing and Consumer Psychology. 
    Your goal is to generate 3 HIGH-CONVERSION ad concepts based on a product's DNA and its landing page structure.
    
    CRITICAL STRATEGY: Target Awareness Levels 3 (Solution Aware) and 4 (Product Aware).
    - The audience already knows their problem/pain.
    - Your copy must be authoritative, direct, and focused on the SPECIFIC solution/benefit of this product, max 7 lines.
    - Hooks should be sharp, stopping the scroll for someone already looking for a change.

    A good Facebook ad concept needs:
    1. A powerful HOOK (The first line that stops the scroll).
    2. A benefit-driven BODY (Maximum conversion focus).
    3. A clear VISUAL CONCEPT (Detailed description for the image generator).
    
    PRODUCT CONTEXT:
    - Name: ${productData.name}
    - Angle: ${productData.angle}
    - Buyer: ${productData.buyer}
    - Details: ${productData.details}
    
    LANDING STRUCTURE:
    ${landingStructure.sections.map((s: any) => `- ${s.title}: ${s.reasoning}`).join('\n')}
    
    OUTPUT FORMAT (JSON ONLY):
    [
      {
        "id": "uuid-v4 or unique-string",
        "title": "Short internal title",
        "hook": "The scroll-stopper headline",
        "body": "The ad copy text",
        "adCta": "Short text for a visual sticker/label (e.g., 'FREE SHIPPING', 'SALE', 'LAST UNITS')",
        "visualPrompt": "Detailed description for an AI image generator focusing on visual impact and the product as the hero"
      },
      ...
    ]
    Return exactly 3 conceptos. Be creative and strategically different between them (e.g., Direct Solution, Aspirational Authority, Comparison/Status, notice, etc...).`;

    try {
      const modelId = 'gemini-3-flash-preview';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${googleKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: systemPrompt }]
          }]
        })
      });

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) throw new Error('Facebook Ads Agent failed to generate concepts.');
      
      // Clean JSON from markdown and any extra text
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const cleanText = jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim();
      
      const concepts = JSON.parse(cleanText);
      return concepts.map((c: any, i: number) => ({
        ...c,
        id: `ad-concept-${i + 1}-${Math.random().toString(36).substr(2, 9)}`
      }));
    } catch (e: any) {
      console.error("[FacebookAdsAgent] Error:", e.message);
      throw new Error("Invalid response from Ads Agent: " + e.message);
    }
  }

  static async refineAdConcept(productData: any, currentConcept: AdConcept, feedback?: string): Promise<AdConcept> {
    const googleKey = process.env.GOOGLE_AI_KEY;
    if (!googleKey) throw new Error('Google AI Key is missing.');

    const systemPrompt = `You are a Facebook Ads expert. Your goal is to REFINE or GENERATE AN ALTERNATIVE for an existing ad concept based on user feedback or strategic improvement.
    
    PRODUCT CONTEXT:
    - Name: ${productData.name}
    - Angle: ${productData.angle}
    - Buyer: ${productData.buyer}
    
    CURRENT CONCEPT:
    - Hook: ${currentConcept.hook}
    - Body: ${currentConcept.body}
    - CTA: ${currentConcept.adCta}
    - Visual: ${currentConcept.visualPrompt}
    
    USER FEEDBACK/INSTRUCTION: ${feedback || "Generate a better, higher-converting alternative."}
    
    OUTPUT FORMAT (JSON ONLY):
    {
      "id": "${currentConcept.id}",
      "title": "Refined: ${currentConcept.title}",
      "hook": "The new scroll-stopper",
      "body": "The new ad copy",
      "adCta": "The new visual sticker text",
      "visualPrompt": "The new visual description (keep similar if feedback doesn't ask for visual changes)"
    }`;

    try {
      const modelId = 'gemini-3-flash-preview';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${googleKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: systemPrompt }]
          }]
        })
      });

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) throw new Error('Refinement failed.');
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const cleanText = jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim();
      
      return JSON.parse(cleanText);
    } catch (e: any) {
      console.error("[FacebookAdsAgent] Refine Error:", e.message);
      throw new Error("Invalid response during refinement: " + e.message);
    }
  }
}
