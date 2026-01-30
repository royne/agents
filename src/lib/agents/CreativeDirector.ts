import { CreativePackage, CreativePath, ProductData } from '../../types/image-pro';

const CREATIVE_CATALOG: CreativePackage[] = [
  {
    id: 'direct-conversion',
    name: 'Conversión Directa',
    description: 'Enfoque agresivo en beneficios y urgencia. Colores vibrantes, contrastes altos y CTAs muy visibles.',
    category: 'both',
    style: 'Vibrant & Bold',
    tone: 'Persuasivo y Urgente'
  },
  {
    id: 'minimal-scientific',
    name: 'Minimalista Científico',
    description: 'Limpieza, tonos pastel o blancos, fotografía macro y texturas detalladas. Ideal para salud y belleza.',
    category: 'both',
    style: 'Clean & Soft',
    tone: 'Profesional y Confiable'
  },
  {
    id: 'premium-dark',
    name: 'Elite Premium',
    description: 'Modo oscuro, iluminación dramática, materiales nobles y modelos aspiracionales. Enfoque en estatus y lujo.',
    category: 'both',
    style: 'Cinematic & Dark',
    tone: 'Exclusivo y Sofisticado'
  },
  {
    id: 'lifestyle-realism',
    name: 'Lifestyle Realista',
    description: 'Personas reales usando el producto en entornos naturales. Luz solar, desenfoque de fondo y composiciones auténticas.',
    category: 'both',
    style: 'Authentic & Natural',
    tone: 'Cercano y Auténtico'
  },
  {
    id: 'problem-solution',
    name: 'Dolor y Alivio',
    description: 'Enfoque en el problema vs la solución. Gráficos de comparación de "Antes/Después" realistas no exagerados y validación técnica o testimonial medida para no infringir politicas de ads (meta, tiktok, etc).',
    category: 'both',
    style: 'High Contrast & Comparative',
    tone: 'Empático pero Resolutivo'
  },
  {
    id: 'educational-authority',
    name: 'Autoridad Educativa',
    description: 'Infografías, desglose de componentes y esquemas técnicos. Posiciona el producto como la opción inteligente para un comprador informado.',
    category: 'both',
    style: 'Informative & Structured',
    tone: 'Educativo y Confiable'
  },
  {
    id: 'storytelling-emotional',
    name: 'Viaje Emocional',
    description: 'Narrativa centrada en el cambio de vida del usuario. Colores cálidos, enfoque en los sentimientos post-compra y menos en las specs técnicas.',
    category: 'both',
    style: 'Warm & Cinematic',
    tone: 'Inspiracional y Humano'
  }
];

export class CreativeDirector {
  static async recommend(productData: ProductData, excludeIds: string[] = []): Promise<CreativePath[]> {
    console.log('[CreativeDirector] Recommending paths for:', productData.name, 'Excluding:', excludeIds);

    const googleKey = process.env.GOOGLE_AI_KEY;
    if (!googleKey) throw new Error('Google AI Key is missing.');

    const prompt = `
      Act as a Senior Creative Director for an E-commerce Agency.
      Your task is to review the following Product DNA and select the 3 best Creative Paths from the provided catalog.
      
      PRODUCT DNA:
      - Name: ${productData.name}
      - Angle: ${productData.angle}
      - Target: ${productData.buyer}
      - Visual Details: ${productData.details}
      
      CATALOG:
      ${JSON.stringify([...CREATIVE_CATALOG].sort(() => Math.random() - 0.5), null, 2)}
      
      INSTRUCTIONS:
      1. Select EXACTLY 3 paths (objects from the catalog).
      2. CRITICAL: Avoid selecting any of these IDs if possible, as the user already rejected them: ${excludeIds.join(', ')}.
      3. Focus on finding the NEXT BEST alternatives that are still highly relevant to the Product DNA but offer a different strategic perspective.
      4. Provide a concise strategic justification in Spanish (max 3 sentences).
      5. Respond ONLY with a JSON array in the following format:
      [
        {
          "package": { ...package object... },
          "justification": "Strategic justification in Spanish..."
        },
        ...
      ]
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
          }],
          generationConfig: {
            response_mime_type: "application/json"
          }
        })
      });

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) throw new Error('Creative Director failed to generate recommendations.');

      const paths = JSON.parse(text) as CreativePath[];

      // Validation & Sanitization: Ensure we have valid objects
      const validatedPaths = paths
        .filter(p => p.package && p.package.id && p.package.name)
        .slice(0, 3); // Strictly 3

      if (validatedPaths.length === 0) throw new Error('No valid paths generated.');
      
      return validatedPaths;

    } catch (error: any) {
      console.error('[CreativeDirector] Error:', error.message);
      // Fallback: return first 3 catalog items if AI fails
      return CREATIVE_CATALOG.slice(0, 3).map(pkg => ({
        package: pkg,
        justification: 'Recomendado basado en análisis estándar de la industria.'
      }));
    }
  }
}
