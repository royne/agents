'use client';

import { useState } from 'react';
import { PaperAirplaneIcon, PhotoIcon } from '@heroicons/react/24/outline';
import MessageList from '../../components/MessageList/MessageList';
import InputArea from '../../components/ChatInterface/InputArea';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  image?: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText && !selectedImage) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      image: selectedImage ? URL.createObjectURL(selectedImage) : undefined
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setSelectedImage(null);
  };
  return (
    <div className="flex flex-col h-[90vh] bg-gray-800 rounded-xl shadow-xl">
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
            className="p-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-lg"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
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