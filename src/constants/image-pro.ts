import { AdStep } from '../types/image-pro';

export const ADS_STEPS: AdStep[] = [
  {
    id: 'hook',
    title: 'Hook Visual',
    prompt: 'MAIN HERO AD: Create a high-impact visual hook. Cinematic lighting. RENDER A BOLD MARKETING HEADLINE integrated into the design based on the Angle of Sale. Use professional typography. No placeholder text, use meaningful copy.'
  },
  {
    id: 'proof',
    title: 'Prueba de Valor',
    prompt: 'TECHNICAL PROOF AD: Macro studio shot of product quality. INCLUDE A SUB-HEADLINE OR STAMP that certifies quality or a key benefit. The text should be sharp and legible, reinforcing the buyer persona trust.'
  },
  {
    id: 'cta',
    title: 'Acción / Estilo de Vida',
    prompt: 'LIFESTYLE CALL TO ACTION: The product in use. RENDER A CLEAR "CALL TO ACTION" text (e.g. "Shop Now" or a benefit-driven phrase) using modern design aesthetics. The typography must feel part of a premium advertisement.'
  }
];

export const PERSONA_PROMPTS = {
  generar: 'Hyper-realistic model interacting with the product. Natural pose, commercial lighting, high-end fashion aesthetic.',
  fondo: 'Maintain the product and primary subject exactly but place them in a premium setting with matching lighting and atmosphere.',
  cara: 'Close-up focus on human face interacting with product. Expressive, authentic emotion, high detail skin textures, professional portrait lighting.',
  producto: 'Integrate the product naturally into a pre-existing lifestyle scene with people. Perfect shadow and reflection matching.'
};
