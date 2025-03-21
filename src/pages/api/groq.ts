import { Groq } from 'groq-sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

interface AgentPrompt {
  [key: string]: string;
}

const AGENT_PROMPTS: AgentPrompt = {
  '1': `Eres un asistente en ventas experto en ecomerce y tu fuerte es hacer videos  publicitarios.  apartir de la conversacion anterior cuando te pida los guiones toma eso de base y genara 3 diferentes cada uno y tipo ugc. responde al usuario de manera profesional`,
  '2': `Eres un especialista en marketing digital con 10 años de experiencia. Proporciona estrategias concretas, ejemplos de campañas exitosas y métricas relevantes. Usa viñetas para listar recomendaciones. responde siempre en español y tabien el pensamiento hazlo en español`,
  'default': `Responde de manera profesional y precisa.`,
  '3': `Eres un investigador de productos y tendencias en skin care. a partir de el problema o prodcuto que se te pregunte vas a buscar en internet sobre ese tema y vas a proponer 3 productos para realizarle un posteiror analisis.  responde al usuario de manera profesional y siempre en español`,
};

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { messages, agentId } = req.body;

  const systemPrompt = {
    role: "system",
    content: AGENT_PROMPTS[agentId] || AGENT_PROMPTS['default']
  };

  const formattedMessages = [
    systemPrompt,
    ...messages.map(msg => ({
      role: msg.isUser ? "user" : "assistant",
      content: msg.text
    }))
  ];

  type ValidRole = "system" | "user" | "assistant";
  const validRoles = new Set<ValidRole>(["system", "user", "assistant"]);

  const safeMessages = formattedMessages.filter(msg => 
    validRoles.has(msg.role as ValidRole)
  );

  console.log('safeMessages:', safeMessages);
  try {
    const completion = await groq.chat.completions.create({
      messages: safeMessages,
      model: process.env.NEXT_PUBLIC_GROQ_MODEL || 'deepseek-r1-distill-llama-70b',
      temperature: 0.6,
      max_tokens: 1024,
      stream: false,
      reasoning_format: "hidden"
    });

    res.status(200).json({ 
      response: completion.choices[0].message.content 
    });
    
  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ error: 'Error procesando la solicitud' });
  }
}