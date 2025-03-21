import { Groq } from 'groq-sdk';

interface BasePayload {
  model: string,
  temperature: number,
  max_tokens: number
  stream: boolean,
  reasoning_format: string
};

const basePayload: BasePayload = {
  model: process.env.NEXT_PUBLIC_GROQ_MODEL || 'deepseek-r1-distill-llama-70b',
  temperature: 0.6,
  max_tokens: 1024,
  stream: false,
  reasoning_format: "hidden"
};

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export { groq, basePayload }
