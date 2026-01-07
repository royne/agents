import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useRouter } from 'next/router';
import { useAppContext } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';
import {
  FaUserGraduate, FaCoins, FaLink, FaCopy, FaCheckCircle,
  FaUsers, FaChartBar, FaUserCircle, FaInfoCircle,
  FaCalendarAlt, FaMoneyBillWave, FaArrowRight, FaGem
} from 'react-icons/fa';
import { ReferralConfig, Referral, ReferralCommission } from '../types/database';
import { trackPixelEvent } from '../utils/pixelEvents';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

export default function ReferralsPage() {
  const router = useRouter();
  const { authData } = useAppContext();
  const [isMentor, setIsMentor] = useState(false);
  const [config, setConfig] = useState<ReferralConfig | null>(null);
  const [sales, setSales] = useState<any[]>([]);
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
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_mentor')
        .eq('user_id', authData?.userId)
        .single();

      setIsMentor(!!profile?.is_mentor);

      if (profile?.is_mentor) {
        const { data: configData } = await supabase
          .from('referral_configs')
          .select('*')
          .eq('user_id', authData?.userId)
          .single();

        if (configData) setConfig(configData);

        const { data: refsData } = await supabase
          .from('referrals')
          .select(`
            *,
            profiles:referred_id (name, email)
          `)
          .eq('mentor_id', authData?.userId)
          .order('created_at', { ascending: false });

        if (refsData && refsData.length > 0) {
          setReferrals(refsData as any);

          // Cargar Comisiones (Ventas)
          const { data: commsData } = await supabase
            .from('referral_commissions')
            .select(`
              *,
              referral:referral_id (
                referred_id,
                created_at,
                profiles:referred_id (name, email)
              )
            `)
            .in('referral_id', refsData.map(r => r.id))
            .order('created_at', { ascending: false });

          if (commsData) setSales(commsData);
        }
      }
    } catch (err) {
      console.error('Error cargando datos de referidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    const days: Record<string, number> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
    });

    last7Days.forEach(day => days[day] = 0);

    sales.forEach(sale => {
      const day = new Date(sale.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
      if (days[day] !== undefined) {
        days[day] += Number(sale.sale_amount);
      }
    });

    return Object.entries(days).map(([name, total]) => ({ name, total }));
  }, [sales]);

  const commissionRate = config?.tier === 'gold' ? 0.20 : 0.15;
  const pendingGain = sales
    .filter(s => s.status === 'pending')
    .reduce((acc, s) => acc + (Number(s.sale_amount) * commissionRate), 0);

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
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header Premium */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-primary-color/20 text-primary-color text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Mentor Portal</span>
              <div className="h-px w-8 bg-white/10"></div>
              <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Comunidad {config?.referral_code}</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
              Panel de <span className="text-primary-color">Mentor</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Tu Rango Actual</span>
              <div className={`px-4 py-2 rounded-xl border font-black text-sm tracking-widest uppercase flex items-center gap-2 shadow-lg transition-transform hover:scale-105 ${config?.tier === 'gold' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-amber-500/5' : 'bg-slate-400/10 border-slate-400/20 text-slate-400 shadow-slate-400/5'}`}>
                {config?.tier === 'gold' ? <FaGem className="text-base" /> : <FaUserGraduate className="text-base" />}
                {config?.tier || 'SILVER'}
              </div>
            </div>
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 soft-card p-6 border-white/5 bg-gradient-to-br from-primary-color/10 to-transparent flex flex-col justify-between group h-full">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary-color/20 flex items-center justify-center text-primary-color mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <FaLink className="text-xl" />
              </div>
              <h3 className="text-white font-black text-lg uppercase tracking-tight">Enlace VIP</h3>
              <p className="text-gray-500 text-xs mt-2 leading-relaxed">Invita a tus alumnos para heredar beneficios exclusivos.</p>
            </div>

            <button
              onClick={copyToClipboard}
              className="mt-8 w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-primary-color text-black font-black text-[10px] tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(18,216,250,0.2)]"
            >
              {copied ? (
                <> <FaCheckCircle /> COPIADO </>
              ) : (
                <> COPIAR LINK <FaCopy /> </>
              )}
            </button>
          </div>

          <div className="md:col-span-3 soft-card p-7 border-white/5 flex flex-col justify-between relative overflow-hidden bg-black/40 backdrop-blur-xl">
            <div className="flex items-start justify-between relative z-10 mb-4">
              <div>
                <h3 className="text-white font-black text-lg uppercase tracking-tight">Rendimiento de Ventas</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Últimos 7 días</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Ventas Totales</span>
                <span className="text-2xl font-black text-white tracking-tighter block leading-none">
                  ${sales.reduce((acc, s) => acc + Number(s.sale_amount), 0).toLocaleString('es-CO')}
                </span>
              </div>
            </div>

            <div className="h-[120px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="total" stroke="var(--primary-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="soft-card p-8 border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <FaCoins className="text-xl" />
              </div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Cobrado</span>
            </div>
            <h3 className="text-white font-black text-3xl tracking-tighter">
              ${(config?.balance_paid || 0).toLocaleString('es-CO')}
            </h3>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-1">
              <FaCheckCircle className="text-emerald-500/50" /> Histórico pagado
            </p>
          </div>

          <div className="soft-card p-8 border-white/5 hover:border-white/10 transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <FaMoneyBillWave className="text-6xl text-primary-color -rotate-12" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-color/10 flex items-center justify-center text-primary-color">
                <FaMoneyBillWave className="text-xl" />
              </div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Por Cobrar</span>
            </div>
            <h3 className="text-white font-black text-3xl tracking-tighter">
              ${pendingGain.toLocaleString('es-CO')}
            </h3>
            <p className="text-primary-color text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-1">
              <FaInfoCircle className="animate-pulse" /> Estimado al cierre ({(commissionRate * 100)}%)
            </p>
          </div>

          <div className="soft-card p-8 border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <FaUsers className="text-xl" />
              </div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Comunidad</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-white font-black text-3xl tracking-tighter">{activeCount}</h3>
              <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Alumnos Activos</span>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                <span className="text-amber-500">Nivel Siguiente</span>
                <span className="text-white">{activeCount} / 21 Alumnos</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Sales Table */}
        <div className="soft-card border-white/5 bg-black/20 overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <FaMoneyBillWave className="text-primary-color" /> Detalle de Ventas
              </h2>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Monitoreo de comisiones generadas por tu comunidad</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.03]">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Alumno</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Monto Plan</th>
                  <th className="px-8 py-5 text-[10px] font-black text-primary-color uppercase tracking-widest">Tu Comisión</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Registrado</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Fecha Pago</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sales.map((sale) => {
                  const gain = Number(sale.sale_amount) * commissionRate;
                  const regDate = new Date(sale.referral?.created_at).toLocaleDateString();
                  const saleDate = new Date(sale.created_at).toLocaleDateString();

                  return (
                    <tr key={sale.id} className="hover:bg-white/[0.02] transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center text-gray-400 group-hover:border-primary-color/50 transition-colors">
                            <FaUserCircle className="text-lg" />
                          </div>
                          <div>
                            <span className="text-white font-black text-sm block tracking-tight uppercase">{sale.referral?.profiles?.name || 'Alumno'}</span>
                            <span className="text-gray-500 text-[9px] font-bold block uppercase">{sale.referral?.profiles?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-white font-bold text-sm leading-none tabular-nums">${Number(sale.sale_amount).toLocaleString('es-CO')}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className="text-primary-color font-black text-base tabular-nums">${gain.toLocaleString('es-CO')}</span>
                          <span className="bg-primary-color/10 text-primary-color text-[8px] font-black px-1.5 py-0.5 rounded">{(commissionRate * 100)}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-gray-500 text-xs font-bold font-mono">{regDate}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-white text-xs font-black font-mono">{saleDate}</span>
                          <span className="text-[8px] text-gray-600 font-black uppercase tracking-tighter">Procesado</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex justify-center">
                          {sale.status === 'pending' ? (
                            <div className="flex flex-col items-center">
                              <span className="px-3 py-1 rounded-lg bg-primary-color/10 border border-primary-color/20 text-primary-color text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-primary-color animate-pulse"></div>
                                Por Liquidar
                              </span>
                              <span className="text-[7px] text-gray-600 font-bold uppercase mt-1">Cierre de mes</span>
                            </div>
                          ) : (
                            <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                              <FaCheckCircle className="text-[10px]" />
                              Pagado
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {sales.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <FaChartBar className="text-5xl mb-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Sin movimientos financieros</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <FaInfoCircle />
          </div>
          <div>
            <p className="text-[10px] font-black text-white uppercase tracking-widest">Información de Liquidación</p>
            <p className="text-gray-500 text-[9px] font-medium leading-relaxed mt-1">
              Las comisiones se totalizan y liquidan automáticamente entre los días 1 y 5 de cada mes.
              Asegúrate de tener configurado tu método de pago en el perfil para evitar retrasos.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
