'use client';

import { useState } from 'react';
import { ExportFormat, chatExportService } from '../../services/export/chatExport';

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
  messages: any[];
  selectedAgentId: string;
}

export default function AgentSelector({ 
  agents,
  onSelect,
  onSaveChat,
  hasMessages,
  messages,
  selectedAgentId
}: AgentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0]);

  const handleExport = (format: ExportFormat) => {
    chatExportService.exportChat(messages, format, selectedAgentId);
    setShowExportMenu(false);
    setIsOpen(false);
  };

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
          <div className="border-t border-gray-600">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSaveChat();
                setIsOpen(false);
              }}
              disabled={!hasMessages}
              className={`w-full p-3 text-left ${
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
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExportMenu(!showExportMenu);
                }}
                disabled={!hasMessages}
                className={`w-full p-3 text-left ${
                  hasMessages 
                    ? 'text-blue-400 hover:bg-gray-700 cursor-pointer' 
                    : 'text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Exportar Chat
                </div>
              </button>
              {showExportMenu && hasMessages && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExport('json');
                    }}
                    className="w-full p-2 text-left text-blue-400 hover:bg-gray-700"
                  >
                    Exportar como JSON
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExport('txt');
                    }}
                    className="w-full p-2 text-left text-blue-400 hover:bg-gray-700"
                  >
                    Exportar como TXT
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExport('md');
                    }}
                    className="w-full p-2 text-left text-blue-400 hover:bg-gray-700"
                  >
                    Exportar como Markdown
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}