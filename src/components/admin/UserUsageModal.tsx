import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaCalendarAlt, FaHistory, FaCoins, FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { CreditService } from '../../lib/creditService';
import { adminService } from '../../services/database/adminService';
import UsageHistoryTable from '../profile/UsageHistoryTable';

interface UserUsageModalProps {
  userId: string;
  onClose: () => void;
}

export default function UserUsageModal({ userId, onClose }: UserUsageModalProps) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [usageLogs, setUsageLogs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Obtener datos del usuario desde adminService
        const users = await adminService.getAllUsers();
        const user = users.find(u => u.id === userId);
        setUserData(user);

        // Obtener logs de uso
        const logs = await CreditService.getUserUsageHistory(userId, 50);
        setUsageLogs(logs);
      } catch (err) {
        console.error('Error fetching user usage data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color"></div>
        <p className="text-theme-secondary font-medium animate-pulse">Obteniendo historial...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-12 text-center text-theme-tertiary">
        <FaExclamationCircle className="mx-auto text-4xl mb-4 opacity-20" />
        <p>No se pudo encontrar información para este usuario.</p>
        <button onClick={onClose} className="mt-4 text-primary-color hover:underline">Cerrar</button>
      </div>
    );
  }

  const daysLeft = userData.credits?.expires_at
    ? Math.ceil((new Date(userData.credits.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* User Info Header Section */}
      <div className="p-6 bg-theme-component-hover border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-color/10 flex items-center justify-center border border-primary-color/20 shadow-lg">
              <FaUser className="text-3xl text-primary-color" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-theme-primary leading-tight">{userData.name || 'Sin Nombre'}</h3>
              <p className="text-theme-secondary flex items-center gap-2">
                <FaEnvelope className="text-xs opacity-50" /> {userData.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-theme-component px-4 py-2 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-black tracking-widest text-theme-tertiary block mb-1">Plan Actual</span>
              <span className="text-sm font-bold text-primary-color capitalize">{userData.credits?.plan_key || 'free'}</span>
            </div>
            <div className="bg-theme-component px-4 py-2 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-black tracking-widest text-theme-tertiary block mb-1">Saldo</span>
              <span className="text-sm font-bold text-green-500 flex items-center gap-1">
                {userData.credits?.balance ?? 0} <FaCoins size={10} />
              </span>
            </div>
            <div className="bg-theme-component px-4 py-2 rounded-xl border border-white/5 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-theme-tertiary block mb-1">Expiración</span>
              <span className={`text-sm font-bold flex items-center gap-1 ${daysLeft !== null && daysLeft < 5 ? 'text-rose-500' : 'text-theme-secondary'}`}>
                <FaCalendarAlt size={10} /> {daysLeft !== null ? `${daysLeft} días` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Logs Section */}
      <div className="flex-1 overflow-y-auto p-6 bg-theme-primary/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
            <FaHistory />
          </div>
          <h4 className="font-bold text-theme-primary">Historial de Consumo (Últimos 50)</h4>
        </div>

        {usageLogs.length > 0 ? (
          <div className="bg-theme-component rounded-2xl border border-white/5 overflow-hidden shadow-xl">
            <UsageHistoryTable userId={userId} />
          </div>
        ) : (
          <div className="py-20 text-center opacity-30">
            <FaHistory className="text-4xl mx-auto mb-4" />
            <p>Este usuario no tiene registros de consumo todavía.</p>
          </div>
        )}
      </div>
    </div>
  );
}
