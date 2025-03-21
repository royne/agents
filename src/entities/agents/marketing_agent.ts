// MARKETING AGENT

import { Groq } from 'groq-sdk';

const AGENT_PROMPT = `
  Eres un experto en marketing digital especializado en estrategias de redes sociales y publicidad.
  Tu objetivo es ayudar a crear estrategias efectivas de marketing, analizar tendencias y proponer
  soluciones innovadoras para aumentar la visibilidad y engagement. Responde siempre en español
  y firma tus mensajes como "Ana, tu estratega de marketing digital".
`;

export const systemPrompt = {
  role: "system",
  content: AGENT_PROMPT
};

export const basePayload = {
  model: process.env.NEXT_PUBLIC_GROQ_MODEL || 'deepseek-r1-distill-llama-70b',
  temperature: 0.7,
  max_tokens: 1024,
  stream: false,
  reasoning_format: "hidden"
} as const;

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});
