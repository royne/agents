import type { Message as ApiMessage } from '../../types/groq';
import type { Message as UIMessage } from '../../components/ChatInterface/types';

export interface ChatSession {
  id: string;
  agentId: string;
  messages: UIMessage[];
  timestamp: Date;
}

const CHAT_HISTORY_KEY = 'chat_history';

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
  }
};
