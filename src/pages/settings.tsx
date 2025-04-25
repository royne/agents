import DashboardLayout from '../components/layout/DashboardLayout';
import { useApiKey } from '../hooks/useApiKey';
import { useAppContext } from '../contexts/AppContext';
import Link from 'next/link';
import { FaDatabase, FaLock, FaTruck } from 'react-icons/fa';
import ThemeSettings from '../components/settings/ThemeSettings';
import CarrierImporter from '../components/Admin/CarrierImporter';

export default function Settings() {
  const { apiKey, saveApiKey, clearApiKey, openaiApiKey, saveOpenaiApiKey, clearOpenaiApiKey } = useApiKey();
  const { isAdmin } = useAppContext();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Configuración</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tarjeta Groq */}
          <div className="bg-theme-component rounded-lg shadow-lg p-6 hover:bg-theme-component-hover transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-theme-primary">API Key de Groq</h2>
              {apiKey && (
                <button 
                  onClick={clearApiKey}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Eliminar
                </button>
              )}
            </div>

            {!apiKey ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const key = formData.get('apiKey') as string;
                saveApiKey(key);
              }}>
                <div className="space-y-4">
                  <input
                    type="password"
                    name="apiKey"
                    placeholder="Ingresa tu API Key de Groq"
                    className="w-full p-3 rounded bg-theme-component-hover text-theme-primary border border-theme-color focus:border-primary-color focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-primary-color hover:opacity-90 text-white font-medium py-2 px-4 rounded btn-primary"
                  >
                    Guardar API Key
                  </button>
                </div>
              </form>
            ) : (
              <div className="group relative">
                <div className="flex items-center justify-between p-3 bg-theme-component-hover rounded-lg">
                  <span className="font-mono text-theme-secondary">
                    {apiKey.slice(0, 8)}...{apiKey.slice(-4)}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(apiKey)}
                    className="text-theme-tertiary hover:text-primary-color ml-2 z-10"
                    title="Copiar al portapapeles"
                  >
                    📋
                  </button>
                </div>
                <div className="absolute inset-0 bg-theme-component bg-opacity-90 hidden group-hover:flex items-center justify-center rounded-lg">
                  <span className="text-sm text-theme-secondary">
                    Haz clic en el icono para copiar
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tarjeta OpenAI */}
          <div className="bg-theme-component rounded-lg shadow-lg p-6 hover:bg-theme-component-hover transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-theme-primary">API Key de OpenAI</h2>
              {openaiApiKey && (
                <button 
                  onClick={clearOpenaiApiKey}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Eliminar
                </button>
              )}
            </div>

            {!openaiApiKey ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const key = formData.get('openaiApiKey') as string;
                saveOpenaiApiKey(key);
              }}>
                <div className="space-y-4">
                  <input
                    type="password"
                    name="openaiApiKey"
                    placeholder="Ingresa tu API Key de OpenAI"
                    className="w-full p-3 rounded bg-theme-component-hover text-theme-primary border border-theme-color focus:border-primary-color focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-primary-color hover:opacity-90 text-white font-medium py-2 px-4 rounded btn-primary"
                  >
                    Guardar API Key
                  </button>
                </div>
              </form>
            ) : (
              <div className="group relative">
                <div className="flex items-center justify-between p-3 bg-theme-component-hover rounded-lg">
                  <span className="font-mono text-theme-secondary">
                    {openaiApiKey.slice(0, 8)}...{openaiApiKey.slice(-4)}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(openaiApiKey)}
                    className="text-theme-tertiary hover:text-primary-color ml-2 z-10"
                    title="Copiar al portapapeles"
                  >
                    📋
                  </button>
                </div>
                <div className="absolute inset-0 bg-theme-component bg-opacity-90 hidden group-hover:flex items-center justify-center rounded-lg">
                  <span className="text-sm text-theme-secondary">
                    Haz clic en el icono para copiar
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección de personalización */}
        <h2 className="text-2xl font-bold mt-8 mb-4">Personalización</h2>
        <div className="grid grid-cols-1 gap-4 mb-8">
          <ThemeSettings />
        </div>

        {/* Sección de administración - Solo visible para administradores */}
        <h2 className="text-2xl font-bold mt-8 mb-4">Herramientas de administración</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tarjeta de Administración de Embeddings */}
          <div className={`bg-theme-component rounded-lg shadow-lg p-6 ${isAdmin() ? 'hover:bg-theme-component-hover' : 'opacity-70'} transition-colors relative`}>
            {!isAdmin() && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center z-10">
                <div className="bg-theme-component p-3 rounded-lg shadow-lg flex items-center space-x-2">
                  <FaLock className="text-yellow-500" />
                  <span className="text-white text-sm">Solo administradores</span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-theme-primary">Administrar Embeddings</h2>
              <FaDatabase className={`${isAdmin() ? 'text-blue-400' : 'text-gray-500'}`} />
            </div>
            <p className="text-sm text-theme-tertiary mb-4">Gestiona los embeddings para el sistema RAG</p>
            {isAdmin() ? (
              <Link href="/scripts/embeddings">
                <div className="bg-primary-color hover:opacity-90 text-white font-medium py-2 px-4 rounded text-center cursor-pointer btn-primary">
                  Administrar Embeddings
                </div>
              </Link>
            ) : (
              <div className="bg-theme-component-hover text-theme-tertiary font-medium py-2 px-4 rounded text-center cursor-not-allowed">
                Acceso restringido
              </div>
            )}
          </div>
          
          {/* Tarjeta de Importación de Transportadoras */}
          <div className={`bg-theme-component rounded-lg shadow-lg p-6 ${isAdmin() ? 'hover:bg-theme-component-hover' : 'opacity-70'} transition-colors relative`}>
            {!isAdmin() && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center z-10">
                <div className="bg-theme-component p-3 rounded-lg shadow-lg flex items-center space-x-2">
                  <FaLock className="text-yellow-500" />
                  <span className="text-white text-sm">Solo administradores</span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-theme-primary">Importar Transportadoras</h2>
              <FaTruck className={`${isAdmin() ? 'text-green-400' : 'text-gray-500'}`} />
            </div>
            <p className="text-sm text-theme-tertiary mb-4">Importa transportadoras desde archivos Excel</p>
            {isAdmin() ? (
              <div className="mt-4">
                <CarrierImporter />
              </div>
            ) : (
              <div className="bg-theme-component-hover text-theme-tertiary font-medium py-2 px-4 rounded text-center cursor-not-allowed">
                Acceso restringido
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
