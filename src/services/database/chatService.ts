import { supabase } from '../../lib/supabase';
import type { Message } from '../../components/ChatInterface/types';
import type { ChatSession, ChatMessage } from '../../types/database';

export const chatDatabaseService = {
  async createSession(userId: string, agentId: string, title: string): Promise<ChatSession | null> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        agent_id: agentId,
        title
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat session:', error);
      return null;
    }

    return data;
  },

  async saveMessages(sessionId: string, messages: Message[]): Promise<boolean> {
    const chatMessages = messages.map(msg => ({
      session_id: sessionId,
      content: msg.text,
      role: msg.isUser ? 'user' : 'assistant'
    }));

    const { error } = await supabase
      .from('chat_messages')
      .insert(chatMessages);

    if (error) {
      console.error('Error saving chat messages:', error);
      return false;
    }

    return true;
  },

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error getting chat messages:', error);
      return [];
    }

    return data || [];
  },

  async getUserSessions(userId: string): Promise<ChatSession[]> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }

    return data || [];
  },

  async deleteSession(sessionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting chat session:', error);
      return false;
    }

    return true;
  }
};
