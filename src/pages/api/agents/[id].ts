import { agentConfig } from '../../../entities/agents/agent_config';
import { extractMessages } from '../../../services/messages/extractor';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Groq } from 'groq-sdk';

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

  const { module } = agentInfo;
  let agent;

  try {
    agent = await import(`../../../entities/agents/${module}`);
  } catch (error) {
    console.error('Error loading agent module:', error);
    return res.status(500).json({ error: 'Error loading agent module' });
  }

  const groq = new Groq({ apiKey });
  const { messages } = req.body;
  const safeMessages = extractMessages(messages, agent.systemPrompt);

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
