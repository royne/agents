import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { agentDatabaseService } from '../../services/database/agentService';
import { FaRobot, FaSave, FaTimes } from 'react-icons/fa';
import { useAppContext } from '../../contexts/AppContext';
import AgentFormFields from '../../components/Agents/AgentFormFields';

export default function AgentForm() {
  const router = useRouter();
  const { id } = router.query;
  const { authData } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    model: 'deepseek-r1-distill-llama-70b',
    system_prompt: ''
  });

  useEffect(() => {
    const fetchAgent = async () => {
      if (id && typeof id === 'string' && authData?.company_id) {
        setIsLoading(true);
        try {
          const agent = await agentDatabaseService.getAgent(id, authData.company_id);
          if (agent) {
            setFormData({
              name: agent.name,
              description: agent.description,
              model: agent.model,
              system_prompt: agent.system_prompt
            });
          }
        } catch (error) {
          console.error('Error al cargar el agente:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAgent();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authData?.company_id) {
      alert('No se pudo identificar la compañía. Por favor, inicie sesión nuevamente.');
      return;
    }

    setIsLoading(true);
    try {
      if (id && typeof id === 'string') {
        // Actualizar agente existente
        await agentDatabaseService.updateAgent(id, formData, authData.company_id);
      } else {
        // Crear nuevo agente
        await agentDatabaseService.createAgent(formData, authData.company_id);
      }
      router.push('/agents');
    } catch (error) {
      console.error('Error al guardar el agente:', error);
      alert('Ocurrió un error al guardar el agente. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className='w-full md:w-3/4 mx-auto'>
        <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 py-2 px-3 rounded text-sm dark:bg-green-900 dark:border-green-600 dark:text-green-200">
          <span className="font-bold">{id ? 'Editar' : 'Crear'} Asistente:</span> Configura tu asistente de marketing personalizado
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24 bg-theme-component rounded-full flex items-center justify-center shadow-inner border-2 border-primary-color">
            <FaRobot className="text-primary-color text-5xl animate-pulse" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-theme-component p-6 rounded-lg shadow-md">
          <AgentFormFields 
            formData={formData}
            handleChange={handleChange}
          />
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/agents')}
              className="inline-flex items-center px-4 py-2 border border-theme-color shadow-sm text-sm font-medium rounded-md text-theme-primary bg-theme-component hover:bg-theme-component-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-color"
            >
              <FaTimes className="mr-2" /> Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-color hover:bg-primary-color focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-color disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSave className="mr-2" /> {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
