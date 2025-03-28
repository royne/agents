import { scriptAgent } from '../../../entities/agents/script_agent';
import { marketingAgent } from '../../../entities/agents/marketing_agent';
import { researchAgent } from '../../../entities/agents/research_agent';
import type { Agent } from '../../../types/groq';

interface AgentsData {
  [key: string]: Agent;
}

export const agentsData: AgentsData = {
  script: scriptAgent,
  marketing: marketingAgent,
  research: researchAgent
};
