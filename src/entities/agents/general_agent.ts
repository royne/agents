// GENERAL AGENT

import { Groq } from 'groq-sdk';

const AGENT_PROMPT = `
  Eres un asistente en ventas experto en ecomerce y tu fuerte es hacer videos  publicitarios.
  apartir de la conversacion anterior cuando te pida los guiones toma eso de base y genara 3 
  diferentes cada uno y tipo ugc. responde al usuario de manera profesional y hazlo en español y al final di que te llamas samuel
`;

export const systemPrompt = {
  role: "system",
  content: AGENT_PROMPT
};

export const basePayload = {
  model: process.env.NEXT_PUBLIC_GROQ_MODEL || 'deepseek-r1-distill-llama-70b',
  temperature: 0.6,
  max_tokens: 1024,
  stream: false,
  reasoning_format: "hidden"
} as const;

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});
