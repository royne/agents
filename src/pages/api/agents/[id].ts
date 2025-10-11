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
  const openaiKeyHeader = req.headers['x-openai-key'];
  const openAIApiKey = typeof openaiKeyHeader === 'string' ? openaiKeyHeader : Array.isArray(openaiKeyHeader) ? openaiKeyHeader[0] : undefined;
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
          model: customAgent.model || process.env.NEXT_PUBLIC_GROQ_MODEL || 'llama-3.3-70b-versatile',
          temperature: 0.5,
          max_tokens: 1024,
          stream: false
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
      console.log('[api/agents/script] enrichWithRAG', { hasOpenAIKey: !!openAIApiKey });
      const enrichedMessages = await enrichWithRAG(safeMessages, openAIApiKey);
      safeMessages = enrichedMessages;
    } catch (error) {
      console.error('Error al enriquecer con RAG:', error);
      // Continuar con los mensajes originales si hay un error
    }
  }

  const payload = {
    ...agent.basePayload,
    messages: safeMessages,
    stream: false as const
  };

  try {
    console.log(`[api/agents/${id}] solicitando a Groq`, {
      model: (payload as any).model,
      messages: payload.messages?.length || 0,
      hasApiKey: !!apiKey,
      company_id
    });

    let completion = await groq.chat.completions.create(payload);

    // Si no hay contenido, intentar fallback de modelo
    let content = completion?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      console.warn(`[api/agents/${id}] Respuesta vacía, intentando fallback de modelo`);
      const fallbackModel = process.env.NEXT_PUBLIC_GROQ_FALLBACK_MODEL || 'llama-3.3-70b-versatile';
      const fallbackPayload = { ...payload, model: fallbackModel } as any;
      console.log(`[api/agents/${id}] Fallback model: ${fallbackModel}`);
      completion = await groq.chat.completions.create(fallbackPayload);
      content = completion?.choices?.[0]?.message?.content || content;
    }

    res.status(200).json({ response: content });
  } catch (error: any) {
    const errMsg = (error?.message || 'Unknown error').toString();
    console.error(`[api/agents/${id}] Groq API Error:`, errMsg);

    // Intento de fallback si parece error de modelo no soportado
    try {
      if (/model|unsupported|not found|Invalid model/i.test(errMsg)) {
        const fallbackModel = process.env.NEXT_PUBLIC_GROQ_FALLBACK_MODEL || 'llama-3.3-70b-versatile';
        const fallbackPayload = { ...payload, model: fallbackModel } as any;
        console.log(`[api/agents/${id}] Reintentando con fallback model: ${fallbackModel}`);
        const completion = await groq.chat.completions.create(fallbackPayload);
        const content = completion?.choices?.[0]?.message?.content || '';
        return res.status(200).json({ response: content });
      }
    } catch (fallbackErr: any) {
      console.error(`[api/agents/${id}] Fallback error:`, fallbackErr?.message || fallbackErr);
    }

    res.status(500).json({ error: 'Error procesando la solicitud', detail: errMsg });
  }
};
