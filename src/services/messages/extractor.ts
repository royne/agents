import type { Message, Role } from '../../types/groq';
import { chatHistoryService } from '../storage/chatHistory';

interface RawMessage {
  role: string;
  content: string;
}

export function extractMessages(messages: RawMessage[], systemPrompt: Message): Message[] {
  const safeMessages: Message[] = [systemPrompt];

  for (const message of messages) {
    if (isValidRole(message.role)) {
      safeMessages.push({
        role: message.role as Role,
        content: message.content
      });
    }
  }

  // Aplicar reducción de contexto si es necesario
  return chatHistoryService.reduceContextIfNeeded(safeMessages, systemPrompt);
}

function isValidRole(role: string): role is Role {
  return ['system', 'user', 'assistant'].includes(role);
}
