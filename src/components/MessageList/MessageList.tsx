// src/components/MessageList/MessageList.tsx
import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Array<{
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    image?: string;
  }>;
}

export default function MessageList({ messages }: MessageListProps) {
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div 
          key={message.id} 
          ref={index === messages.length - 1 ? lastMessageRef : undefined}
        >
          <MessageBubble
            text={message.text}
            isUser={message.isUser}
            timestamp={message.timestamp}
            image={message.image}
          />
        </div>
      ))}
    </div>
  );
}