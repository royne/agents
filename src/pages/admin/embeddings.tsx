import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { embeddingService } from '../../services/embeddings/embeddingService';
import { ScriptEmbedding } from '../../types/embeddings';
import AdminRoute from '../../components/auth/AdminRoute';

const ScriptEmbeddingsPage = () => {
  const [scripts, setScripts] = useState<ScriptEmbedding[]>([]);
  const [newScript, setNewScript] = useState('');
  const [scriptTitle, setScriptTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ScriptEmbedding[]>([]);
  const [searching, setSearching] = useState(false);

  // Cargar scripts al montar el componente
  useEffect(() => {
    fetchScripts();
  }, []);

  // Obtener todos los scripts de la base de datos
  const fetchScripts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('script_embeddings')
        .select('id, content, metadata, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Añadir la propiedad similarity a cada elemento
      const scriptsWithSimilarity = (data || []).map(script => ({
        ...script,
        similarity: 0 // Valor por defecto para la lista general
      }));
      setScripts(scriptsWithSimilarity);
    } catch (error) {
      console.error('Error al cargar scripts:', error);
      setMessage({ text: 'Error al cargar scripts', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Crear un nuevo script con embedding
  const handleCreateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScript.trim()) return;

    try {
      setLoading(true);
      setMessage({ text: 'Creando embedding...', type: 'info' });

      // Crear embedding a través del servicio con título personalizado
      const metadata = { 
        source: 'manual',
        title: scriptTitle.trim() || undefined // Solo usar si se proporciona un título
      };
      
      await embeddingService.createEmbedding(newScript, metadata);
      
      setNewScript('');
      setScriptTitle('');
      setMessage({ text: 'Script creado exitosamente', type: 'success' });
      fetchScripts(); // Recargar la lista
    } catch (error) {
      console.error('Error al crear script:', error);
      setMessage({ text: 'Error al crear script', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un script
  const handleDeleteScript = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este script?')) return;

    try {
      setLoading(true);
      await embeddingService.deleteEmbedding(id);
      setMessage({ text: 'Script eliminado exitosamente', type: 'success' });
      fetchScripts(); // Recargar la lista
    } catch (error) {
      console.error('Error al eliminar script:', error);
      setMessage({ text: 'Error al eliminar script', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Buscar scripts similares
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      setMessage({ text: 'Buscando scripts similares...', type: 'info' });
      
      const results = await embeddingService.searchSimilarScripts(searchQuery);
      setSearchResults(results);
      
      if (results.length === 0) {
        setMessage({ text: 'No se encontraron scripts similares', type: 'info' });
      } else {
        setMessage({ text: `Se encontraron ${results.length} scripts similares`, type: 'success' });
      }
    } catch (error) {
      console.error('Error al buscar scripts:', error);
      setMessage({ text: 'Error al buscar scripts', type: 'error' });
    } finally {
      setSearching(false);
    }
  };

  return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Administrar Scripts para RAG</h1>
        
        {/* Mensaje de estado */}
        {message.text && (
          <div className={`p-4 mb-4 rounded ${
            message.type === 'error' ? 'bg-red-100 text-red-700' : 
            message.type === 'success' ? 'bg-green-100 text-green-700' : 
            'bg-blue-100 text-blue-700'
          }`}>
            {message.text}
          </div>
        )}
        
        {/* Formulario para crear scripts */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Añadir Nuevo Script</h2>
          <form onSubmit={handleCreateScript}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Título (opcional)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={scriptTitle}
                onChange={(e) => setScriptTitle(e.target.value)}
                placeholder="Título descriptivo para el script"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Contenido del Script</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={5}
                value={newScript}
                onChange={(e) => setNewScript(e.target.value)}
                placeholder="Escribe el contenido del script aquí..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Script'}
            </button>
          </form>
        </div>
        
        {/* Búsqueda de scripts similares */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Buscar Scripts Similares</h2>
          <form onSubmit={handleSearch}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Consulta</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Escribe tu consulta aquí..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {searching ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
          
          {/* Resultados de búsqueda */}
          {searchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Resultados de Búsqueda</h3>
              <div className="space-y-4">
                {searchResults.map((script) => (
                  <div key={script.id} className="border border-gray-700 bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {script.metadata?.title && (
                          <h3 className="font-semibold text-lg mb-2">{script.metadata.title}</h3>
                        )}
                        {script.metadata?.description && (
                          <p className="text-gray-300 mb-3 italic">{script.metadata.description}</p>
                        )}
                        <p className="whitespace-pre-wrap">{script.content}</p>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-400 mt-2">
                          <p>Similitud: {Math.round(script.similarity * 100)}%</p>
                          {script.metadata?.total_chunks > 1 && (
                            <p>• Fragmento {script.metadata.chunk_index + 1} de {script.metadata.total_chunks}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Lista de scripts */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Scripts Existentes</h2>
          {loading ? (
            <p>Cargando scripts...</p>
          ) : scripts.length === 0 ? (
            <p>No hay scripts disponibles.</p>
          ) : (
            <div className="space-y-4">
              {scripts.map((script) => (
                <div key={script.id} className="border border-gray-700 bg-gray-700 p-4 rounded-lg hover:bg-gray-600">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {script.metadata?.title && (
                        <h3 className="font-semibold text-lg mb-2">{script.metadata.title}</h3>
                      )}
                      {script.metadata?.description && (
                        <p className="text-gray-300 mb-3 italic">{script.metadata.description}</p>
                      )}
                      <p className="whitespace-pre-wrap">{script.content}</p>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-400 mt-2">
                        <p>Creado: {new Date(script.created_at).toLocaleString()}</p>
                        {script.metadata?.total_chunks > 1 && (
                          <p>• Fragmento {script.metadata.chunk_index + 1} de {script.metadata.total_chunks}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteScript(script.id)}
                      className="ml-4 text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
};

const EmbeddingsPage = () => {
  return (
    <AdminRoute>
      <DashboardLayout>
        <ScriptEmbeddingsPage />
      </DashboardLayout>
    </AdminRoute>
  );
};

export default EmbeddingsPage;