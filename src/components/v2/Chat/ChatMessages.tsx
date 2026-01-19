import React from 'react';
import { FaRobot, FaUser } from 'react-icons/fa';
import { Message } from './useChatOrchestrator';

interface ChatMessagesProps {
  messages: Message[];
  isThinking: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isThinking, scrollRef }) => {
  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar scroll-smooth">
      {messages.map((m, i) => (
        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
          <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${m.role === 'user'
            ? 'bg-primary-color text-black font-bold rounded-tr-none shadow-lg shadow-primary-color/10'
            : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none'
            }`}>
            {m.content}
          </div>
        </div>
      ))}
      {isThinking && (
        <div className="flex justify-start animate-in fade-in duration-300">
          <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-primary-color rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-primary-color rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-primary-color rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
            <span className="text-[10px] text-primary-color font-black uppercase tracking-widest">Pensando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
