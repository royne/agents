import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaImage, FaPlus, FaTrash, FaSave, FaShieldAlt, FaCog, FaMagic } from 'react-icons/fa';
import { useAppContext } from '../../contexts/AppContext';
import { useApiKey } from '../../hooks/useApiKey';
import { supabase } from '../../lib/supabase';
import Head from 'next/head';
import { useEffect } from 'react';

export default function ImageConfigPage() {
  const { isSuperAdmin, authData } = useAppContext();
  const { googleAiKey, saveGoogleAiKey, clearGoogleAiKey } = useApiKey();
  const [templates, setTemplates] = useState<{ id: string, name: string, url: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', url: '' });
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('image_pro_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTemplates(data);
    }
    setIsLoading(false);
  };

  const handleAddTemplate = async () => {
    if (!newTemplate.name || !newTemplate.url) return;

    const { error } = await supabase
      .from('image_pro_templates')
      .insert({
        name: newTemplate.name,
        url: newTemplate.url,
        created_by: authData?.isAuthenticated ? (await supabase.auth.getUser()).data.user?.id : null
      });

    if (!error) {
      fetchTemplates();
      setNewTemplate({ name: '', url: '' });
      setShowAddModal(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta plantilla?')) return;

    const { error } = await supabase
      .from('image_pro_templates')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchTemplates();
    }
  };

  if (!isSuperAdmin()) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <FaShieldAlt className="text-red-500 text-6xl mb-4" />
          <h1 className="text-2xl font-bold text-theme-primary">Acceso Restringido</h1>
          <p className="text-theme-secondary">Solo los Super Administradores pueden acceder a esta sección.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Configuración Agente Pro - Admin</title>
      </Head>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-theme-primary">Configuración Global - Agente Pro</h1>
        <p className="text-theme-secondary mb-8">Gestiona las plantillas de entrenamiento y bases visuales para todos los usuarios Premium.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Listado de Plantillas */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-theme-component p-6 rounded-2xl border border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-theme-primary flex items-center gap-2">
                  <FaImage className="text-primary-color" /> Plantillas de Entrenamiento
                </h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 bg-primary-color text-black px-4 py-2 rounded-lg font-bold text-sm"
                >
                  <FaPlus /> Nueva Plantilla
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {templates.map(tpl => (
                  <div key={tpl.id} className="group relative rounded-xl overflow-hidden border border-gray-700 bg-gray-900">
                    <img src={tpl.url} alt={tpl.name} className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="p-3 flex justify-between items-center">
                      <span className="text-sm font-medium text-theme-primary">{tpl.name}</span>
                      <button
                        onClick={() => handleDeleteTemplate(tpl.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Configuración de Modelo */}
          <div className="space-y-6">
            <div className="bg-theme-component p-6 rounded-2xl border border-gray-800">
              <h2 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                <FaCog className="text-primary-color" /> Parámetros
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-theme-tertiary uppercase mb-1 block">Modelo Activo</label>
                  <select className="w-full bg-theme-primary p-3 rounded-xl border border-gray-700 text-theme-primary">
                    <option>Imagen 3 Pro Preview</option>
                    <option>Imagen 3 Fast</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-theme-tertiary uppercase mb-1 block">Calidad por Defecto</label>
                  <select className="w-full bg-theme-primary p-3 rounded-xl border border-gray-700 text-theme-primary">
                    <option>4K HD (Premium)</option>
                    <option>1024x1024</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button className="w-full bg-theme-secondary text-primary-color border border-primary-color/30 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-color hover:text-black transition-all">
                    <FaSave /> Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nueva Plantilla */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative w-full max-w-md bg-theme-component border border-gray-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-4">Añadir Plantilla Global</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-theme-tertiary uppercase mb-1 block">Nombre</label>
                <input
                  type="text"
                  placeholder="Ej: Estilo Clean Ecom"
                  className="w-full bg-theme-primary p-3 rounded-xl border border-gray-700 text-theme-primary"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-theme-tertiary uppercase mb-1 block">URL de Imagen (Base)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  className="w-full bg-theme-primary p-3 rounded-xl border border-gray-700 text-theme-primary"
                  value={newTemplate.url}
                  onChange={(e) => setNewTemplate({ ...newTemplate, url: e.target.value })}
                />
              </div>
              <button
                onClick={handleAddTemplate}
                className="w-full bg-primary-color text-black font-bold py-3 rounded-xl mt-2"
              >
                Crear Plantilla
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
