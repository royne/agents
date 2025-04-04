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
    <div className={`max-w-xl p-4 rounded-xl ${
      isUser 
        ? 'bg-blue-600 text-white ml-auto shadow-lg' 
        : 'bg-gray-700 text-gray-100 shadow'
    } transition-all duration-200`}>
      {image && <img src={image} alt="Message attachment" className="mb-3 rounded-xl border-2 border-gray-500"/>}
      <div className="prose prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {text}
        </ReactMarkdown>
      </div>
      <time className="text-xs text-gray-300 mt-2 block">
        {timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
      </time>
    </div> 
  );
}
