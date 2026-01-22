import { ProductData, CreativePath, LandingSection } from '../../types/image-pro';

export interface LandingLayoutProposal {
  sections: {
    sectionId: string;
    title: string;
    reasoning: string;
  }[];
}

export class LandingDesignerAgent {
  static async suggestStructure(
    productData: ProductData,
    creativePath: CreativePath
  ): Promise<LandingLayoutProposal> {
    console.log('[LandingDesignerAgent] Suggesting structure for:', productData.name);

    const googleKey = process.env.GOOGLE_AI_KEY;
    if (!googleKey) throw new Error('Google AI Key is missing.');

    const prompt = `
      Act as a Senior Conversion Rate Optimization (CRO) Specialist and Landing Page Architect.
      Based on the following Product DNA and selected Creative Path, design a modular landing page structure.
      
      PRODUCT DNA:
      - Name: ${productData.name}
      - Angle: ${productData.angle}
      - Target: ${productData.buyer}
      - Details: ${productData.details}
      
      SELECTED CREATIVE STRATEGY:
      - Style: ${creativePath.package.name} (${creativePath.package.style})
      - Strategy: ${creativePath.justification}
      
      AVAILABLE SECTIONS (Dictionary):
      - hero: Value proposition and first impression.
      - oferta: Price and value stack.
      - transformacion: Before & After.
      - beneficios: Key logical/emotional benefits.
      - comparativa: Vs competitors.
      - autoridad: Certifications/Expertise.
      - testimonios: Social proof.
      - instrucciones: How it works.
      - componentes: High quality materials/ingredients.
      - cierre: Final CTA.
      
      INSTRUCTIONS:
      1. Select EXACTLY 5 to 6 sections that best fit this specific product and strategy.
      2. Order them logically for maximum conversion (AIDA or similar).
      3. For each section, provide a short reasoning in Spanish explaining WHY it fits here.
      
      Respond ONLY with a JSON object in this format:
      {
        "sections": [
          { "sectionId": "hero", "title": "...", "reasoning": "..." },
          ...
        ]
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

      console.log('[LandingDesignerAgent] Response status:', response.status);
      const result = await response.json();
      
      if (response.status !== 200) {
        console.error('[LandingDesignerAgent] API Error Result:', JSON.stringify(result, null, 2));
      }

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        console.error('[LandingDesignerAgent] No text in candidate. Full result:', JSON.stringify(result, null, 2));
        throw new Error('Landing Designer failed to generate structure.');
      }

      const jsonStr = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr) as LandingLayoutProposal;

    } catch (error: any) {
      console.error('[LandingDesignerAgent] Error:', error.message);
      // Fallback: standard sequence
      return {
        sections: [
          { sectionId: 'hero', title: 'Hero / Innovación', reasoning: 'Atención inmediata.' },
          { sectionId: 'beneficios', title: '¿Por qué elegirnos?', reasoning: 'Conexión con el valor.' },
          { sectionId: 'transformacion', title: 'Tu nueva realidad', reasoning: 'Deseo generado.' },
          { sectionId: 'testimonios', title: 'Confianza Total', reasoning: 'Prueba social.' },
          { sectionId: 'cierre', title: 'Únete hoy', reasoning: 'Acción final.' }
        ]
      };
    }
  }
}
