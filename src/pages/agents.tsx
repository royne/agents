import DashboardLayout from '../components/layout/DashboardLayout';
import AgentInterface from '../components/AgentInterface';

export default function Agents() {
  return (
    <DashboardLayout>
      <div className='w-full md:w-3/4 mx-auto'>
        <div className="mb-2 bg-green-100 border-l-4 border-green-500 text-green-700 py-2 px-3 rounded text-sm dark:bg-green-900 dark:border-green-600 dark:text-green-200">
          <span className="font-bold">Asistentes de Marketing:</span> Especialistas para tus tareas de marketing
        </div>
        <AgentInterface/>
      </div>
    </DashboardLayout>
  );
}
