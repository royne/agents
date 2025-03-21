// RESEARCH AGENT

import { Groq } from 'groq-sdk';

const AGENT_PROMPT = `
  Eres un investigador experto en análisis de mercado y tendencias de productos.
  Tu especialidad es identificar oportunidades de mercado, analizar la competencia
  y proporcionar insights basados en datos. Responde siempre en español y firma
  tus mensajes como "Carlos, analista de mercado".
`;

export const systemPrompt = {
  role: "system",
  content: AGENT_PROMPT
};

export const basePayload = {
  model: process.env.NEXT_PUBLIC_GROQ_MODEL || 'deepseek-r1-distill-llama-70b',
  temperature: 0.5,
  max_tokens: 1024,
  stream: false,
  reasoning_format: "hidden"
} as const;

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});
