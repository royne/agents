import { FaEdit, FaTrash, FaRobot } from 'react-icons/fa';
import type { Agent } from '../../types/database';

interface AgentsListProps {
  agents: Agent[];
  loading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const AgentsList: React.FC<AgentsListProps> = ({ agents, loading, onEdit, onDelete }) => {

  return (
    <div className="bg-theme-component rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-theme-color">
        <h2 className="text-lg font-medium text-theme-primary">Agentes Disponibles</h2>
        <p className="text-theme-secondary text-sm">Administra tus agentes personalizados</p>
      </div>
      
      {loading ? (
        <div className="p-8 text-center text-theme-secondary">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full mb-2"></div>
          <p>Cargando agentes...</p>
        </div>
      ) : agents.length === 0 ? (
        <div className="p-8 text-center text-theme-secondary">
          <FaRobot className="mx-auto text-4xl mb-2 text-theme-tertiary" />
          <p>No hay agentes personalizados creados</p>
          <p className="text-sm mt-2">Haz clic en "Crear Agente" para comenzar</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-theme-color">
            <thead className="bg-theme-component-hover">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Nombre</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Descripción</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Modelo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-theme-component divide-y divide-theme-color">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-theme-component-hover">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-primary">{agent.name}</td>
                  <td className="px-6 py-4 text-sm text-theme-secondary">
                    {agent.description.length > 50 ? `${agent.description.substring(0, 50)}...` : agent.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-secondary">{agent.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(agent.id)}
                        className="text-primary-color hover:text-primary-color"
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => onDelete(agent.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AgentsList;
