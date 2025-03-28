'use client';

import { useState } from 'react';

interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
}

interface AgentSelectorProps {
  agents: Agent[];
  onSelect: (agent: Agent) => void;
  onSaveChat: () => void;
  hasMessages: boolean;
}

export default function AgentSelector({ 
  agents,
  onSelect,
  onSaveChat,
  hasMessages
}: AgentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-3 bg-gray-700 rounded-t-lg hover:bg-gray-600 transition-colors"
      >
        <span>{selectedAgent.name}</span>
        <svg className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="p-3 absolute w-full bg-gray-800 rounded-b-lg shadow-lg z-10">
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => {
                setSelectedAgent(agent);
                onSelect(agent);
                setIsOpen(false);
              }}
              className="hover:bg-gray-700 cursor-pointer border-t border-gray-600"
            >
              <h3 className="font-medium">{agent.name}</h3>
              <p className="text-sm text-gray-400">{agent.description}</p>
              <span className="text-xs text-blue-400">{agent.model}</span>
            </div>
          ))}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSaveChat();
              setIsOpen(false);
            }}
            disabled={!hasMessages}
            className={`w-full p-3 text-left border-t border-gray-600 ${
              hasMessages 
                ? 'text-blue-400 hover:bg-gray-700 cursor-pointer' 
                : 'text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Guardar Chat
            </div>
          </button>
        </div>
      )}
    </div>
  );
}