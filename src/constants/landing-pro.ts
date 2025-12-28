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
    prompt: 'IMPACTFUL HERO SECTION: Create a cinematic advertisement. Focus ONLY on the emotional hook. DO NOT include pricing or detailed features. The product is the STARRING HERO.'
  },
  {
    id: 'oferta',
    title: 'Oferta Irresistible',
    description: 'Presenta tu producto con un precio y valor que el cliente no puede rechazar.',
    icon: FaDollarSign,
    prompt: 'IRRESISTIBLE OFFER: Studio shot focus on the deal. This is the ONLY section that should clearly show pricing and bundles. Bold, commercial aesthetic.'
  },
  {
    id: 'transformacion',
    title: 'Antes y Después',
    description: 'Muestra la transformación que tu producto genera en la vida del cliente.',
    icon: FaExchangeAlt,
    prompt: 'TRANSFORMATION (Before & After): ISOLATED SECTION. DO NOT include pricing tables or offer details from previous steps. Focus strictly on the "Problem vs Solution" visual comparison.'
  },
  {
    id: 'beneficios',
    title: 'Beneficios',
    description: 'Lista los beneficios clave que resuelven los problemas de tu audiencia.',
    icon: FaStar,
    prompt: 'DYNAMIC BENEFITS: High-end lifestyle. DO NOT replicate the Hero or Offer layout. Focus on 3 key benefits in action. No prices.'
  },
  {
    id: 'comparativa',
    title: 'Tabla Comparativa',
    description: 'Compara tu producto vs alternativas para mostrar superioridad.',
    icon: FaListUl,
    prompt: 'COMPETITIVE ADVANTAGE: Visual comparison of quality. Clean, professional. Do not bring content from the Benefits or Offer section.'
  },
  {
    id: 'autoridad',
    title: 'Prueba de Autoridad',
    description: 'Certificaciones, estudios y credenciales que validan tu producto.',
    icon: FaCertificate,
    prompt: 'AUTHORITY & TRUST: Professional environment. Lab or expert setting. Focus on validation. No marketing hooks or prices.'
  },
  {
    id: 'testimonios',
    title: 'Testimonios',
    description: 'Historias reales de clientes satisfechos que generan confianza.',
    icon: FaUsers,
    prompt: 'SOCIAL PROOF: Authentic human emotion. The product integrated into real life. Do not include authority seals or pricing here.'
  },
  {
    id: 'instrucciones',
    title: 'Cómo Usar',
    description: 'Instrucciones claras que eliminan objeciones sobre complejidad.',
    icon: FaBook,
    prompt: 'HOW IT WORKS: Macro details of use. Educational feel. strictly functional visual. No testimonials or offers.'
  },
  {
    id: 'componentes',
    title: 'Componentes / Calidad',
    description: 'Explosión visual de ingredientes o materiales. Usaremos etiquetas flotantes para resaltar la calidad.',
    icon: FaCube,
    prompt: 'PRODUCT ANATOMY: Cinematic exploded view. The product is surrounded by its raw premium ingredients (herbs, oils, or materials) floating in high-definition. ADD ELEGANT GRAPHIC CALLOUTS or floating text labels pointing to each component. Professional studio lighting with sharp focus.'
  },
  {
    id: 'cierre',
    title: 'Cierre / Acción',
    description: 'El empujón final. Crea urgencia sutil y resalta el gran beneficio de tomar acción ahora.',
    icon: FaFlagCheckered,
    prompt: 'POWERFUL CLOSING CTA: High-end lifestyle shot showing the "Final Transformation". The product is presented as the ultimate solution. Include subtle visual elements of exclusivity or limited time (like a premium "Limited Edition" seal or a focus on the action of clicking). Vibe: Empowerment and immediate positive change.'
  }
];

export const FLASH_SECTION_IDS = ['hero', 'oferta', 'beneficios', 'testimonios', 'cierre'];

export const MARKETING_LAYOUTS: MarketingLayout[] = [
  { id: 'impact', name: 'Impacto Visual', desc: 'Producto central grande y épico', prompt: 'COMPOSITION: Large hero product strictly centered. Cinematic wide shot. Minimalist background to emphasize scale.' },
  { id: 'split', name: 'Comparativa', desc: 'Lado a lado (Antes/Después)', prompt: 'COMPOSITION: Vertical split screen. Product on the right, problem visualization on the left. High contrast.' },
  { id: 'details', name: 'Grid Beneficios', desc: 'Enfoque en texturas y detalles', prompt: 'COMPOSITION: Macro focus on product parts with soft bokeh background. Dynamic floating elements around.' },
  { id: 'trust', name: 'Prueba Social', desc: 'Producto integrado en vida real', prompt: 'COMPOSITION: Lifestyle integration. Human hands interacting with product. Rule of thirds placement.' }
];
