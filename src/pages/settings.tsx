import DashboardLayout from '../components/layout/DashboardLayout';
import { useApiKey } from '../hooks/useApiKey';
import { useAppContext } from '../contexts/AppContext';
import Link from 'next/link';
import { FaDatabase, FaLock } from 'react-icons/fa';

export default function Settings() {
  const { apiKey, saveApiKey, clearApiKey } = useApiKey();
  const { isAdmin } = useAppContext();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Configuración</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tarjeta Groq */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 hover:bg-gray-750 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">API Key de Groq</h2>
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
                    className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                  >
                    Guardar API Key
                  </button>
                </div>
              </form>
            ) : (
              <div className="group relative">
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <span className="font-mono text-gray-300">
                    {apiKey.slice(0, 8)}...{apiKey.slice(-4)}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(apiKey)}
                    className="text-gray-400 hover:text-blue-400 ml-2 z-10"
                    title="Copiar al portapapeles"
                  >
                    📋
                  </button>
                </div>
                <div className="absolute inset-0 bg-gray-800 bg-opacity-90 hidden group-hover:flex items-center justify-center rounded-lg">
                  <span className="text-sm text-gray-300">
                    Haz clic en el icono para copiar
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tarjeta Supabase */}
          <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-750 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Supabase</h2>
              <span className="text-red-400 text-sm">No configurado</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">Configuración pendiente</p>
            <div className="bg-gray-700 p-3 rounded-lg">
              <span className="text-gray-400">URL: no configurada</span>
            </div>
          </div>
        </div>

        {/* Sección de administración - Solo visible para administradores */}
        <h2 className="text-2xl font-bold mt-8 mb-4">Herramientas de administración</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tarjeta de Administración de Embeddings */}
          <div className={`bg-gray-800 rounded-lg shadow-lg p-6 ${isAdmin() ? 'hover:bg-gray-750' : 'opacity-70'} transition-colors relative`}>
            {!isAdmin() && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center z-10">
                <div className="bg-gray-900 p-3 rounded-lg shadow-lg flex items-center space-x-2">
                  <FaLock className="text-yellow-500" />
                  <span className="text-white text-sm">Solo administradores</span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Administrar Embeddings</h2>
              <FaDatabase className={`${isAdmin() ? 'text-blue-400' : 'text-gray-500'}`} />
            </div>
            <p className="text-sm text-gray-400 mb-4">Gestiona los embeddings para el sistema RAG</p>
            {isAdmin() ? (
              <Link href="/scripts/embeddings">
                <div className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded text-center cursor-pointer">
                  Administrar Embeddings
                </div>
              </Link>
            ) : (
              <div className="bg-gray-700 text-gray-500 font-medium py-2 px-4 rounded text-center cursor-not-allowed">
                Acceso restringido
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
