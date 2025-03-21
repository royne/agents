import { Groq } from 'groq-sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

interface AgentPrompt {
  [key: string]: string;
}

const AGENT_PROMPTS: AgentPrompt = {
  '1': `Eres un asistente general experto en el nicho de belleza y skincare. tu mision es encontrar los problemas mas comhunes de las personas y con la informacion que te suministren de algun producto vas a analizarlo y a generarme angulos de venta ganadores para vender por internet`,
  '2': `Eres un especialista en marketing digital con 10 años de experiencia. Proporciona estrategias concretas, ejemplos de campañas exitosas y métricas relevantes. Usa viñetas para listar recomendaciones.`,
  'default': `Responde de manera profesional y precisa.`
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

  const formattedMessages = messages.map(msg => ({
    role: msg.isUser ? "user" : "assistant",
    content: msg.text
  }));


  console.log('System Prompt:', systemPrompt);
  console.log('Messages:', messages);
  console.log('Agent ID:', agentId);
  try {
    const completion = await groq.chat.completions.create({
      messages: [systemPrompt, ...formattedMessages],
      model: process.env.NEXT_PUBLIC_GROQ_MODEL || 'deepseek-r1-distill-llama-70b',
      temperature: 0.7,
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