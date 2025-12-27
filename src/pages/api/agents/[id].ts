import { agentConfig } from '../../../entities/agents/agent_config';
import { extractMessages } from '../../../services/messages/extractor';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { Groq } from 'groq-sdk';
import { agentsData } from './agents-data';
import type { Message } from '../../../types/groq';
import { enrichWithRAG } from '../../../entities/agents/script_agent';
import { agentDatabaseService } from '../../../services/database/agentService';
import { basePayload } from '../../../entities/agents/agent';
import { CreditService } from '../../../lib/creditService';
import { supabase } from '../../../lib/supabase';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  
  // Crear cliente de Supabase para el servidor para obtener la sesión
  const supabaseServer = createPagesServerClient({ req, res });
  const { data: { session } } = await supabaseServer.auth.getSession();
  
  // Usar llaves desde variables de entorno
  let apiKey = process.env.GROQ_API_KEY;
  let openAIApiKey = process.env.OPENAI_API_KEY;
  
  // Si hay sesión, intentar recuperar la configuración del perfil, pero NO las llaves (ahora usamos .env)
  if (session) {
    try {
      const { data: profile } = await supabaseServer
        .from('profiles')
        .select('role, company_id') // Ya no seleccionamos groq_api_key ni openai_api_key
        .eq('user_id', session.user.id)
        .single();
        
      if (profile) {
        // Si no viene company_id en el body, usar el del perfil
        if (!req.body.company_id) req.body.company_id = profile.company_id;

        const role = profile.role?.toLowerCase();
        const isSuperAdmin = role === 'owner' || role === 'superadmin' || role === 'super_admin';

        // Validar créditos ANTES de la consulta
        const { can, balance } = await CreditService.canPerformAction(session.user.id, 'CHAT_RAG', supabase);
        
        if (!can && !isSuperAdmin) {
          return res.status(402).json({ 
            error: 'Créditos insuficientes.', 
            balance,
            required: 1
          });
        }
      }
    } catch (profileErr) {
      console.error('[api/agents] Error recuperando perfil:', profileErr);
    }
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Configuración de servidor incompleta: Falta Groq API Key' });
  }

  const { company_id } = req.body;

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
    
    // Consumir créditos después del éxito (en segundo plano para no demorar la respuesta)
    if (session) {
      CreditService.consumeCredits(session.user.id, 'CHAT_RAG', { agentId: id }, supabase).catch(console.error);
    }
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
