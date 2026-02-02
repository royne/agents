import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  FaTicketAlt, FaPlus, FaTrash, FaEdit, FaPowerOff,
  FaSpinner, FaCheckCircle, FaExclamationCircle, FaSearch, FaTag
} from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import PageHeader from '../../components/common/PageHeader';
import { adminService } from '../../services/database/adminService';
import { PLAN_NAMES } from '../../constants/plans';

const CouponAdmin: React.FC = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    plan_key: '',
    max_uses: 100,
    expires_at: '',
    is_active: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCoupons();
      setCoupons(data);
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const payload = {
      ...formData,
      code: formData.code.toUpperCase().trim(),
      plan_key: formData.plan_key === '' ? null : formData.plan_key,
      expires_at: formData.expires_at === '' ? null : formData.expires_at
    };

    let success = false;
    try {
      if (editingCoupon) {
        success = await adminService.updateCoupon(editingCoupon.id, payload);
      } else {
        success = await adminService.createCoupon(payload);
      }

      if (success) {
        setShowModal(false);
        setEditingCoupon(null);
        setFormData({
          code: '',
          type: 'percentage',
          value: 0,
          plan_key: '',
          max_uses: 100,
          expires_at: '',
          is_active: true
        });
        fetchCoupons();
      } else {
        alert('Error guardando el cupón. Verifica que el código no esté duplicado.');
      }
    } catch (err) {
      console.error('Error in handleCreateOrUpdate:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este cupón?')) {
      const success = await adminService.deleteCoupon(id);
      if (success) fetchCoupons();
    }
  };

  const toggleStatus = async (coupon: any) => {
    const success = await adminService.updateCoupon(coupon.id, { is_active: !coupon.is_active });
    if (success) fetchCoupons();
  };

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute adminOnly={true}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto pb-12 font-sans">
          <Head>
            <title>DROPAPP - Gestión de Cupones</title>
          </Head>

          {/* Header Section */}
          <PageHeader
            title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-color/10 flex items-center justify-center text-primary-color shadow-lg shadow-primary-color/5">
                  <FaTag />
                </div>
                Gestión de Cupones
              </div>
            }
            description="Administra tus campañas de promoción, descuentos y créditos adicionales."
            backLink="/admin"
          />

          {/* Action Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <div className="relative w-full md:w-96">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-tertiary" />
              <input
                type="text"
                placeholder="Buscar por código (ej: PROMO10)..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white outline-none focus:border-primary-color/50 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                setEditingCoupon(null);
                setFormData({
                  code: '', type: 'percentage', value: 0, plan_key: '', max_uses: 100, expires_at: '', is_active: true
                });
                setShowModal(true);
              }}
              className="w-full md:w-auto bg-primary-color hover:bg-primary-color/80 text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary-color/20"
            >
              <FaPlus /> Crear Cupón
            </button>
          </div>

          {/* Loader or Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color"></div>
              <p className="mt-4 text-theme-tertiary font-medium">Sincronizando cupones...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {filteredCoupons.length > 0 ? filteredCoupons.map(coupon => (
                <div key={coupon.id} className={`group relative bg-theme-component border rounded-[2rem] p-8 transition-all duration-300 hover:scale-[1.02] shadow-2xl ${coupon.is_active ? 'border-theme-border hover:border-primary-color/30' : 'border-rose-500/20 grayscale opacity-80'}`}>

                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-black tracking-tighter text-white group-hover:text-primary-color transition-colors">
                        {coupon.code}
                      </h3>
                      <span className="text-[10px] font-black uppercase text-primary-color tracking-[0.2em]">
                        {coupon.type === 'percentage' ? `${coupon.value}% OFF` :
                          coupon.type === 'fixed_amount' ? `$${coupon.value} USD OFF` :
                            `+${coupon.value} CRÉDITOS`}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleStatus(coupon)}
                        className={`p-3 rounded-xl transition-all ${coupon.is_active ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-lg shadow-emerald-500/5' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 shadow-lg shadow-rose-500/5'}`}
                        title={coupon.is_active ? 'Desactivar' : 'Activar'}
                      >
                        <FaPowerOff size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingCoupon(coupon);
                          setFormData({
                            code: coupon.code,
                            type: coupon.type,
                            value: coupon.value,
                            plan_key: coupon.plan_key || '',
                            max_uses: coupon.max_uses,
                            expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : '',
                            is_active: coupon.is_active
                          });
                          setShowModal(true);
                        }}
                        className="p-3 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20 transition-all shadow-lg shadow-blue-500/5"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 transition-all shadow-lg shadow-rose-500/5"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-theme-tertiary">Uso de Campaña</span>
                      <span className="text-white">{coupon.current_uses} / {coupon.max_uses}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden shadow-inner">
                      <div
                        className={`h-full transition-all duration-700 ${coupon.current_uses >= coupon.max_uses ? 'bg-rose-500' : 'bg-primary-color shadow-[0_0_10px_#3B82F6]'}`}
                        style={{ width: `${Math.min(100, (coupon.current_uses / coupon.max_uses) * 100)}%` }}
                      ></div>
                    </div>

                    <div className="pt-6 grid grid-cols-2 gap-3">
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <p className="text-[8px] font-black text-theme-tertiary uppercase tracking-widest mb-1">Restricción</p>
                        <p className="text-[10px] font-bold text-white uppercase">{coupon.plan_key || 'Global'}</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <p className="text-[8px] font-black text-theme-tertiary uppercase tracking-widest mb-1">Expira</p>
                        <p className="text-[10px] font-bold text-white uppercase">{coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : '∞ Siglos'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center">
                  <FaTicketAlt size={40} className="mx-auto text-theme-tertiary opacity-20 mb-4" />
                  <p className="text-theme-tertiary font-bold uppercase tracking-widest">No hay cupones creados</p>
                </div>
              )}
            </div>
          )}

          {/* Modal Overlay */}
          {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-theme-component border border-theme-border rounded-[3rem] w-full max-w-xl p-12 relative shadow-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-color/10 blur-[100px] pointer-events-none group-hover:bg-primary-color/20 transition-all duration-1000"></div>

                <div className="flex items-center gap-3 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-primary-color flex items-center justify-center text-black shadow-lg shadow-primary-color/20 rotate-12 group-hover:rotate-0 transition-transform">
                    <FaTicketAlt />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter text-white uppercase">
                    {editingCoupon ? 'Configurar' : 'Forjar'} <span className="text-primary-color">Cupón</span>
                  </h2>
                </div>

                <form onSubmit={handleCreateOrUpdate} className="space-y-8 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary mb-3 block">Código de Descuento</label>
                      <input
                        required
                        placeholder="EJ: BLACKFRIDAY2026"
                        className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 text-sm font-black uppercase tracking-widest text-white outline-none focus:border-primary-color/50 transition-all shadow-inner"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary mb-3 block">Tipo de Beneficio</label>
                      <select
                        className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 text-xs font-bold uppercase tracking-widest text-white outline-none focus:border-primary-color/50 transition-all appearance-none cursor-pointer"
                        value={formData.type}
                        onChange={(e: any) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option value="percentage">Porcentaje (%)</option>
                        <option value="fixed_amount">Monto Fijo (USD)</option>
                        <option value="extra_credits">Créditos Extra</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary mb-3 block">Valor</label>
                      <input
                        type="number"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 text-sm font-black text-white outline-none focus:border-primary-color/50 transition-all shadow-inner"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary mb-3 block">Aplicar a Plan</label>
                      <select
                        className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 text-xs font-bold uppercase tracking-widest text-white outline-none focus:border-primary-color/50 transition-all appearance-none cursor-pointer"
                        value={formData.plan_key}
                        onChange={(e) => setFormData({ ...formData, plan_key: e.target.value })}
                      >
                        <option value="">Cualquier Plan</option>
                        {Object.entries(PLAN_NAMES).map(([key, name]) => (
                          <option key={key} value={key}>{name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary mb-3 block">Límite de Usos</label>
                      <input
                        type="number"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 text-sm font-black text-white outline-none focus:border-primary-color/50 transition-all shadow-inner"
                        value={formData.max_uses}
                        onChange={(e) => setFormData({ ...formData, max_uses: Number(e.target.value) })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary mb-3 block">Fecha de Expiración (Opcional)</label>
                      <input
                        type="date"
                        className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 text-sm font-bold text-white outline-none focus:border-primary-color/50 transition-all shadow-inner"
                        value={formData.expires_at}
                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-8 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-theme-tertiary transition-all"
                    >
                      Descartar
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="flex-1 px-8 py-5 bg-primary-color hover:bg-primary-color/80 text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-2 shadow-xl shadow-primary-color/20"
                    >
                      {formLoading ? <FaSpinner className="animate-spin" /> : editingCoupon ? 'Actualizar Cupón' : 'Lanzar Cupón'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default CouponAdmin;
