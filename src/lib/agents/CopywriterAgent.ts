import { ProductData, CreativePath } from '../../types/image-pro';

export interface SectionCopy {
  headline: string;
  body: string;
  cta?: string;
}

export class CopywriterAgent {
  static async generateSectionCopy(
    productData: ProductData,
    creativePath: CreativePath,
    sectionId: string,
    sectionTitle: string
  ): Promise<SectionCopy> {
    console.log('[CopywriterAgent] Generating copy for section:', sectionId);

    const googleKey = process.env.GOOGLE_AI_KEY;
    if (!googleKey) throw new Error('Google AI Key is missing.');

    const prompt = `
      Act as a Senior Direct Response Copywriter. 
      Generate a persuasive copy for a specific section of a landing page.
      
      PRODUCT DNA:
      - Name: ${productData.name}
      - Angle: ${productData.angle}
      - Target Buyer: ${productData.buyer}
      - Details: ${productData.details}
      
      CREATIVE STRATEGY:
      - Style: ${creativePath.package.name}
      - Context: ${creativePath.justification}
      
      SECTION TO WRITE:
      - ID: ${sectionId}
      - Title: ${sectionTitle}
      
      INSTRUCTIONS:
      1. Write in Spanish (neutral/Latam).
      2. The copy must be high-impact, benefit-driven, and perfectly aligned with the target buyer.
      3. Avoid fluff. Be punchy.
      4. For 'hero' sections, focus on the big hook.
      5. For 'oferta', focus on scarcity and value.
      6. For 'beneficios', focus on the transformation.
      
      Respond ONLY with a JSON object in this format:
      {
        "headline": "...",
        "body": "...",
        "cta": "..." (optional, only if relevant for the section)
      }
    `;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${googleKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }]
        })
      });

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) throw new Error('Copywriter Agent failed to generate content.');

      const jsonStr = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr) as SectionCopy;

    } catch (error: any) {
      console.error('[CopywriterAgent] Error:', error.message);
      return {
        headline: `Impulsa tu ${productData.name}`,
        body: `Descubre cómo el ángulo de ${productData.angle} puede transformar tu realidad hoy mismo.`,
        cta: 'Comenzar Ahora'
      };
    }
  }
}
