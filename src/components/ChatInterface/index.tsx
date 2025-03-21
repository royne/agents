'use client';

import { useState } from 'react';
import { PaperAirplaneIcon, PhotoIcon } from '@heroicons/react/24/outline';
import MessageList from '../../components/MessageList/MessageList';
import InputArea from '../../components/ChatInterface/InputArea';
import AgentSelector from '../../components/AgentSelector';
import process from 'process';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  image?: string;
}

const AGENTS = [
  {
    id: 'general',
    name: 'Asistente General',
    description: 'Asistente para consultas generales',
    model: process.env.NEXT_PUBLIC_GROQ_MODEL || 'deepseek-r1-distill-llama-70b' 
  },
  {
    id: 'marketing',
    name: 'Experto en marketing digital',
    description: 'Especialista en marketing digital',
    model: process.env.NEXT_PUBLIC_GROQ_MODEL || 'deepseek-r1-distill-llama-70b' 
  },
  {
    id: 'research',
    name: 'Investigador de productos y tendencias',
    description: 'Especialista en marketing digital',
    model: process.env.NEXT_PUBLIC_GROQ_MODEL || 'deepseek-r1-distill-llama-70b' 
  }
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState('general');
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      image: selectedImage ? URL.createObjectURL(selectedImage) : undefined
    };

    // Immediately show user message
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/agents/${selectedAgentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({
            text: m.text,
            isUser: m.isUser
          })),
          agentId: selectedAgentId 
        })
      });

      const data = await response.json();

      const aiMessage: Message = {
        id: Date.now().toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date()
      };
      
      // Add AI message after response
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[90vh] bg-gray-800 rounded-xl shadow-xl">
      <AgentSelector 
        agents={AGENTS}
        onSelect={(agent) => {
          setSelectedAgentId(agent.id);
        }}
      />

      <MessageList messages={messages} />
      
      <form onSubmit={handleSubmit} className="p-4 bg-gray-700 rounded-b-xl border-t border-gray-600">
        <div className="flex gap-2">
          <label className="cursor-pointer text-gray-300 hover:text-blue-400 transition-colors">
            <PhotoIcon className="h-7 w-7" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && setSelectedImage(e.target.files[0])}
            />
          </label>
          <InputArea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="bg-gray-600 border-gray-500 text-white placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`p-3 ${
              isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
            } text-white rounded-lg transition-colors shadow-lg`}
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        {selectedImage && (
          <div className="mt-2 text-sm text-blue-300">
            {selectedImage.name}
          </div>
        )}
      </form>
    </div>
  )
}