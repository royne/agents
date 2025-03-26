// src/components/MessageList/MessageList.tsx
import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  image?: string;
}

interface MessageListProps {
  messages: Array<Message>;
}

const MessageItem = ({ message, isLast, lastMessageRef }: { 
  message: Message; 
  isLast: boolean;
  lastMessageRef: React.RefObject<HTMLDivElement | null>;
}) => (
  <div ref={isLast ? lastMessageRef : undefined}>
    <MessageBubble
      text={message.text}
      isUser={message.isUser}
      timestamp={message.timestamp}
      image={message.image}
    />
  </div>
);

const MessageContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
    {children}
  </div>
);

export default function MessageList({ messages }: MessageListProps) {
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messages.length > 0) {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [messages]);

  return (
    <MessageContainer>
      {messages.map((message, index) => (
        <MessageItem
          key={message.id}
          message={message}
          isLast={index === messages.length - 1}
          lastMessageRef={lastMessageRef}
        />
      ))}
    </MessageContainer>
  );
}