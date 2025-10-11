import type { BasePayload } from '../../types/groq';

export const basePayload: BasePayload = {
  model: process.env.NEXT_PUBLIC_GROQ_MODEL || 'llama-3.3-70b-versatile',
  temperature: 0.7,
  max_tokens: 1024,
  stream: false
};
