import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaChevronRight, FaUserPlus, FaSync } from 'react-icons/fa';
import Head from 'next/head';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { supabase } from '../../lib/supabase';
import PageHeader from '../../components/common/PageHeader';

interface MentorMetric {
  user_id: string;
  name: string;
  email: string;
  referral_code: string;
  tier: 'silver' | 'gold';
  total_refs: number;
  active_refs: number;
  pending_sales_volume: number;
  balance_paid: number;
}

export default function AdminReferrals() {
  const [mentors, setMentors] = useState<MentorMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string, email: string, name: string }[]>([]);
  const [isActivating, setIsActivating] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string, email: string, name: string } | null>(null);
  const [customCode, setCustomCode] = useState('');

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      // Obtenemos los configs de mentores
      const { data: configs, error: configError } = await supabase
        .from('referral_configs')
        .select(`
          user_id,
          referral_code,
          tier,
          balance_paid,
          profiles:user_id (name, email)
        `);

      if (configError) throw configError;

      // Para cada mentor, calculamos métricas "en caliente"
      const metrics: MentorMetric[] = await Promise.all((configs || []).map(async (c: any) => {
        // 1. Contar alumnos (total y activos)
        const { data: refs } = await supabase
          .from('referrals')
          .select('status')
          .eq('mentor_id', c.user_id);

        const total = refs?.length || 0;
        const active = refs?.filter(r => r.status === 'active').length || 0;

        // 2. Sumar volumen de ventas pendiente
        const { data: commissions } = await supabase
          .from('referral_commissions')
          .select('sale_amount')
          .filter('referral_id', 'in', `(${(refs || []).map(r => (r as any).id || '').join(',')})`) // Nota: Simplificado, mejor usar join
          .eq('status', 'pending');

        // En lugar de un filter complejo, vamos a usar una query mejor
        const { data: pendingSales } = await supabase.rpc('get_mentor_pending_sales', { p_mentor_id: c.user_id });

        return {
          user_id: c.user_id,
          name: c.profiles?.name || 'Sin Nombre',
          email: c.profiles?.email,
          referral_code: c.referral_code,
          tier: c.tier,
          total_refs: total,
          active_refs: active,
          pending_sales_volume: pendingSales || 0,
          balance_paid: c.balance_paid
        };
      }));

      setMentors(metrics);
    } catch (err) {
      console.error('Error fetching mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 3) {
      setSearchResults([]);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('user_id, email, name')
      .or(`email.ilike.%${term}%,name.ilike.%${term}%`)
      .eq('is_mentor', false)
      .limit(5);

    setSearchResults(data?.map(d => ({ id: d.user_id, email: d.email, name: d.name })) || []);
  };

  const activateMentor = async () => {
    if (!selectedUser || !customCode) return;
    setIsActivating(true);

    try {
      // 1. Marcar como mentor en profiles
      await supabase.from('profiles').update({ is_mentor: true }).eq('user_id', selectedUser.id);

      // 2. Crear config
      const { error } = await supabase.from('referral_configs').insert({
        user_id: selectedUser.id,
        referral_code: customCode.toLowerCase().trim(),
        tier: 'silver'
      });

      if (error) alert('Error al crear código: Tal vez ya existe.');
      else {
        setSelectedUser(null);
        setCustomCode('');
        setSearchTerm('');
        setSearchResults([]);
        fetchMentors();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsActivating(false);
    }
  };

  const liquidatePeriod = async (mentorId: string) => {
    if (!window.confirm('¿Confirmas que has realizado el pago y quieres liquidar este periodo?')) return;

    const { data: amount, error } = await supabase.rpc('liquidate_mentor_period', { p_mentor_id: mentorId });

    if (error) {
      alert('Error liquidando: ' + error.message);
    } else {
      alert(`Liquidación exitosa. Se registraron $${amount.toLocaleString()} en el histórico.`);
      fetchMentors();
    }
  };

  return (
    <ProtectedRoute adminOnly={true}>
      <DashboardLayout>
        <Head>
          <title>DROPAPP - Gestión de Mentores</title>
        </Head>
        <div className="space-y-8">
          <PageHeader
            title="SISTEMA DE REFERIDOS"
            description="Control de mentores, códigos de comunidad y liquidaciones mensuales."
          />

          {/* Sección de Activación */}
          <div className="soft-card p-6 border-white/5 bg-white/[0.01] relative z-30 !overflow-visible">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <FaUserPlus className="text-primary-color" /> ACTIVAR NUEVO MENTOR
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar usuario por email o nombre..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-color transition-colors"
                  value={searchTerm}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-[#0D1117] border border-white/10 rounded-xl mt-2 z-50 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden max-h-60 overflow-y-auto">
                    {searchResults.map(user => (
                      <div
                        key={user.id}
                        className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 flex justify-between items-center group"
                        onClick={() => setSelectedUser(user)}
                      >
                        <div>
                          <p className="text-white text-xs font-bold">{user.name}</p>
                          <p className="text-gray-500 text-[10px]">{user.email}</p>
                        </div>
                        <FaChevronRight className="text-gray-600 text-[10px] group-hover:translate-x-1 transition-transform" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedUser && (
                <div className="flex gap-3 animate-in fade-in slide-in-from-top-2">
                  <input
                    type="text"
                    placeholder="Código de Comunidad (ej: elite-vip)"
                    className="flex-1 bg-white/[0.03] border border-primary-color/30 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-color"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                  />
                  <button
                    onClick={activateMentor}
                    disabled={isActivating || !customCode}
                    className="px-6 rounded-xl bg-primary-color text-white font-bold text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    {isActivating ? '...' : 'ACTIVAR'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Lista de Mentores */}
          <div className="soft-card overflow-hidden border-white/5">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-white font-bold">Resumen de Mentores</h3>
              <button
                onClick={fetchMentors}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <FaSync className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Mentor</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Código</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Alumnos (Act/Tot)</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Ventas Pendientes</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Nivel</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {mentors.map(m => (
                    <tr key={m.user_id} className="hover:bg-white/[0.01]">
                      <td className="px-6 py-4">
                        <p className="text-white font-bold text-sm">{m.name}</p>
                        <p className="text-gray-500 text-[10px]">{m.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded bg-white/5 text-primary-color font-mono text-xs">{m.referral_code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-500 font-bold">{m.active_refs}</span>
                          <span className="text-gray-600">/</span>
                          <span className="text-gray-400">{m.total_refs}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-white font-bold">${m.pending_sales_volume.toLocaleString()}</p>
                        <p className="text-emerald-500 text-[9px] font-black uppercase">
                          EST. COMISIÓN: ${Math.round(m.pending_sales_volume * (m.tier === 'gold' ? 0.20 : 0.15)).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${m.tier === 'gold' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                            {m.tier}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => liquidatePeriod(m.user_id)}
                          disabled={m.pending_sales_volume === 0}
                          className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-widest hover:opacity-90 disabled:opacity-20 transition-all"
                        >
                          LIQUIDAR
                        </button>
                      </td>
                    </tr>
                  ))}
                  {mentors.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-600 font-bold tracking-widest text-xs uppercase italic">No hay mentores registrados aún</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
