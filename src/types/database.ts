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

export type Product = {
  id: string;
  name: string;
  description: string;
  provider_price: number;
  created_at: Date;
  updated_at?: Date;
};

export interface Campaign {
  id: string;
  name: string;
  launch_date: Date;
  product_id: string;
  cp: string;
  status: boolean;
  created_at: Date;
  updated_at?: Date;
};

export interface Advertisement {
  id: string;
  name: string;
  campaign_id: string;
  status: boolean;
  created_at: Date;
  updated_at?: Date;
};

export interface Sale {
  id: string;
  advertisement_id: string;
  amount: number;
  order_dropi: string;
  date: Date;
  created_at: Date;
  updated_at?: Date;
};

export interface DailyExpenses {
  id: string;
  advertisement_id: string;
  amount: number;
  date: Date;
  created_at: Date;
  updated_at?: Date;
};

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
      products: {
        Row: Product;
        Insert: Omit<Product, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;
      };
      campaigns: {
        Row: Campaign;
        Insert: Omit<Campaign, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Campaign, 'id' | 'created_at' | 'updated_at'>>;
      };
      advertisements: {
        Row: Advertisement;
        Insert: Omit<Advertisement, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Advertisement, 'id' | 'created_at' | 'updated_at'>>;
      };
      sales: {
        Row: Sale;
        Insert: Omit<Sale, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Sale, 'id' | 'created_at' | 'updated_at'>>;
      };
      daily_expenses: {
        Row: DailyExpenses;
        Insert: Omit<DailyExpenses, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DailyExpenses, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
