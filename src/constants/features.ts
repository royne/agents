import { Plan } from './plans';

export type FeatureKey =
  | 'agents.create'
  | 'data-analysis.orders-movement'
  | 'data-analysis.excel-analysis'
  | 'data-analysis.daily-orders'
  | 'orders.management'
  | 'calculator.use'
  | 'image-pro.full-access'
  | 'landing-pro.full-access'
  | 'video-pro.full-access'
  ;

// Habilitación de features por plan (por defecto)
// Nota: En el futuro esto podría leerse también de subscription_plans.features
export const DEFAULT_PLAN_FEATURES: Record<Plan, Partial<Record<FeatureKey, boolean>>> = {
  free: {
    'agents.create': false,
    'data-analysis.orders-movement': true,
    'data-analysis.excel-analysis': true,
    'data-analysis.daily-orders': false,
    'orders.management': false,
    'calculator.use': true,
  },
  starter: {
    'agents.create': true,
    'data-analysis.orders-movement': true,
    'data-analysis.excel-analysis': true,
    'data-analysis.daily-orders': true,
    'orders.management': true,
    'calculator.use': true,
    'image-pro.full-access': true,
    'landing-pro.full-access': true,
    'video-pro.full-access': true,
  },
  pro: {
    'agents.create': true,
    'data-analysis.orders-movement': true,
    'data-analysis.excel-analysis': true,
    'data-analysis.daily-orders': true,
    'orders.management': true,
    'calculator.use': true,
    'image-pro.full-access': true,
    'landing-pro.full-access': true,
    'video-pro.full-access': true,
  },
  business: {
    'agents.create': true,
    'data-analysis.orders-movement': true,
    'data-analysis.excel-analysis': true,
    'data-analysis.daily-orders': true,
    'orders.management': true,
    'calculator.use': true,
    'image-pro.full-access': true,
    'landing-pro.full-access': true,
    'video-pro.full-access': true,
  },
  tester: {
    'agents.create': true,
    'data-analysis.orders-movement': true,
    'data-analysis.excel-analysis': true,
    'data-analysis.daily-orders': true,
    'orders.management': true,
    'calculator.use': true,
    'image-pro.full-access': true,
    'landing-pro.full-access': true,
    'video-pro.full-access': true,
  },
};

export function hasFeatureForPlan(plan: Plan, key: FeatureKey, overrides?: Partial<Record<FeatureKey, boolean>>): boolean {
  const base = DEFAULT_PLAN_FEATURES[plan] || {};
  if (overrides && key in overrides) return !!overrides[key];
  return !!base[key];
}
