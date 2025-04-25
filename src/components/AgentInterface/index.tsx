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
import { FaExchangeAlt } from 'react-icons/fa';

export default function AgentInterface() {
  const { apiKey, authData } = useAppContext();
  const [customAgents, setCustomAgents] = useState<Agent[]>([]);
  const [defaultAgents, setDefaultAgents] = useState<Agent[]>([]);
  const [showCustomAgents, setShowCustomAgents] = useState(false);
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
          // Cargar agentes personalizados de la base de datos
          const dbAgents = await agentDatabaseService.getAllAgents(authData.company_id);
          setCustomAgents(dbAgents || []);
          
          // Preparar agentes predeterminados
          const mappedDefaultAgents = NON_RAG_AGENTS.map(agent => ({
            ...agent,
            id: agent.id,
            name: agent.name,
            description: agent.description,
            model: agent.model,
            system_prompt: '',
            created_at: new Date(),
            updated_at: new Date()
          }));
          setDefaultAgents(mappedDefaultAgents);
        } catch (error) {
          console.error('Error al cargar agentes:', error);
          // En caso de error, al menos cargar los agentes predeterminados
          const mappedDefaultAgents = NON_RAG_AGENTS.map(agent => ({
            ...agent,
            id: agent.id,
            name: agent.name,
            description: agent.description,
            model: agent.model,
            system_prompt: '',
            created_at: new Date(),
            updated_at: new Date()
          }));
          setDefaultAgents(mappedDefaultAgents);
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

  // Determinar qué agentes mostrar según la selección
  const currentAgents = showCustomAgents ? 
    (customAgents.length > 0 ? customAgents : defaultAgents) : 
    defaultAgents;

  const toggleAgentType = () => {
    setShowCustomAgents(!showCustomAgents);
  };

  return (
    <div className="flex flex-col h-[90vh] bg-gray-800 rounded-xl shadow-xl">
      <div className="bg-gray-700 rounded-t-xl">
        <div className="flex justify-between items-center px-3 py-2 border-b border-gray-600">
          <div className="flex-1">
            <AgentSelector
              agents={currentAgents}
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
          <button 
            onClick={toggleAgentType}
            className="ml-2 flex items-center px-3 py-1 bg-primary-color text-white rounded text-sm hover:bg-blue-600 transition-colors"
            title={showCustomAgents ? "Mostrar agentes predeterminados" : "Mostrar agentes personalizados"}
          >
            <FaExchangeAlt className="mr-2" />
            {showCustomAgents ? "Ver Predeterminados" : "Ver Personalizados"}
          </button>
        </div>
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
