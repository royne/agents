import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useRouter } from 'next/router';
import { useAppContext } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';
import { FaUserGraduate, FaCoins, FaLink, FaCopy, FaCheckCircle, FaUsers, FaChartBar, FaUserCircle, FaInfoCircle } from 'react-icons/fa';
import { ReferralConfig, Referral } from '../types/database';
import { trackPixelEvent } from '../utils/pixelEvents';

export default function ReferralsPage() {
  const router = useRouter();
  const { authData } = useAppContext();
  const [isMentor, setIsMentor] = useState(false);
  const [config, setConfig] = useState<ReferralConfig | null>(null);
  const [referrals, setReferrals] = useState<(Referral & { profiles: { name: string, email: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authData?.userId) {
      checkMentorStatus();
    }
  }, [authData?.userId, authData?.is_mentor]);

  const checkMentorStatus = async () => {
    setLoading(true);
    try {
      // 1. Verificar si es mentor en el perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_mentor')
        .eq('user_id', authData?.userId)
        .single();

      setIsMentor(!!profile?.is_mentor);

      if (profile?.is_mentor) {
        // 2. Cargar Configuración de Mentor
        const { data: configData } = await supabase
          .from('referral_configs')
          .select('*')
          .eq('user_id', authData?.userId)
          .single();

        if (configData) setConfig(configData);

        // 3. Cargar Referidos (Alumnos) con sus perfiles
        const { data: refsData } = await supabase
          .from('referrals')
          .select(`
            *,
            profiles:referred_id (name, email)
          `)
          .eq('mentor_id', authData?.userId)
          .order('created_at', { ascending: false });

        if (refsData) setReferrals(refsData as any);
      }
    } catch (err) {
      console.error('Error cargando datos de referidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!config?.referral_code) return;
    const url = `${window.location.origin}/auth/register?ref=${config.referral_code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    trackPixelEvent('Contact', {
      content_name: 'Copy Referral Link',
      method: 'dashboard'
    });
  };

  if (!loading && !isMentor) {
    if (typeof window !== 'undefined') router.push('/');
    return null;
  }

  const activeCount = referrals.filter(r => r.status === 'active').length;
  const progressPercent = Math.min((activeCount / 21) * 100, 100);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase font-mono">Panel de Mentor</h1>
            <p className="text-gray-500 font-medium uppercase tracking-[0.2em] text-xs mt-2">Comunidad: <span className="text-primary-color font-black">{config?.referral_code}</span></p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border font-black text-sm tracking-widest uppercase flex items-center gap-2 ${config?.tier === 'gold' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-slate-400/10 border-slate-400/20 text-slate-400'}`}>
              <FaUserGraduate className="text-base" />
              {config?.tier || 'SILVER'}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card: Link */}
          <div className="soft-card p-6 border-white/5 bg-gradient-to-br from-primary-color/5 to-transparent flex flex-col justify-between">
            <div className="mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-color/10 flex items-center justify-center text-primary-color mb-4">
                <FaLink />
              </div>
              <h3 className="text-white font-bold text-lg">Tu Enlace de Comunidad</h3>
              <p className="text-gray-500 text-sm mt-1">Usa este enlace para que tus alumnos hereden tus beneficios.</p>
            </div>

            <button
              onClick={copyToClipboard}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-black text-xs tracking-widest uppercase hover:bg-white/10 transition-all active:scale-95 group"
            >
              {copied ? (
                <>
                  <FaCheckCircle className="text-emerald-500" /> ¡LINK COPIADO!
                </>
              ) : (
                <>
                  COPIAR LINK <FaCopy className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Card: Paid History */}
          <div className="soft-card p-6 border-white/5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
              <FaCoins />
            </div>
            <h3 className="text-white font-bold text-lg">Histórico de Cobros</h3>
            <p className="text-3xl font-black text-white mt-2 tracking-tighter">
              ${(config?.balance_paid || 0).toLocaleString('es-CO')}
            </p>
            <div className="mt-4 flex items-center gap-2 text-gray-600 text-[10px] font-black uppercase tracking-widest">
              <FaInfoCircle />
              Las comisiones se liquidan al cierre de mes
            </div>
          </div>

          {/* Card: Progression */}
          <div className="soft-card p-6 border-white/5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
              <FaChartBar />
            </div>
            <h3 className="text-white font-bold text-lg">Alumnos Activos</h3>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-3xl font-black text-white tracking-tighter">{activeCount}</span>
              <span className="text-gray-500 text-xs font-bold mb-1">Próximo Nivel: 21</span>
            </div>
            {/* Progress Bar */}
            <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-color to-amber-500 transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Alumnos Table */}
        <div className="soft-card overflow-hidden border-white/5">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-color/10 flex items-center justify-center text-primary-color">
                <FaUsers />
              </div>
              <h2 className="text-white font-bold tracking-tight">Mis Alumnos ({referrals.length})</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Alumno</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Registrado</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/5 flex items-center justify-center text-gray-400">
                          <FaUserCircle />
                        </div>
                        <span className="text-white font-bold text-sm tracking-tight">{ref.profiles?.name || 'Invitado'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-gray-500 text-xs font-medium">{ref.profiles?.email}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-gray-500 text-xs">{new Date(ref.created_at).toLocaleDateString('es-CO')}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        {ref.status === 'active' ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                            ACTIVO
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-600 text-[10px] font-black uppercase tracking-widest">
                            REGISTRADO
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {referrals.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-600 font-bold uppercase tracking-widest text-[10px]">Aún no tienes alumnos registrados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
