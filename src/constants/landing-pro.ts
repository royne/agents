import { 
  FaMagic, FaDollarSign, FaExchangeAlt, FaStar, FaListUl, 
  FaCertificate, FaUsers, FaBook, FaCube, FaFlagCheckered 
} from 'react-icons/fa';
import { LandingSection, MarketingLayout } from '../types/landing-pro';

export const LANDING_SECTIONS: LandingSection[] = [
  {
    id: 'hero',
    title: 'Hero / Gancho',
    description: 'Captura la atención con un mensaje poderoso que conecta con el dolor del cliente.',
    icon: FaMagic,
    prompt: 'HERO SECTION (CONVERSION FOCUSED): Create a cinematic, high-end commercial image designed to immediately resonate with the TARGET BUYER. The scene must visually reflect the CORE PROBLEM or DESIRE implied by the sales angle. The product must appear as the natural solution or relief within the scene. DO NOT include pricing, feature lists, or section titles.  If text is included, it must be intentional final copy — never conceptual labels.'
  },
  {
    id: 'oferta',
    title: 'Oferta Irresistible',
    description: 'Presenta tu producto con un precio y valor que el cliente no puede rechazar.',
    icon: FaDollarSign,
    prompt: 'OFFER SECTION (DECISION MOMENT): Create a bold, high-conversion commercial image focused on the value of the offer. This is the ONLY section allowed to visually communicate pricing, bundles, or savings. The scene must communicate urgency or value advantage without exaggeration. DO NOT include section titles or conceptual labels.'
  },
  {
    id: 'transformacion',
    title: 'Antes y Después',
    description: 'Muestra la transformación que tu producto genera en la vida del cliente.',
    icon: FaExchangeAlt,
    prompt: 'TRANSFORMATION SECTION (PROOF OF EFFECT): Create a clear, side-by-side or sequential visual transformation. The "Before" state must reflect the REAL problem described in the product details. The "After" state must show a believable, tangible improvement caused by the product. The product must be visually implied as the bridge between both states. DO NOT include pricing, offers, or section titles.'
  },
  {
    id: 'beneficios',
    title: 'Beneficios',
    description: 'Lista los beneficios clave que resuelven los problemas de tu audiencia.',
    icon: FaStar,
    prompt: 'BENEFITS SECTION (PROBLEM-SOLUTION): Create a high-end commercial scene illustrating EXACTLY three distinct benefits. Each benefit must visually correspond to a specific user problem described in the product details. Each benefit must be represented by a clearly different scenario or action. DO NOT repeat Hero-style imagery. DO NOT include pricing or section titles. If text is included, it must clarify the benefit — not decorate the design.'
  },
  {
    id: 'comparativa',
    title: 'Tabla Comparativa',
    description: 'Compara tu producto vs alternativas para mostrar superioridad.',
    icon: FaListUl,
    prompt: 'COMPARISON SECTION (CHOICE SIMPLIFICATION):Create a clean, professional visual comparison that clearly positions the product as superior. Focus on 1-2 decisive quality differences. Avoid pricing, testimonials, or benefit repetition. DO NOT include section titles or abstract labels.'
  },
  {
    id: 'autoridad',
    title: 'Prueba de Autoridad',
    description: 'Certificaciones, estudios y credenciales que validan tu producto.',
    icon: FaCertificate,
    prompt: 'AUTHORITY SECTION (RISK REDUCTION): Create a professional, credible environment that visually validates the product. Use expert, lab, clinical, or certification cues that align with the product details. The tone must be factual and restrained — not promotional. DO NOT include testimonials, pricing, or marketing hooks. DO NOT include section titles.'
  },
  {
    id: 'testimonios',
    title: 'Testimonios',
    description: 'Historias reales de clientes satisfechos que generan confianza.',
    icon: FaUsers,
    prompt: 'SOCIAL PROOF SECTION (RELATABILITY): Create authentic, real-life scenes showing people similar to the target buyer. The emotion must feel natural, not staged or exaggerated. The product should appear as part of daily life or routine. DO NOT include authority symbols, pricing, or section titles.'
  },
  {
    id: 'instrucciones',
    title: 'Cómo Usar',
    description: 'Instrucciones claras que eliminan objeciones sobre complejidad.',
    icon: FaBook,
    prompt: 'HOW TO USE SECTION (FRICTION REMOVAL): Create a clear, step-based visual explanation of how the product is used. The steps must appear simple, intuitive, and low-effort. Use close-ups or macro details only when they improve understanding. DO NOT include emotional lifestyle scenes, testimonials, pricing, or section titles.'
  },
  {
    id: 'componentes',
    title: 'Componentes / Calidad',
    description: 'Explosión visual de ingredientes o materiales. Usaremos etiquetas flotantes para resaltar la calidad.',
    icon: FaCube,
    prompt: 'PRODUCT QUALITY SECTION (WHY IT WORKS): Create a cinematic exploded or deconstructed view of the product. Each ingredient or material must visually connect to a specific benefit mentioned in the product details. Use elegant, minimal callouts ONLY if they add clarity. DO NOT include generic claims or decorative labels. DO NOT include section titles.'
  },
  {
    id: 'cierre',
    title: 'Cierre / Acción',
    description: 'El empujón final. Crea urgencia sutil y resalta el gran beneficio de tomar acción ahora.',
    icon: FaFlagCheckered,
    prompt: 'CLOSING SECTION (ACTION TRIGGER): Create a high-end final scene that represents the desired end state for the buyer. The product should feel like the final piece that completes the transformation. Use subtle visual cues of urgency or exclusivity without explicit sales language. DO NOT include pricing tables or section titles.'
  }
];

export const FLASH_SECTION_IDS = ['hero', 'oferta', 'beneficios', 'testimonios', 'cierre'];

export const MARKETING_LAYOUTS: MarketingLayout[] = [
  { id: 'impact', name: 'Impacto Visual', desc: 'Producto central grande y épico', prompt: 'COMPOSITION: Large hero product strictly centered. Cinematic wide shot. Minimalist background to emphasize scale.' },
  { id: 'split', name: 'Comparativa', desc: 'Lado a lado (Antes/Después)', prompt: 'COMPOSITION: Vertical split screen. Product on the right, problem visualization on the left. High contrast.' },
  { id: 'details', name: 'Grid Beneficios', desc: 'Enfoque en texturas y detalles', prompt: 'COMPOSITION: Macro focus on product parts with soft bokeh background. Dynamic floating elements around.' },
  { id: 'trust', name: 'Prueba Social', desc: 'Producto integrado en vida real', prompt: 'COMPOSITION: Lifestyle integration. Human hands interacting with product. Rule of thirds placement.' }
];
