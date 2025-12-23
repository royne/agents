import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaImage, FaPlus, FaTrash, FaSave, FaShieldAlt, FaCog, FaMagic } from 'react-icons/fa';
import { useAppContext } from '../../contexts/AppContext';
import { useApiKey } from '../../hooks/useApiKey';
import Head from 'next/head';

export default function ImageConfigPage() {
  const { isSuperAdmin } = useAppContext();
  const { googleAiKey, saveGoogleAiKey, clearGoogleAiKey } = useApiKey();
  const [templates, setTemplates] = useState([
    { id: '1', name: 'Minimalista Blanco', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8' },
    { id: '2', name: 'Dark Tech', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f' }
  ]);

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
                <button className="flex items-center gap-2 bg-primary-color text-black px-4 py-2 rounded-lg font-bold text-sm">
                  <FaPlus /> Nueva Plantilla
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {templates.map(tpl => (
                  <div key={tpl.id} className="group relative rounded-xl overflow-hidden border border-gray-700 bg-gray-900">
                    <img src={tpl.url} alt={tpl.name} className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="p-3 flex justify-between items-center">
                      <span className="text-sm font-medium text-theme-primary">{tpl.name}</span>
                      <button className="text-red-400 hover:text-red-300">
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
    </DashboardLayout>
  );
}
