import { agentConfig } from '../../../entities/agents/agent_config';
import { extractMessages } from '../../../services/messages/extractor';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Groq } from 'groq-sdk';
import { agentsData } from './agents-data';
import type { Message } from '../../../types/groq';
import { enrichWithRAG } from '../../../entities/agents/script_agent';
import { agentDatabaseService } from '../../../services/database/agentService';
import { basePayload } from '../../../entities/agents/agent';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const apiKey = req.headers['x-api-key'];
  const { company_id } = req.body;

  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(401).json({ error: 'API Key is required' });
  }

  // Verificar si es un agente predefinido o personalizado
  const isDefaultAgent = Object.keys(agentConfig).includes(id as string);
  let agent;

  if (isDefaultAgent) {
    // Es un agente predefinido
    const agentInfo = agentConfig[id as keyof typeof agentConfig];
    if (!agentInfo) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    agent = agentsData[id as keyof typeof agentsData];
    if (!agent) {
      return res.status(500).json({ error: 'Agent data not found' });
    }
  } else {
    // Es un agente personalizado
    try {
      const customAgent = await agentDatabaseService.getAgent(id as string);
      if (!customAgent) {
        return res.status(404).json({ error: 'Custom agent not found' });
      }

      // Crear un objeto de agente compatible con la estructura esperada
      agent = {
        systemPrompt: {
          role: "system" as const,
          content: customAgent.system_prompt || ''
        },
        basePayload: {
          ...basePayload,
          model: customAgent.model || 'deepseek-r1-distill-llama-70b',
          temperature: 0.5,
          max_tokens: 1024,
          stream: false,
          reasoning_format: "hidden"
        }
      };
    } catch (error) {
      console.error('Error al obtener agente personalizado:', error);
      return res.status(500).json({ error: 'Error al obtener agente personalizado' });
    }
  }

  const groq = new Groq({ apiKey });
  const { messages } = req.body;
  let safeMessages = extractMessages(messages, agent.systemPrompt) as Message[];

  // Enriquecer con RAG solo si es el agente de scripts predefinido
  if (id === 'script' && isDefaultAgent) {
    try {
      const enrichedMessages = await enrichWithRAG(safeMessages);
      safeMessages = enrichedMessages;
    } catch (error) {
      console.error('Error al enriquecer con RAG:', error);
      // Continuar con los mensajes originales si hay un error
    }
  }


  const payload = {
    ...agent.basePayload,
    messages: safeMessages,
    stream: false as const,
    reasoning_format: "hidden" as const
  };

  try {
    const completion = await groq.chat.completions.create(payload);
    res.status(200).json({
      response: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ error: 'Error procesando la solicitud' });
  }
};
