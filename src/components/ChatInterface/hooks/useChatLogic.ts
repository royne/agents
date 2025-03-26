import { useState } from 'react';
import { Message } from '../types';

export const useChatLogic = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState('research');
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText && !selectedImage || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      image: selectedImage ? URL.createObjectURL(selectedImage) : undefined
    };

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

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    selectedAgentId,
    inputText,
    selectedImage,
    isLoading,
    setSelectedAgentId,
    setInputText,
    setSelectedImage,
    handleSubmit
  };
};
