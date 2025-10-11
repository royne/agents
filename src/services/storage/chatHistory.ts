import type { Message as ApiMessage } from '../../types/groq';
import type { Message as UIMessage } from '../../components/ChatInterface/types';

export interface ChatSession {
  id: string;
  agentId: string;
  messages: UIMessage[];
  timestamp: Date;
}

const CHAT_HISTORY_KEY = 'chat_history';
// Límite aproximado de tokens para Groq (ajustar según el modelo específico)
const MAX_CONTEXT_TOKENS = 8000;
// Tokens a mantener cuando se reduce el contexto (aproximadamente 75% del máximo)
const REDUCED_CONTEXT_TOKENS = 6000;

export const chatHistoryService = {
  saveChatSession(agentId: string, messages: UIMessage[]): void {
    try {
      const existingSessions = this.getChatSessions();
      const newSession: ChatSession = {
        id: Date.now().toString(),
        agentId,
        messages,
        timestamp: new Date()
      };
      
      existingSessions.push(newSession);
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(existingSessions));
    } catch (error) {
      console.error('Error saving chat session:', error);
    }
  },

  getChatSessions(): ChatSession[] {
    try {
      const sessions = localStorage.getItem(CHAT_HISTORY_KEY);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      return [];
    }
  },

  deleteChatSession(sessionId: string): void {
    try {
      const sessions = this.getChatSessions();
      const updatedSessions = sessions.filter(session => session.id !== sessionId);
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Error deleting chat session:', error);
    }
  },

  convertToApiMessages(messages: UIMessage[]): ApiMessage[] {
    return messages.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text
    }));
  },

  convertToUIMessages(messages: ApiMessage[]): UIMessage[] {
    return messages.map(msg => ({
      id: Date.now().toString(),
      text: msg.content,
      isUser: msg.role === 'user',
      timestamp: new Date()
    }));
  },

  /**
   * Estima el número de tokens en un texto
   * Esta es una estimación aproximada basada en que un token es aproximadamente 4 caracteres en inglés
   * Para español, usamos un factor un poco menor (3.5 caracteres por token)
   */
  estimateTokens(text: string | undefined | null): number {
    if (typeof text !== 'string') {
      // Para depuración: si llega undefined/null, considerar 0 tokens y registrar
      // console.debug('[chatHistory] estimateTokens: texto no definido, asumiendo 0 tokens');
      return 0;
    }
    return Math.ceil(text.length / 3.5);
  },

  /**
   * Estima el número total de tokens en un conjunto de mensajes
   */
  estimateMessagesTokens(messages: ApiMessage[]): number {
    // Cada mensaje tiene un overhead aproximado de 4 tokens por la metadata (role, etc)
    const overheadPerMessage = 4;
    const total = messages.reduce((sum, message) => {
      const content = typeof message.content === 'string' ? message.content : '';
      return sum + this.estimateTokens(content) + overheadPerMessage;
    }, 0);
    // console.debug(`[chatHistory] estimateMessagesTokens: mensajes=${messages.length}, tokens=${total}`);
    return total;
  },

  /**
   * Reduce el contexto de los mensajes si es necesario para evitar exceder el límite de tokens
   * Mantiene el mensaje del sistema y elimina los mensajes más antiguos
   */
  reduceContextIfNeeded(messages: ApiMessage[], systemPrompt: ApiMessage): ApiMessage[] {
    // Siempre mantener el mensaje del sistema
    if (messages.length <= 1) return messages;

    const estimatedTokens = this.estimateMessagesTokens(messages);
    
    // Si estamos por debajo del límite, no hacemos nada
    if (estimatedTokens <= MAX_CONTEXT_TOKENS) {
      return messages;
    }

    console.log(`Reduciendo contexto. Tokens estimados: ${estimatedTokens}, límite: ${MAX_CONTEXT_TOKENS}`);
    
    // Comenzamos con el mensaje del sistema
    const reducedMessages: ApiMessage[] = [systemPrompt];
    let currentTokens = this.estimateTokens(systemPrompt.content) + 4; // 4 por el overhead
    
    // Añadimos mensajes desde el más reciente hasta que nos acercamos al límite reducido
    const userAssistantMessages = messages.slice(1); // Excluimos el mensaje del sistema
    
    for (let i = userAssistantMessages.length - 1; i >= 0; i--) {
      const msg = userAssistantMessages[i];
      const msgTokens = this.estimateTokens(msg.content) + 4;
      
      if (currentTokens + msgTokens <= REDUCED_CONTEXT_TOKENS) {
        reducedMessages.unshift(msg);
        currentTokens += msgTokens;
      } else {
        // Si el siguiente mensaje excede el límite, paramos
        break;
      }
    }

    console.log(`Contexto reducido. Mensajes originales: ${messages.length}, mensajes reducidos: ${reducedMessages.length}`);
    
    return reducedMessages;
  }
};
