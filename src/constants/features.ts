import { Plan } from './plans';

export type FeatureKey =
  | 'agents.create'
  | 'data-analysis.orders-movement'
  | 'data-analysis.excel-analysis'
  | 'data-analysis.daily-orders'
  | 'orders.management'
  | 'calculator.use'
  ;

// Habilitación de features por plan (por defecto)
export const DEFAULT_PLAN_FEATURES: Record<Plan, Partial<Record<FeatureKey, boolean>>> = {
  basic: {
    'agents.create': false,
    'data-analysis.orders-movement': true,
    'data-analysis.excel-analysis': true,
    'data-analysis.daily-orders': false,
    'orders.management': false,
    'calculator.use': true,
  },
  premium: {
    'agents.create': true,
    'data-analysis.orders-movement': true,
    'data-analysis.excel-analysis': true,
    'data-analysis.daily-orders': true,
    'orders.management': true,
    'calculator.use': true,
  },
  tester: {
    'agents.create': false,
    'data-analysis.orders-movement': true,
    'data-analysis.excel-analysis': true,
    'data-analysis.daily-orders': false,
    'orders.management': false,
    'calculator.use': true,
  },
};

export function hasFeatureForPlan(plan: Plan, key: FeatureKey, overrides?: Partial<Record<FeatureKey, boolean>>): boolean {
  const base = DEFAULT_PLAN_FEATURES[plan] || {};
  if (overrides && key in overrides) return !!overrides[key];
  return !!base[key];
}
