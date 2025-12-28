export const CREDIT_COSTS = {
  IMAGE_GEN: 10,
  CHAT_RAG: 1,
  EXCEL_ANALYSIS: 0,
  CALCULATOR: 0,
  VIDEO_GEN: 20,
};

export const PLAN_LIMITS = {
  free: 50,
  starter: 500,
  pro: 1200,
  business: 3000,
  tester: 999999,
};

export type CreditAction = keyof typeof CREDIT_COSTS;
