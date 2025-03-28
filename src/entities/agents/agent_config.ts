interface AgentConfig {
  id: string;
  endpoint: string;
  module: string;
}

interface AgentConfigs {
  [key: string]: AgentConfig;
}

export const agentConfig: AgentConfigs = {
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
};
