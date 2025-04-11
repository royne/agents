import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { embeddingService } from '../../services/embeddings/embeddingService';
import { ScriptEmbedding } from '../../types/embeddings';

const ScriptEmbeddingsPage = () => {
  const [scripts, setScripts] = useState<ScriptEmbedding[]>([]);
  const [newScript, setNewScript] = useState('');
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

      // Crear embedding a través del servicio
      await embeddingService.createEmbedding(newScript, { source: 'manual' });
      
      setNewScript('');
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
    <DashboardLayout>
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
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Añadir Nuevo Script</h2>
          <form onSubmit={handleCreateScript}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Contenido del Script</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Buscar Scripts Similares</h2>
          <form onSubmit={handleSearch}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Consulta</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <div key={script.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="whitespace-pre-wrap">{script.content}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Similitud: {Math.round(script.similarity * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Lista de scripts */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Scripts Existentes</h2>
          {loading ? (
            <p>Cargando scripts...</p>
          ) : scripts.length === 0 ? (
            <p>No hay scripts disponibles.</p>
          ) : (
            <div className="space-y-4">
              {scripts.map((script) => (
                <div key={script.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap">{script.content}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Creado: {new Date(script.created_at).toLocaleString()}
                      </p>
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
    </DashboardLayout>
  );
};

export default ScriptEmbeddingsPage;
