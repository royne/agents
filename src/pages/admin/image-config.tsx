import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaImage, FaPlus, FaTrash, FaSave, FaShieldAlt, FaCog, FaMagic, FaTimes } from 'react-icons/fa';
import { useAppContext } from '../../contexts/AppContext';
import { useApiKey } from '../../hooks/useApiKey';
import { supabase } from '../../lib/supabase';
import Head from 'next/head';
import { useEffect } from 'react';

export default function ImageConfigPage() {
  const { isSuperAdmin, authData } = useAppContext();
  const { googleAiKey, saveGoogleAiKey, clearGoogleAiKey } = useApiKey();
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    url: '',
    type: 'inspiration' as 'template' | 'inspiration',
    base_category: 'landing-hero',
    prompt_hint: ''
  });
  const [uploading, setUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const CATEGORIES = [
    { id: 'landing-hero', name: 'Landing: Hero' },
    { id: 'landing-oferta', name: 'Landing: Oferta' },
    { id: 'landing-transformacion', name: 'Landing: Antes/Después' },
    { id: 'landing-beneficios', name: 'Landing: Beneficios' },
    { id: 'landing-comparativa', name: 'Landing: Comparativa' },
    { id: 'landing-autoridad', name: 'Landing: Autoridad' },
    { id: 'landing-testimonios', name: 'Landing: Testimonios' },
    { id: 'landing-instrucciones', name: 'Landing: Cómo Usar' },
    { id: 'landing-componentes', name: 'Landing: Componentes' },
    { id: 'landing-cierre', name: 'Landing: Cierre' },
    { id: 'ads-mockup', name: 'Ads: Mockup' },
    { id: 'product-beauty', name: 'Producto: Estético' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('visual_references')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTemplates(data);
    }
    setIsLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAddTemplate = async () => {
    if (!newTemplate.name || !selectedFile) {
      alert('Nombre y archivo son obligatorios');
      return;
    }

    setUploading(true);
    try {
      // 1. Subir a Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${newTemplate.type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('visual-references')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('visual-references')
        .getPublicUrl(filePath);

      // 2. Insertar en DB
      const { error: dbError } = await supabase
        .from('visual_references')
        .insert({
          name: newTemplate.name,
          url: publicUrl,
          type: newTemplate.type,
          base_category: newTemplate.base_category,
          prompt_hint: newTemplate.prompt_hint
        });

      if (dbError) throw dbError;

      fetchTemplates();
      setNewTemplate({
        name: '',
        url: '',
        type: 'inspiration',
        base_category: 'landing-hero',
        prompt_hint: ''
      });
      setSelectedFile(null);
      setShowAddModal(false);
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Error: ${error.message || 'No se pudo completar la acción'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTemplate = async (item: any) => {
    if (!confirm('¿Estás seguro de eliminar esta referencia? Se borrará permanentemente de la base de datos y del almacenamiento.')) return;

    try {
      // 1. Extraer el path del Storage desde la URL
      // Public URL format: .../storage/v1/object/public/visual-references/type/filename
      const urlParts = item.url.split('visual-references/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage
          .from('visual-references')
          .remove([filePath]);
      }

      // 2. Borrar de la DB
      const { error } = await supabase
        .from('visual_references')
        .delete()
        .eq('id', item.id);

      if (error) throw error;
      fetchTemplates();
    } catch (error: any) {
      console.error('Error deleting:', error);
      alert('Error al eliminar: ' + error.message);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingItem.name) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('visual_references')
        .update({
          name: editingItem.name,
          type: editingItem.type,
          base_category: editingItem.base_category,
          prompt_hint: editingItem.prompt_hint
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      fetchTemplates();
      setShowEditModal(false);
      setEditingItem(null);
    } catch (error: any) {
      alert('Error al actualizar: ' + error.message);
    } finally {
      setIsLoading(false);
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
                    <div className="relative aspect-video overflow-hidden cursor-pointer" onClick={() => setPreviewImage(tpl.url)}>
                      <img src={tpl.url} alt={tpl.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-white/20">Click para ampliar</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-theme-primary leading-tight truncate mr-2" title={tpl.name}>{tpl.name}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingItem(tpl);
                              setShowEditModal(true);
                            }}
                            className="text-theme-tertiary hover:text-primary-color p-1 transition-colors"
                            title="Editar"
                          >
                            <FaCog size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(tpl)}
                            className="text-red-400 hover:text-red-300 p-1 transition-colors"
                            title="Eliminar"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold ${tpl.type === 'template' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                          {tpl.type}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-400 uppercase font-bold">
                          {tpl.base_category}
                        </span>
                      </div>
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
                    <option>2K HD (Premium)</option>
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
                <label className="text-xs font-bold text-theme-tertiary uppercase mb-1 block">Subir Imagen (Bucket)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full bg-theme-primary p-4 rounded-xl border border-dashed border-gray-700 text-center hover:border-primary-color transition-colors">
                    {uploading ? (
                      <span className="text-sm text-primary-color animate-pulse">Procesando...</span>
                    ) : selectedFile ? (
                      <span className="text-sm text-green-400 truncate block">{selectedFile.name} ✅</span>
                    ) : (
                      <span className="text-sm text-theme-tertiary">Selecciona un archivo</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-theme-tertiary uppercase mb-1 block">Tipo</label>
                  <select
                    className="w-full bg-theme-primary p-3 rounded-xl border border-gray-700 text-theme-primary text-sm"
                    value={newTemplate.type}
                    onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as any })}
                  >
                    <option value="inspiration">Inspiración (Estilo)</option>
                    <option value="template">Template (Wireframe)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-theme-tertiary uppercase mb-1 block">Categoría Base</label>
                  <select
                    className="w-full bg-theme-primary p-3 rounded-xl border border-gray-700 text-theme-primary text-sm"
                    value={newTemplate.base_category}
                    onChange={(e) => setNewTemplate({ ...newTemplate, base_category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-theme-tertiary uppercase mb-1 block">Prompt Hint (Opcional)</label>
                <textarea
                  placeholder="Instrucción extra para Imagen 3..."
                  rows={2}
                  className="w-full bg-theme-primary p-3 rounded-xl border border-gray-700 text-theme-primary text-sm outline-none focus:border-primary-color resize-none"
                  value={newTemplate.prompt_hint}
                  onChange={(e) => setNewTemplate({ ...newTemplate, prompt_hint: e.target.value })}
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
      {/* Modal Editar Plantilla */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { setShowEditModal(false); setEditingItem(null); }}></div>
          <div className="relative w-full max-w-md bg-theme-component border border-gray-800 rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-theme-primary">Editar Referencia</h3>
              <button onClick={() => { setShowEditModal(false); setEditingItem(null); }} className="text-theme-tertiary hover:text-white">
                <FaImage size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="aspect-video rounded-xl overflow-hidden border border-gray-700 mb-4">
                <img src={editingItem.url} alt="Preview" className="w-full h-full object-cover" />
              </div>

              <div>
                <label className="text-xs font-bold text-theme-tertiary uppercase mb-1 block">Nombre</label>
                <input
                  type="text"
                  className="w-full bg-theme-primary p-3 rounded-xl border border-gray-700 text-theme-primary outline-none focus:border-primary-color"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-theme-tertiary uppercase mb-1 block">Tipo</label>
                  <select
                    className="w-full bg-theme-primary p-3 rounded-xl border border-gray-700 text-theme-primary text-sm outline-none focus:border-primary-color"
                    value={editingItem.type}
                    onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as any })}
                  >
                    <option value="inspiration">Inspiración</option>
                    <option value="template">Template</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-theme-tertiary uppercase mb-1 block">Categoría</label>
                  <select
                    className="w-full bg-theme-primary p-3 rounded-xl border border-gray-700 text-theme-primary text-sm outline-none focus:border-primary-color"
                    value={editingItem.base_category}
                    onChange={(e) => setEditingItem({ ...editingItem, base_category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-theme-tertiary uppercase mb-1 block">Prompt Hint</label>
                <textarea
                  rows={3}
                  className="w-full bg-theme-primary p-3 rounded-xl border border-gray-700 text-theme-primary text-sm outline-none focus:border-primary-color resize-none"
                  value={editingItem.prompt_hint || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, prompt_hint: e.target.value })}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => { setShowEditModal(false); setEditingItem(null); }}
                  className="flex-1 py-3 text-theme-secondary font-bold hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateTemplate}
                  disabled={isLoading}
                  className="flex-[2] bg-primary-color text-black font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(18,216,250,0.3)] transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Previsualización de Imagen */}
      {previewImage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setPreviewImage(null)}></div>
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            <img src={previewImage} alt="Fullscreen Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all backdrop-blur-md"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
