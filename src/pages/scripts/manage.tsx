import DashboardLayout from '../../components/layout/DashboardLayout';

const ManageScriptsPage = () => {
  return (
    <DashboardLayout>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-4">Gestión de Scripts</h1>
        <p className="text-gray-300 mb-4">
          En esta sección puedes cargar y gestionar los scripts de entrenamiento
          que se utilizarán para mejorar las respuestas del agente de scripts.
        </p>
        <hr className="border-gray-600 my-6" />
        <div className="bg-gray-700 p-6 rounded-lg">
          <p className="text-yellow-400 mb-4">El componente ScriptLoader aún no está implementado.</p>
          <p className="text-gray-300">Para implementar esta funcionalidad, necesitas crear el componente ScriptLoader.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageScriptsPage;