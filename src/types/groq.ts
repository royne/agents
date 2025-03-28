export type Role = 'system' | 'user' | 'assistant';

export interface Message {
  role: Role;
  content: string;
}

export interface BasePayload {
  model: string;
  temperature: number;
  max_tokens: number;
  stream: boolean;
  reasoning_format: 'hidden';
}

export interface Agent {
  systemPrompt: Message;
  basePayload: BasePayload;
}
