'use client';

import { useState } from 'react';

interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
}

export default function AgentSelector({ 
  agents,
  onSelect
}: {
  agents: Agent[];
  onSelect: (agent: Agent) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0]);

  return (
    <div className="relative mb-4">
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
        <div className="absolute w-full bg-gray-800 rounded-b-lg shadow-lg z-10">
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => {
                setSelectedAgent(agent);
                onSelect(agent);
                setIsOpen(false);
              }}
              className="p-3 hover:bg-gray-700 cursor-pointer border-t border-gray-600"
            >
              <h3 className="font-medium">{agent.name}</h3>
              <p className="text-sm text-gray-400">{agent.description}</p>
              <span className="text-xs text-blue-400">{agent.model}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}