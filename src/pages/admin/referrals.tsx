import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  FaArrowRight, FaUserCircle, FaUserPlus, FaSync, FaChartLine,
  FaUsers, FaMoneyBillWave, FaShieldAlt, FaGem,
  FaUserGraduate, FaInfoCircle, FaSearch, FaCheckCircle
} from 'react-icons/fa';
import Head from 'next/head';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { supabase } from '../../lib/supabase';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

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
  const [globalSales, setGlobalSales] = useState<any[]>([]);

  useEffect(() => {
    fetchMentors();
    fetchGlobalStats();
  }, []);

  const fetchGlobalStats = async () => {
    try {
      // Cargar todas las comisiones de los últimos 30 días para la gráfica global
      const { data } = await supabase
        .from('referral_commissions')
        .select('created_at, sale_amount')
        .order('created_at', { ascending: true });

      if (data) setGlobalSales(data);
    } catch (err) {
      console.error('Error fetching global stats:', err);
    }
  };

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

  const chartData = useMemo(() => {
    const days: Record<string, number> = {};
    const last15Days = Array.from({ length: 15 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (14 - i));
      return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
    });

    last15Days.forEach(day => days[day] = 0);

    globalSales.forEach(sale => {
      const day = new Date(sale.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
      if (days[day] !== undefined) {
        days[day] += Number(sale.sale_amount);
      }
    });

    return Object.entries(days).map(([name, total]) => ({ name, total }));
  }, [globalSales]);

  const totalGrossSales = globalSales.reduce((acc, s) => acc + Number(s.sale_amount), 0);
  const totalPendingCommissions = mentors.reduce((acc, m) => acc + (m.pending_sales_volume * (m.tier === 'gold' ? 0.20 : 0.15)), 0);

  return (
    <ProtectedRoute adminOnly={true}>
      <DashboardLayout>
        <Head>
          <title>DROPAPP ADMIN - Gestión de Mentores</title>
        </Head>
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-primary-color/20 text-primary-color text-[9px] font-black uppercase tracking-widest">Control Center</span>
                <div className="h-px w-8 bg-white/10"></div>
                <FaShieldAlt className="text-gray-600 text-xs" />
              </div>
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
                Gestión de <span className="text-primary-color">Referidos</span>
              </h1>
            </div>
            <button
              onClick={() => { fetchMentors(); fetchGlobalStats(); }}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Global Metrics & Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 soft-card p-8 border-white/5 bg-black/40 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <FaChartLine className="text-9xl text-primary-color" />
              </div>
              <div className="flex items-start justify-between relative z-10 mb-8">
                <div>
                  <h3 className="text-white font-black text-xl uppercase tracking-tight">Rendimiento de la Plataforma</h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Ventas brutas generadas por referidos (15 días)</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black text-white tracking-tighter block leading-none">
                    ${totalGrossSales.toLocaleString('es-CO')}
                  </span>
                  <span className="text-[10px] font-black text-primary-color uppercase tracking-widest block mt-1">Volumen Total</span>
                </div>
              </div>

              <div className="h-[200px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 'bold' }}
                      dy={10}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'black', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                      itemStyle={{ color: 'var(--primary-color)', fontWeight: 'black' }}
                    />
                    <Area type="monotone" dataKey="total" stroke="var(--primary-color)" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="soft-card p-6 border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent flex flex-col justify-between h-full group hover:border-emerald-500/20 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                    <FaMoneyBillWave className="text-xl" />
                  </div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Liquidación Pendiente</span>
                </div>
                <h3 className="text-white font-black text-3xl tracking-tighter tabular-nums">
                  ${totalPendingCommissions.toLocaleString('es-CO')}
                </h3>
                <p className="text-emerald-500 text-[9px] font-black uppercase mt-2 tracking-widest flex items-center gap-1">
                  <FaInfoCircle /> Debe liquidarse al final del mes
                </p>
              </div>

              <div className="soft-card p-6 border-white/5 bg-gradient-to-br from-primary-color/10 to-transparent flex flex-col justify-between h-full group hover:border-primary-color/20 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-color/10 flex items-center justify-center text-primary-color group-hover:scale-110 transition-transform">
                    <FaUsers className="text-xl" />
                  </div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mentores Activos</span>
                </div>
                <h3 className="text-white font-black text-3xl tracking-tighter tabular-nums">
                  {mentors.length}
                </h3>
                <div className="flex gap-4 mt-2">
                  <div className="text-[9px] font-black uppercase text-amber-500 flex items-center gap-1">
                    <FaGem className="text-[8px]" /> {mentors.filter(m => m.tier === 'gold').length} Gold
                  </div>
                  <div className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1">
                    <FaUserGraduate className="text-[8px]" /> {mentors.filter(m => m.tier === 'silver').length} Silver
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activation Panel */}
          <div className="soft-card p-8 border-white/5 bg-white/[0.01] relative !overflow-visible group">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary-color/10 flex items-center justify-center text-primary-color shadow-[0_0_15px_rgba(18,216,250,0.2)]">
                <FaUserPlus />
              </div>
              <h3 className="text-white font-black text-lg uppercase tracking-tight">Activar Nuevo Mentor</h3>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <FaSearch className="text-xs" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por email o nombre..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-10 pr-4 py-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-primary-color/50 focus:bg-white/[0.05] transition-all"
                  value={searchTerm}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                />

                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-[#0A0D12] border border-white/10 rounded-2xl mt-3 z-[100] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden max-h-60 overflow-y-auto backdrop-blur-3xl animate-in fade-in slide-in-from-top-2">
                    {searchResults.map(user => (
                      <div
                        key={user.id}
                        className="px-6 py-4 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 flex justify-between items-center group/item transition-colors"
                        onClick={() => setSelectedUser(user)}
                      >
                        <div>
                          <p className="text-white text-[10px] font-black uppercase tracking-wider">{user.name}</p>
                          <p className="text-gray-500 text-[9px] font-bold">{user.email}</p>
                        </div>
                        <FaArrowRight className="text-gray-600 text-[10px] group-hover/item:translate-x-1 group-hover/item:text-primary-color transition-all" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedUser && (
                <div className="flex flex-col md:flex-row gap-3 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center gap-3 px-4 py-2 border border-primary-color/20 bg-primary-color/5 rounded-2xl">
                    <div className="w-8 h-8 rounded-full bg-primary-color/20 flex items-center justify-center text-primary-color">
                      <FaCheckCircle className="text-xs" />
                    </div>
                    <div className="pr-4">
                      <span className="text-[8px] font-black text-primary-color uppercase block">Seleccionado</span>
                      <span className="text-white text-[10px] font-black uppercase truncate max-w-[120px]">{selectedUser.name}</span>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Código (ej: comunidad-x)"
                    className="flex-1 bg-white/[0.03] border border-primary-color/30 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-[0.2em] outline-none focus:border-primary-color transition-all"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                  />
                  <button
                    onClick={activateMentor}
                    disabled={isActivating || !customCode}
                    className="px-8 rounded-2xl bg-primary-color text-black font-black text-[10px] tracking-[0.2em] uppercase hover:scale-[1.02] active:scale-95 disabled:opacity-20 transition-all shadow-[0_0_20px_rgba(18,216,250,0.2)]"
                  >
                    {isActivating ? 'Cargando...' : 'Activar Código'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mentors Table */}
          <div className="soft-card border-white/5 bg-black/20 overflow-hidden shadow-2xl relative">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <FaUsers className="text-primary-color" /> Gestión de Mentores
                </h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Control de comisiones y liquidaciones por individuo</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.03]">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Mentor / Comunidad</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Rango</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Alumnos (Act/Tot)</th>
                    <th className="px-8 py-5 text-[10px] font-black text-primary-color uppercase tracking-widest text-right">Ventas Pend.</th>
                    <th className="px-8 py-5 text-[10px] font-black text-emerald-500 uppercase tracking-widest text-right">Liquidación</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {mentors.map(m => {
                    const commission = Math.round(m.pending_sales_volume * (m.tier === 'gold' ? 0.20 : 0.15));

                    return (
                      <tr key={m.user_id} className="hover:bg-white/[0.02] transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center text-gray-400 group-hover:border-primary-color/50 transition-colors">
                              <FaUserCircle className="text-lg" />
                            </div>
                            <div>
                              <span className="text-white font-black text-sm block tracking-tight uppercase leading-tight">{m.name}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-1.5 py-0.5 rounded bg-white/5 text-primary-color font-mono text-[9px] font-bold">{m.referral_code}</span>
                                <span className="text-gray-600 text-[9px] font-bold lowercase">{m.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-center">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${m.tier === 'gold' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                              {m.tier}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-black text-base leading-none tabular-nums">{m.active_refs}</span>
                              <span className="text-gray-600 text-xs font-bold">/ {m.total_refs}</span>
                            </div>
                            {/* Mini progress bar */}
                            <div className="w-16 h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                              <div className="h-full bg-primary-color" style={{ width: `${(m.active_refs / (m.total_refs || 1)) * 100}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="text-white font-black text-base tabular-nums leading-none">
                            ${m.pending_sales_volume.toLocaleString('es-CO')}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-emerald-500 font-black text-base tabular-nums leading-none">
                              ${commission.toLocaleString('es-CO')}
                            </span>
                            <span className="text-[8px] text-gray-600 font-black uppercase mt-1">{(m.tier === 'gold' ? '20%' : '15%')} del volumen</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button
                            onClick={() => liquidatePeriod(m.user_id)}
                            disabled={m.pending_sales_volume === 0}
                            className="px-6 py-3 rounded-xl bg-emerald-500 text-black font-black text-[9px] uppercase tracking-widest hover:scale-[1.05] active:scale-95 disabled:opacity-5 disabled:hover:scale-100 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                          >
                            Liquidar Corte
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {mentors.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center opacity-30">
                          <FaUsers className="text-6xl mb-4" />
                          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">Sin mentores activos en el sistema</span>
                        </div>
                      </td>
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
