import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AgentInterface from '../../components/AgentInterface';
import AgentsHeader from '../../components/Agents/AgentsHeader';
import AgentsList from '../../components/Agents/AgentsList';
import { useAppContext } from '../../contexts/AppContext';
import { agentDatabaseService } from '../../services/database/agentService';
import type { Agent } from '../../types/database';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function AgentsPage() {
  const router = useRouter();
  const { authData, hasFeature } = useAppContext();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    if (!authData?.company_id) return;
    
    setLoading(true);
    try {
      const agentsData = await agentDatabaseService.getAllAgents(authData.company_id);
      setAgents(agentsData);
    } catch (error) {
      console.error('Error al cargar agentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const canCreate = hasFeature('agents.create');

  const handleCreateAgent = () => {
    if (!canCreate) return;
    router.push('/agents/form');
  };

  const handleEditAgent = (id: string) => {
    router.push(`/agents/form?id=${id}`);
  };

  const handleDeleteAgent = async (id: string) => {
    if (!authData?.company_id) return;
    
    if (window.confirm('¿Estás seguro de que deseas eliminar este agente?')) {
      try {
        await agentDatabaseService.deleteAgent(id);
        fetchAgents(); // Recargar la lista después de eliminar
      } catch (error) {
        console.error('Error al eliminar agente:', error);
        alert('Ocurrió un error al eliminar el agente');
      }
    }
  };

  const toggleView = () => {
    setShowChat(!showChat);
  };

  return (
    <ProtectedRoute moduleKey={'agents'}>
      <DashboardLayout>
        <div className='w-full md:w-3/4 mx-auto'>
          <AgentsHeader 
            showChat={showChat} 
            onToggleView={toggleView} 
            onCreateAgent={handleCreateAgent}
            canCreate={canCreate}
          />

          {showChat ? (
            <AgentInterface />
          ) : (
            <AgentsList 
              agents={agents} 
              loading={loading} 
              onEdit={handleEditAgent} 
              onDelete={handleDeleteAgent} 
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
