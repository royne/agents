export type Plan = 'free' | 'starter' | 'pro' | 'business' | 'tester';

export type ModuleKey =
  | 'agents'
  | 'profitability'        // Deprecated
  | 'campaign-control'     // Deprecated
  | 'calculator'
  | 'logistic'
  | 'data-analysis'
  | 'dbmanager'            // Deprecated
  | 'planning'
  | 'chat'
  | 'settings'
  | 'image-pro'
  | 'landing-pro'
  | 'video-pro'
  | 'admin';

export interface ModuleMetadata {
  key: ModuleKey;
  label: string;
  description: string;
  icon: string;
  isDeprecated?: boolean;
}

export const MODULE_METADATA: Record<ModuleKey, ModuleMetadata> = {
  agents: { key: 'agents', label: 'Agentes IA', description: 'Chat directo con agentes especializados.', icon: 'FaRobot' },
  profitability: { key: 'profitability', label: 'Rentabilidad', description: 'Cálculo de márgenes y ROI.', icon: 'FaChartLine', isDeprecated: true },
  'campaign-control': { key: 'campaign-control', label: 'Control de Campañas', description: 'Monitoreo de pauta publicitaria.', icon: 'FaAd', isDeprecated: true },
  calculator: { key: 'calculator', label: 'Calculadora', description: 'Herramientas matemáticas rápidas.', icon: 'FaCalculator' },
  logistic: { key: 'logistic', label: 'Logística', description: 'Gestión de envíos y transportadoras.', icon: 'FaTruck' },
  'data-analysis': { key: 'data-analysis', label: 'Análisis de Datos', description: 'Dashboards y métricas de ventas.', icon: 'FaDatabase' },
  dbmanager: { key: 'dbmanager', label: 'DB Manager', description: 'Administración de base de datos.', icon: 'FaServer', isDeprecated: true },
  planning: { key: 'planning', label: 'Planeación', description: 'Calendario y organización de tareas.', icon: 'FaCalendarAlt' },
  chat: { key: 'chat', label: 'Master Chat', description: 'Chat con RAG avanzado (Admin).', icon: 'FaComments' },
  settings: { key: 'settings', label: 'Configuración', description: 'Ajustes de cuenta y perfil.', icon: 'FaCog' },
  'image-pro': { key: 'image-pro', label: 'Image Pro', description: 'Generación de imágenes con IA.', icon: 'FaImage' },
  'landing-pro': { key: 'landing-pro', label: 'Landing Pro', description: 'Creación de landing pages vendedoras.', icon: 'FaRocket' },
  'video-pro': { key: 'video-pro', label: 'Video Pro', description: 'Generación de videos UGC con IA.', icon: 'FaFilm' },
  admin: { key: 'admin', label: 'Panel Admin', description: 'Gestión global de la plataforma.', icon: 'FaUserShield' },
};

export const PLAN_ORDER: Plan[] = ['free', 'starter', 'pro', 'business', 'tester'];

export const PLAN_CREDITS: Record<Plan, number> = {
  free: 50,
  starter: 200,
  pro: 1200,
  business: 5000,
  tester: 99999
};


export function isPlanAtLeast(userPlan: Plan | undefined, required: Plan) {
  const up = userPlan || 'free';
  return PLAN_ORDER.indexOf(up) >= PLAN_ORDER.indexOf(required);
}
