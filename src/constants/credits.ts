export const CREDIT_COSTS = {
  IMAGE_GEN: 10,
  CHAT_RAG: 1,
  EXCEL_ANALYSIS: 2,
  CALCULATOR: 0,
};

export const PLAN_LIMITS = {
  free: 20,
  starter: 500,
  pro: 1200,
  business: 3000,
  tester: 999999,
};

export type CreditAction = keyof typeof CREDIT_COSTS;
