'use client';

import { useState, useEffect } from 'react';
import MessageList from '../MessageList/MessageList';
import AgentSelector from '../AgentSelector';
import { ChatForm } from '../ChatInterface/ChatForm';
import { NON_RAG_AGENTS } from './constants';
import { useChatLogic } from '../ChatInterface/hooks/useChatLogic';
import { chatHistoryService } from '../../services/storage/chatHistory';
import { useAppContext } from '../../contexts/AppContext';
import { agentDatabaseService } from '../../services/database/agentService';
import type { Agent } from '../../types/database';

export default function AgentInterface() {
  const { apiKey, authData } = useAppContext();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  
  const {
    messages,
    selectedAgentId,
    inputText,
    selectedImage,
    isLoading,
    setSelectedAgentId,
    setInputText,
    setSelectedImage,
    handleSubmit
  } = useChatLogic(apiKey || '');
  
  useEffect(() => {
    const fetchAgents = async () => {
      if (authData?.company_id) {
        setIsLoadingAgents(true);
        try {
          const dbAgents = await agentDatabaseService.getAllAgents(authData.company_id);
          if (dbAgents && dbAgents.length > 0) {
            setAgents(dbAgents);
          } else {
            // Si no hay agentes en la base de datos, usar los predefinidos
            setAgents(NON_RAG_AGENTS.map(agent => ({
              ...agent,
              id: agent.id,
              name: agent.name,
              description: agent.description,
              model: agent.model,
              system_prompt: '',
              created_at: new Date(),
              updated_at: new Date()
            })));
          }
        } catch (error) {
          console.error('Error al cargar agentes:', error);
          // En caso de error, usar los agentes predefinidos
          setAgents(NON_RAG_AGENTS.map(agent => ({
            ...agent,
            id: agent.id,
            name: agent.name,
            description: agent.description,
            model: agent.model,
            system_prompt: '',
            created_at: new Date(),
            updated_at: new Date()
          })));
        } finally {
          setIsLoadingAgents(false);
        }
      }
    };
    
    fetchAgents();
  }, [authData?.company_id]);

  const handleSaveChat = () => {
    if (messages.length > 0) {
      chatHistoryService.saveChatSession(selectedAgentId, messages);
      alert('Chat guardado exitosamente');
    }
  };

  return (
    <div className="flex flex-col h-[90vh] bg-gray-800 rounded-xl shadow-xl">
      <div className="bg-gray-700 rounded-t-xl">
        <AgentSelector
          agents={agents}
          onSelect={(agent) => {
            setSelectedAgentId(agent.id);
          }}
          onSaveChat={handleSaveChat}
          hasMessages={messages.length > 0}
          messages={messages}
          selectedAgentId={selectedAgentId}
          isLoading={isLoadingAgents}
        />
      </div>

      <MessageList messages={messages} />

      <ChatForm
        inputText={inputText}
        isLoading={isLoading}
        selectedImage={selectedImage}
        onInputChange={setInputText}
        onImageSelect={setSelectedImage}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
