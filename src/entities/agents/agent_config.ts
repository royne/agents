export const agentConfig = {
  general: {
    id: 'general',
    endpoint: 'api/agents/general',
    module: 'general_agent',
  },
  marketing: {
    id: 'marketing',
    endpoint: 'api/agents/marketing',
    module: 'marketing_agent',
  },
  research: {
    id: 'research',
    endpoint: 'api/agents/research',
    module: 'research_agent',
  },
} as const;