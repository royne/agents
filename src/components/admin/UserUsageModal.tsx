import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaCalendarAlt, FaHistory, FaCoins, FaTimes, FaCheckCircle, FaExclamationCircle, FaTrash } from 'react-icons/fa';
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
  const [isPurging, setIsPurging] = useState(false);
  const [imageCount, setImageCount] = useState<number | null>(null);

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

        // Obtener conteo de imágenes reales almacenadas
        const imgCount = await adminService.getUserImageGenerationsCount(userId);
        setImageCount(imgCount);
      } catch (err) {
        console.error('Error fetching user usage data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  const handlePurgeImages = async () => {
    if (!window.confirm('¡ATENCIÓN! Esto eliminará PERMANENTEMENTE todos los archivos de almacenamiento y la base de datos vinculada a las imágenes de este usuario. ¿Deseas continuar?')) return;

    setIsPurging(true);
    try {
      const result = await adminService.purgeUserImages(userId);
      if (result.success) {
        alert(result.message);
        setImageCount(0);
      } else {
        alert('Error: ' + result.message);
      }
    } catch (err) {
      alert('Error inesperado al purgar.');
    } finally {
      setIsPurging(false);
    }
  };

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

      {/* Danger Zone: Purge Massively */}
      <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-rose-500 font-black text-sm uppercase tracking-widest flex items-center gap-2">
            <FaExclamationCircle /> Zona Peligrosa
            {imageCount !== null && (
              <span className={`px-2 py-0.5 rounded-md text-[10px] ml-2 ${imageCount > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                {imageCount > 0 ? `${imageCount} Archivos S3 detectados` : 'Purgado ✓'}
              </span>
            )}
          </h4>
          <p className="text-xs text-rose-400/80">Esta acción eliminará físicamente las imágenes generadas por el usuario, liberando espacio.</p>
        </div>
        <button
          onClick={handlePurgeImages}
          disabled={isPurging || imageCount === 0}
          className="px-6 py-2 bg-rose-500/20 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/50 font-black tracking-widest uppercase rounded-xl transition-all shadow-[0_0_15px_rgba(243,24,96,0.3)] flex items-center justify-center gap-2 text-xs disabled:opacity-50 min-w-max disabled:hover:bg-rose-500/20 disabled:hover:text-rose-500"
        >
          {isPurging ? (
            <div className="w-4 h-4 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
          ) : (
            <FaTrash />
          )}
          {isPurging ? 'Purgando...' : 'Purgar Imágenes'}
        </button>
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
