import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
  text: string;
  isUser: boolean;
  timestamp: Date;
  image?: string;
}

export default function MessageBubble({ text, isUser, timestamp, image }: MessageBubbleProps) {
  return (
    <div 
      className={`max-w-xl p-4 rounded-xl shadow-lg message-card ${
        isUser 
          ? 'bg-primary-color ml-auto user-message' 
          : 'bg-assistant-bubble text-theme-primary assistant-message'
      } transition-all duration-200`}
      style={{
        backgroundColor: isUser ? 'var(--primary-color)' : 'var(--assistant-bubble)'
      }}
    >
      {image && <img src={image} alt="Message attachment" className="mb-3 rounded-xl border-2 border-theme-color"/>}
      <div className={`prose ${!isUser ? 'prose-dark' : 'prose-user'}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {text}
        </ReactMarkdown>
      </div>
      <time className="text-xs text-theme-tertiary mt-2 block">
        {timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
      </time>
    </div> 
  );
}
