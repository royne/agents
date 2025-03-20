// src/components/MessageList/MessageList.tsx
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
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          text={message.text}
          isUser={message.isUser}
          timestamp={message.timestamp}
          image={message.image}
        />
      ))}
    </div>
  );
}