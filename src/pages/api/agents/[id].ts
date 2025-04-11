import { agentConfig } from '../../../entities/agents/agent_config';
import { extractMessages } from '../../../services/messages/extractor';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Groq } from 'groq-sdk';
import { agentsData } from './agents-data';
import type { Message } from '../../../types/groq';
import { enrichWithRAG } from '../../../entities/agents/script_agent';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(401).json({ error: 'API Key is required' });
  }

  const agentInfo = agentConfig[id as keyof typeof agentConfig];

  if (!agentInfo) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  const agent = agentsData[id as keyof typeof agentsData];
  if (!agent) {
    return res.status(500).json({ error: 'Agent data not found' });
  }

  const groq = new Groq({ apiKey });
  const { messages } = req.body;
  let safeMessages = extractMessages(messages, agent.systemPrompt) as Message[];

  // Enriquecer con RAG si es el agente de scripts
  if (id === 'script') {
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
