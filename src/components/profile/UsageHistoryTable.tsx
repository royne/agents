import React, { useState, useEffect } from 'react';
import { CreditService } from '../../lib/creditService';
import { FaHistory, FaImage, FaComments, FaFileExcel, FaQuestionCircle, FaClock } from 'react-icons/fa';

interface UsageLog {
  id: string;
  action_type: string;
  credits_spent: number;
  created_at: string;
  details: any;
}

const ACTION_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  image_gen: { label: 'Generación de Imagen', icon: FaImage, color: 'text-purple-500 bg-purple-500/10' },
  chat_rag: { label: 'Master Chat / RAG', icon: FaComments, color: 'text-blue-500 bg-blue-500/10' },
  excel_analysis: { label: 'Análisis de Datos', icon: FaFileExcel, color: 'text-green-500 bg-green-500/10' },
  default: { label: 'Acción Desconocida', icon: FaQuestionCircle, color: 'text-gray-500 bg-gray-500/10' }
};

export default function UsageHistoryTable({ userId }: { userId: string }) {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchLogs();
    }
  }, [userId]);

  const fetchLogs = async () => {
    setLoading(true);
    const data = await CreditService.getUserUsageHistory(userId);
    setLogs(data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-color"></div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-theme-component p-8 rounded-2xl border border-theme-border text-center">
        <FaHistory className="mx-auto text-4xl text-theme-tertiary mb-4 opacity-20" />
        <p className="text-theme-secondary">No hay registros de consumo recientes.</p>
      </div>
    );
  }

  return (
    <div className="bg-theme-component rounded-2xl shadow-xl overflow-hidden border border-theme-border">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-theme-border">
          <thead className="bg-theme-component-hover/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-theme-tertiary uppercase tracking-wider">Acción</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-theme-tertiary uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-theme-tertiary uppercase tracking-wider">Costo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border bg-theme-component">
            {logs.map((log) => {
              const config = ACTION_CONFIG[log.action_type] || ACTION_CONFIG.default;
              const Icon = config.icon;

              return (
                <tr key={log.id} className="hover:bg-theme-component-hover/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${config.color}`}>
                        <Icon className="text-sm" />
                      </div>
                      <span className="text-sm font-semibold text-theme-primary">{config.label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-theme-secondary text-sm">
                      <FaClock className="mr-2 opacity-50 text-xs" />
                      {new Date(log.created_at).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-primary-color/10 text-primary-color border border-primary-color/20">
                      -{log.credits_spent} 🪙
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
