import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaWallet, FaCoins, FaSync, FaUserShield, FaCrown, FaCheck, FaTimes } from 'react-icons/fa';
import Head from 'next/head';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useAppContext } from '../../contexts/AppContext';
import { adminService } from '../../services/database/adminService';
import PageHeader from '../../components/common/PageHeader';

export default function SubscriptionsManagement() {
  const { isSuperAdmin } = useAppContext();
  const [userCredits, setUserCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUserCredits();
      setUserCredits(data);
    } catch (err) {
      console.error('Error loading credits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  const handleUpdate = async (userId: string, updates: any) => {
    setUpdatingId(userId);
    const success = await adminService.updateUserCredits(userId, updates);
    if (success) {
      await fetchCredits();
    } else {
      alert('Error al actualizar créditos');
    }
    setUpdatingId(null);
  };

  const PLANS = [
    { key: 'free', label: 'Gratis (20)' },
    { key: 'starter', label: 'Starter (500)' },
    { key: 'pro', label: 'Pro (1200)' },
    { key: 'business', label: 'Business (3000)' },
    { key: 'tester', label: 'Tester (Unlimited)' },
  ];

  return (
    <ProtectedRoute adminOnly={true}>
      <DashboardLayout>
        <Head>
          <title>DROPLAB - Créditos y Suscripciones</title>
        </Head>
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title={
              <>
                <FaWallet className="inline-block mr-2 mb-1 text-primary-color" />
                Suscripciones y Créditos
              </>
            }
            description="Administra los planes de los usuarios y su saldo de créditos manual."
            backLink="/admin"
          />

          <div className="soft-card p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-theme-primary flex items-center">
                <FaCoins className="mr-2 text-yellow-500" /> Saldos de Usuarios
              </h2>
              <button
                onClick={fetchCredits}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-theme-tertiary"
                title="Actualizar"
              >
                <FaSync className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-theme-tertiary opacity-50">Usuario</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-theme-tertiary opacity-50">Plan Actual</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-theme-tertiary opacity-50">Saldo</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-theme-tertiary opacity-50">Ilimitado</th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-theme-tertiary opacity-50">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {userCredits.map((item) => (
                    <tr key={item.user_id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-theme-primary">{item.profiles?.name || 'Usuario'}</span>
                          <span className="text-xs text-theme-tertiary opacity-60">{item.profiles?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          className="bg-theme-component border border-white/10 rounded-lg px-2 py-1 text-sm focus:ring-1 focus:ring-primary-color outline-none"
                          value={item.plan_key}
                          disabled={updatingId === item.user_id}
                          onChange={(e) => handleUpdate(item.user_id, { plan_key: e.target.value })}
                        >
                          {PLANS.map(p => (
                            <option key={p.key} value={p.key}>{p.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm font-bold text-primary-color"
                            defaultValue={item.balance}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value);
                              if (val !== item.balance) handleUpdate(item.user_id, { balance: val });
                            }}
                            disabled={updatingId === item.user_id}
                          />
                          <FaCoins className="text-[10px] text-yellow-500/50" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleUpdate(item.user_id, { unlimited_credits: !item.unlimited_credits })}
                          className={`p-2 rounded-lg transition-all ${item.unlimited_credits ? 'bg-primary-color/20 text-primary-color' : 'bg-white/5 text-theme-tertiary opacity-40 hover:opacity-100'}`}
                          disabled={updatingId === item.user_id}
                        >
                          {item.unlimited_credits ? <FaCrown /> : <FaTimes />}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {updatingId === item.user_id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-primary-color border-t-transparent rounded-full ml-auto"></div>
                        ) : (
                          <span className="text-[10px] font-black uppercase text-green-500/50 flex items-center justify-end">
                            <FaCheck className="mr-1" /> Al día
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {userCredits.length === 0 && !loading && (
              <div className="text-center py-20 opacity-30">
                <FaWallet className="text-4xl mx-auto mb-4" />
                <p>No se encontraron registros de créditos.</p>
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="soft-card p-6 border-l-4 border-primary-color">
              <h3 className="font-bold text-sm uppercase tracking-widest opacity-50 mb-2">Total Usuarios</h3>
              <p className="text-3xl font-black">{userCredits.length}</p>
            </div>
            <div className="soft-card p-6 border-l-4 border-yellow-500">
              <h3 className="font-bold text-sm uppercase tracking-widest opacity-50 mb-2">Planes Activos</h3>
              <p className="text-3xl font-black">{userCredits.filter(u => u.plan_key !== 'free').length}</p>
            </div>
            <div className="soft-card p-6 border-l-4 border-purple-500">
              <h3 className="font-bold text-sm uppercase tracking-widest opacity-50 mb-2">Ilimitados</h3>
              <p className="text-3xl font-black">{userCredits.filter(u => u.unlimited_credits).length}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
