export interface User {
  id: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface ChatSession {
  id: string;
  user_id: string;
  agent_id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: Date;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  system_prompt: string;
  created_at: Date;
  updated_at: Date;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      chat_sessions: {
        Row: ChatSession;
        Insert: Omit<ChatSession, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ChatSession, 'id' | 'created_at' | 'updated_at'>>;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Omit<ChatMessage, 'created_at'>;
        Update: Partial<Omit<ChatMessage, 'id' | 'created_at'>>;
      };
      agents: {
        Row: Agent;
        Insert: Omit<Agent, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Agent, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
