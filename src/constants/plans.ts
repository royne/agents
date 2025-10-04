export type Plan = 'basic' | 'premium' | 'tester';

export type ModuleKey =
  | 'agents'
  | 'profitability'
  | 'campaign-control'
  | 'calculator'
  | 'logistic'
  | 'data-analysis'
  | 'dbmanager'
  | 'planning'
  | 'chat'
  | 'settings'
  | 'admin';

// Mapeo de módulos por plan (por defecto)
export const DEFAULT_PLAN_MODULES: Record<Plan, ModuleKey[]> = {
  basic: [
    'agents',
    'calculator',
    'data-analysis',
    'settings',
  ],
  premium: [
    'agents',
    'profitability',
    'campaign-control',
    'calculator',
    'logistic',
    'planning',
    'data-analysis',
    'dbmanager',
    'chat',
    'settings',
    'admin',
  ],
  tester: [
    'agents',
    'calculator',
    'data-analysis',
    'settings',
  ],
};

export const PLAN_ORDER: Plan[] = ['basic', 'tester', 'premium'];

export function isPlanAtLeast(userPlan: Plan | undefined, required: Plan) {
  const up = userPlan || 'basic';
  return PLAN_ORDER.indexOf(up) >= PLAN_ORDER.indexOf(required);
}

export function computeModulesForPlan(plan: Plan, overrides?: Partial<Record<ModuleKey, boolean>>): Set<ModuleKey> {
  const base = new Set(DEFAULT_PLAN_MODULES[plan]);
  if (overrides) {
    for (const [key, enabled] of Object.entries(overrides)) {
      const k = key as ModuleKey;
      if (enabled === true) base.add(k);
      if (enabled === false) base.delete(k);
    }
  }
  return base;
}
