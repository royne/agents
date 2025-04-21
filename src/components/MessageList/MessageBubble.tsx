import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

interface MessageBubbleProps {
  text: string;
  isUser: boolean;
  timestamp: Date;
  image?: string;
  isSystemMessage?: boolean;
  isError?: boolean;
}

export default function MessageBubble({ 
  text, 
  isUser, 
  timestamp, 
  image, 
  isSystemMessage, 
  isError 
}: MessageBubbleProps) {
  // Determinar la clase y el estilo según el tipo de mensaje
  let bubbleClass = '';
  let bubbleStyle: React.CSSProperties = {};
  
  if (isSystemMessage) {
    // Estilo para mensajes del sistema
    bubbleClass = 'bg-yellow-500 bg-opacity-20 border border-yellow-500 text-theme-primary mx-auto system-message';
    if (isError) {
      bubbleClass = 'bg-red-500 bg-opacity-20 border border-red-500 text-theme-primary mx-auto system-message';
    }
  } else if (isUser) {
    // Estilo para mensajes del usuario
    bubbleClass = 'bg-primary-color ml-auto user-message';
    bubbleStyle = { backgroundColor: 'var(--primary-color)' };
  } else {
    // Estilo para mensajes del asistente
    bubbleClass = 'bg-assistant-bubble text-theme-primary assistant-message';
    bubbleStyle = { backgroundColor: 'var(--assistant-bubble)' };
  }

  return (
    <div 
      className={`max-w-xl p-4 rounded-xl shadow-lg message-card ${bubbleClass} transition-all duration-200`}
      style={bubbleStyle}
    >
      {/* Icono para mensajes del sistema */}
      {isSystemMessage && (
        <div className="flex items-center mb-2">
          {isError ? (
            <FaExclamationTriangle className="text-red-500 mr-2" />
          ) : (
            <FaInfoCircle className="text-yellow-500 mr-2" />
          )}
          <span className="font-medium">
            {isError ? 'Error' : 'Información del sistema'}
          </span>
        </div>
      )}
      
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
