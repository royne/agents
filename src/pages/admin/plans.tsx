import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Head from 'next/head';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { adminService } from '../../services/database/adminService';
import PageHeader from '../../components/common/PageHeader';
import { MODULE_METADATA, ModuleKey, ModuleMetadata } from '../../constants/plans';
import * as FaIcons from 'react-icons/fa';
import { FaLayerGroup, FaSave, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import Notification from '../../components/common/Notification';

export default function PlansManagement() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const activeModules = Object.values(MODULE_METADATA).filter(m => !m.isDeprecated && m.key !== 'admin');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    const data = await adminService.getSubscriptionPlans();
    setPlans(data);
    setLoading(false);
  };

  const handleToggleModule = (planKey: string, moduleKey: ModuleKey) => {
    setPlans(prev => prev.map(p => {
      if (p.key !== planKey) return p;

      const currentFeatures = p.features || {};
      const activeModules = currentFeatures.active_modules || [];

      let newModules;
      if (activeModules.includes(moduleKey)) {
        newModules = activeModules.filter((m: string) => m !== moduleKey);
      } else {
        newModules = [...activeModules, moduleKey];
      }

      return {
        ...p,
        features: {
          ...currentFeatures,
          active_modules: newModules
        }
      };
    }));
  };

  const handleSave = async (planKey: string) => {
    const plan = plans.find(p => p.key === planKey);
    if (!plan) return;

    setSaving(true);
    const ok = await adminService.updatePlanFeatures(planKey, plan.features);
    setSaving(false);

    if (ok) {
      setNotification({ show: true, message: `Plan ${plan.name} actualizado con éxito`, type: 'success' });
    } else {
      setNotification({ show: true, message: 'Error al actualizar el plan', type: 'error' });
    }
  };

  const getIcon = (iconName: string) => {
    // @ts-ignore
    const Icon = FaIcons[iconName];
    return Icon ? <Icon /> : <FaInfoCircle />;
  };

  return (
    <ProtectedRoute superAdminOnly={true}>
      <DashboardLayout>
        <Head>
          <title>DROPLAB - Configuración de Planes</title>
        </Head>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageHeader
            title={
              <div className="flex items-center gap-3">
                <FaLayerGroup className="text-primary-color" />
                <span>Configurador de Planes</span>
              </div>
            }
            description="Gestiona qué módulos están habilitados para cada nivel de suscripción."
            backLink="/admin"
          />

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-theme-component rounded-2xl shadow-xl overflow-hidden border border-theme-border hover:border-primary-color/50 transition-all duration-300">
                  <div className="p-6 bg-gradient-to-r from-theme-component-hover to-theme-component">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-2xl font-bold text-theme-primary">{plan.name}</h3>
                        <p className="text-theme-secondary text-sm">Cod: {plan.key}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-primary-color">${plan.price_usd}</span>
                        <span className="text-theme-tertiary text-xs block">USD / mes</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-theme-tertiary mb-4 flex items-center gap-2">
                      <FaInfoCircle /> Módulos Disponibles
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeModules.map((module) => {
                        const isEnabled = plan.features?.active_modules?.includes(module.key);
                        return (
                          <div
                            key={module.key}
                            onClick={() => handleToggleModule(plan.key, module.key)}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isEnabled
                              ? 'bg-primary-color/10 border-primary-color/30 text-theme-primary'
                              : 'bg-theme-component-hover border-transparent text-theme-secondary opacity-60 grayscale'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${isEnabled ? 'bg-primary-color text-white' : 'bg-theme-border text-theme-tertiary'}`}>
                                {getIcon(module.icon)}
                              </div>
                              <div>
                                <div className="text-sm font-semibold">{module.label}</div>
                                <div className="text-[10px] opacity-70 leading-tight line-clamp-1">{module.description}</div>
                              </div>
                            </div>
                            <div>
                              {isEnabled ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-theme-tertiary" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={() => handleSave(plan.key)}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-primary-color hover:bg-blue-600 text-white rounded-lg font-bold transition-all disabled:opacity-50"
                      >
                        <FaSave />
                        {saving ? 'Guardando...' : `Guardar cambios en ${plan.key}`}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notification.show && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ ...notification, show: false })}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
