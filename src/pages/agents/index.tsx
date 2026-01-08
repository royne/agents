import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AgentInterface from '../../components/AgentInterface';
import AgentsHeader from '../../components/Agents/AgentsHeader';
import AgentsList from '../../components/Agents/AgentsList';
import PageHeader from '../../components/common/PageHeader';
import { FaMagic } from 'react-icons/fa';
import { useAppContext } from '../../contexts/AppContext';
import { agentDatabaseService } from '../../services/database/agentService';
import type { Agent } from '../../types/database';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import UsageCounter from '../../components/ImageGen/UsageCounter';

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
        <div className='w-full md:w-3/4 mx-auto space-y-4'>
          <UsageCounter />
          <PageHeader
            title="Agentes"
            description="Gestiona y chatea con tus agentes de IA personalizados."
            creditInfo="Gasto: 1 crédito"
            actions={
              <div className="flex gap-3">
                <button
                  onClick={toggleView}
                  className="px-5 py-2.5 bg-theme-component border border-white/10 rounded-xl text-theme-primary hover:border-primary-color/50 transition-all btn-modern text-sm font-medium flex items-center gap-2"
                >
                  <FaMagic className={showChat ? 'text-primary-color' : ''} />
                  {showChat ? 'Ver Lista' : 'Ir al Chat'}
                </button>
                {canCreate && (
                  <button
                    onClick={handleCreateAgent}
                    className="px-5 py-2.5 bg-primary-color text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(18,216,250,0.3)] transition-all btn-modern text-sm"
                  >
                    Nuevo Agente
                  </button>
                )}
              </div>
            }
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
