import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AdConcept {
  id: string;
  title: string;
  hook: string;
  body: string;
  adCta?: string;
  visualPrompt: string;
}

export class FacebookAdsAgent {
  private static genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || "");

  static async generateAdConcepts(productData: any, landingStructure: any): Promise<AdConcept[]> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const systemPrompt = `You are a Facebook Ads expert specialized in Direct Response Marketing and Consumer Psychology. 
    Your goal is to generate 3 HIGH-CONVERSION ad concepts based on a product's DNA and its landing page structure.
    
    CRITICAL STRATEGY: Target Awareness Levels 3 (Solution Aware) and 4 (Product Aware).
    - The audience already knows their problem/pain.
    - Your copy must be authoritative, direct, and focused on the SPECIFIC solution/benefit of this product.
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
    Return exactly 3 conceptos. Be creative and strategically different between them (e.g., Direct Solution, Aspirational Authority, Comparison/Status).`;

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();
    
    // Clean JSON from markdown and any extra text
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const cleanText = jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim();
    
    try {
      const concepts = JSON.parse(cleanText);
      // Ensure IDs exist if the model failed to generate them properly
      return concepts.map((c: any, i: number) => ({
        ...c,
        id: c.id || `ad-concept-${Date.now()}-${i}`
      }));
    } catch (e) {
      console.error("Failed to parse Ad Concepts JSON:", cleanText);
      throw new Error("Invalid response from Ads Agent");
    }
  }
}
