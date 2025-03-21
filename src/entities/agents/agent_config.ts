export const agentConfig = {
  research: {
    id: 'research',
    endpoint: 'api/agents/research',
    module: 'research_agent',
  },
  script: {
    id: 'script',
    endpoint: 'api/agents/script',
    module: 'script_agent',
  },
  marketing: {
    id: 'marketing',
    endpoint: 'api/agents/marketing',
    module: 'marketing_agent',
  }
} as const;
