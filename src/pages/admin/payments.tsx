import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaMoneyBillWave, FaChartLine, FaHistory, FaCrown, FaBolt, FaUser, FaRegCalendarAlt, FaSearch, FaUsers, FaMagic } from 'react-icons/fa';
import Head from 'next/head';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useAppContext } from '../../contexts/AppContext';
import { adminService } from '../../services/database/adminService';
import PageHeader from '../../components/common/PageHeader';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

export default function PaymentsDashboard() {
  const { isSuperAdmin } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    totalRevenue: number;
    revenueByPlan: Record<string, number>;
    recentPayments: any[];
    dailyRevenue: { date: string, amount: number }[];
    userStats: { total: number, active: number, free: number };
    generationStats: { total: number };
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const analytics = await adminService.getPaymentAnalytics();
      setData(analytics);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (!isSuperAdmin()) {
    return (
      <ProtectedRoute adminOnly={true}>
        <div className="flex items-center justify-center h-screen">
          <p className="text-theme-secondary">Cargando...</p>
        </div>
      </ProtectedRoute>
    );
  }

  const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#F43F5E'];
  const planData = data ? Object.entries(data.revenueByPlan).map(([name, value]) => ({ name, value })) : [];

  return (
    <ProtectedRoute adminOnly={true}>
      <DashboardLayout>
        <Head>
          <title>DROPAPP - Dashboard de Pagos</title>
        </Head>

        <div className="max-w-7xl mx-auto pb-12">
          <PageHeader
            title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-color/10 flex items-center justify-center text-primary-color shadow-lg shadow-primary-color/5">
                  <FaChartLine />
                </div>
                Dashboard de Pagos
              </div>
            }
            description="Visualiza el rendimiento financiero y el historial de transacciones en tiempo real."
            backLink="/admin"
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color"></div>
              <p className="mt-4 text-theme-tertiary font-medium">Sincronizando finanzas...</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

              {/* KPIs Primarios */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPIComponent
                  icon={<FaMoneyBillWave className="text-green-500" />}
                  label="Ingresos Totales"
                  value={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(data?.totalRevenue || 0)}
                  subLabel="Acumulado histórico"
                />
                <KPIComponent
                  icon={<FaUsers className="text-blue-500" />}
                  label="Usuarios Totales"
                  value={data?.userStats.total || 0}
                  subText={
                    <div className="flex gap-2 items-center mt-1">
                      <span className="text-green-400 font-black text-[9px] uppercase">● {data?.userStats.active} PRO</span>
                      <span className="text-gray-500 font-bold text-[9px] uppercase opacity-60">● {data?.userStats.free} FREE</span>
                    </div>
                  }
                />
                <KPIComponent
                  icon={<FaMagic className="text-amber-500" />}
                  label="Generaciones"
                  value={new Intl.NumberFormat('es-CO').format(data?.generationStats.total || 0)}
                  subLabel="Total de creaciones"
                />
                <KPIComponent
                  icon={<FaBolt className="text-purple-500" />}
                  label="Ticket Promedio"
                  value={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format((data?.totalRevenue || 0) / (data?.recentPayments.length || 1))}
                  subLabel="Valor x transacción"
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Trend Chart */}
                <div className="lg:col-span-2 bg-theme-component border border-theme-border rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <FaChartLine className="text-8xl text-primary-color" />
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary-color animate-pulse" />
                    Tendencia de Ingresos
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data?.dailyRevenue || []}>
                        <defs>
                          <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                          dataKey="date"
                          stroke="#4B5563"
                          fontSize={10}
                          tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        />
                        <YAxis stroke="#4B5563" fontSize={10} tickFormatter={(val) => `$${val / 1000}k`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                          labelStyle={{ color: '#9CA3AF', fontWeight: 'bold' }}
                          itemStyle={{ color: '#FFF' }}
                        />
                        <Area type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Plan Distribution Chart */}
                <div className="bg-theme-component border border-theme-border rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                  <h3 className="text-lg font-black text-white uppercase tracking-widest mb-8">Reparto por Plan</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={planData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {planData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {planData.map((p, i) => (
                      <div key={p.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-theme-secondary uppercase font-bold">{p.name}</span>
                        </div>
                        <span className="text-white font-black">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(p.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-theme-component border border-theme-border rounded-[2rem] p-8 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Historial de Transacciones</h3>
                    <p className="text-xs text-theme-tertiary font-bold uppercase tracking-widest mt-1">Últimos movimientos registrados</p>
                  </div>
                  <div className="relative w-full md:w-64">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-tertiary" />
                    <input
                      type="text"
                      placeholder="Buscar transacción..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-primary-color/50 transition-all font-medium"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="px-4 py-4 text-[10px] font-black text-theme-tertiary uppercase tracking-[0.2em]">Usuario</th>
                        <th className="px-4 py-4 text-[10px] font-black text-theme-tertiary uppercase tracking-[0.2em]">Plan / Monto</th>
                        <th className="px-4 py-4 text-[10px] font-black text-theme-tertiary uppercase tracking-[0.2em]">Referencia</th>
                        <th className="px-4 py-4 text-[10px] font-black text-theme-tertiary uppercase tracking-[0.2em]">Método</th>
                        <th className="px-4 py-4 text-[10px] font-black text-theme-tertiary uppercase tracking-[0.2em]">Fecha</th>
                        <th className="px-4 py-4 text-[10px] font-black text-theme-tertiary uppercase tracking-[0.2em] text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {data?.recentPayments.filter(p =>
                        p.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.external_reference?.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((payment) => (
                        <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-4 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-primary-color/10 flex items-center justify-center text-primary-color">
                                <FaUser size={12} />
                              </div>
                              <div>
                                <p className="text-sm font-black text-white uppercase">{payment.profiles?.name || 'Desconocido'}</p>
                                <p className="text-[10px] font-bold text-theme-tertiary lowercase">{payment.profiles?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-5 font-black">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-amber-500 uppercase tracking-widest">{payment.plan_key}</span>
                              <span className="text-white">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(payment.amount)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <span className="text-[10px] font-black text-theme-tertiary uppercase font-mono break-all line-clamp-1">{payment.external_reference}</span>
                          </td>
                          <td className="px-4 py-5">
                            <span className="text-[10px] px-2 py-1 rounded-lg bg-white/5 text-theme-secondary font-black uppercase">{payment.payment_method}</span>
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex items-center gap-2 text-[10px] font-black text-theme-tertiary uppercase">
                              <FaRegCalendarAlt className="opacity-40" />
                              {new Date(payment.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-4 py-5 text-right">
                            <span className="px-2 py-1 rounded-full text-[9px] font-black uppercase bg-green-500/10 text-green-400 border border-green-500/20">
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function KPIComponent({ icon, label, value, subLabel, subText }: any) {
  return (
    <div className="bg-theme-component border border-theme-border p-6 rounded-[2rem] shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden group">
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
        {React.cloneElement(icon, { size: 100 })}
      </div>
      <div className="flex flex-col gap-1 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner">
            {icon}
          </div>
          <div className="w-2 h-2 rounded-full bg-primary-color animate-pulse shadow-[0_0_10px_#3B82F6]" />
        </div>
        <span className="text-[10px] font-black text-theme-tertiary uppercase tracking-[0.2em]">{label}</span>
        <span className="text-xl font-black text-white tracking-tighter">{value}</span>
        {subLabel && <span className="text-[9px] font-bold text-theme-tertiary uppercase opacity-60 mt-2">{subLabel}</span>}
        {subText}
      </div>
    </div>
  );
}
