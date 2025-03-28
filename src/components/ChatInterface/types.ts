export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  image?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
}

export interface ChatInterfaceProps {
  apiKey: string;
}
