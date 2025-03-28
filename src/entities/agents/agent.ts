interface BasePayload {
  model: string,
  temperature: number,
  max_tokens: number
  stream: boolean,
  reasoning_format: string
};

const basePayload: BasePayload = {
  model: process.env.NEXT_PUBLIC_GROQ_MODEL || 'llama-3.3-70b-versatile',
  temperature: 0.6,
  max_tokens: 1024,
  stream: false,
  reasoning_format: "hidden"
};

export { basePayload }
