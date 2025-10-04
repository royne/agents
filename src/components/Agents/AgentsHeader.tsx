import React from 'react';
import { FaPlus, FaList, FaComments } from 'react-icons/fa';

interface AgentsHeaderProps {
  showChat: boolean;
  onToggleView: () => void;
  onCreateAgent: () => void;
  canCreate?: boolean;
}

const AgentsHeader: React.FC<AgentsHeaderProps> = ({ 
  showChat, 
  onToggleView, 
  onCreateAgent,
  canCreate = true,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
      <div className="bg-green-100 border-l-4 border-green-500 text-green-700 py-2 px-3 rounded text-sm dark:bg-green-900 dark:border-green-600 dark:text-green-200 flex-grow">
        <span className="font-bold">Asistentes de Marketing:</span> Especialistas para tus tareas de marketing
      </div>
      <div className="flex space-x-2">
        <button
          onClick={onToggleView}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {showChat ? (
            <>
              <FaList className="mr-2" /> Ver Agentes
            </>
          ) : (
            <>
              <FaComments className="mr-2" /> Ver Chat
            </>
          )}
        </button>
        {!showChat && (
          <button
            onClick={onCreateAgent}
            className={`flex items-center px-4 py-2 rounded transition-colors ${canCreate ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-500 text-white opacity-70 cursor-not-allowed'}`}
            disabled={!canCreate}
            title={canCreate ? 'Crear Agente' : 'Disponible en planes Premium'}
          >
            <FaPlus className="mr-2" /> Crear Agente
          </button>
        )}
      </div>
    </div>
  );
};

export default AgentsHeader;
