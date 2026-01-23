import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaArrowRight, FaSpinner, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import { Plan, PLAN_CREDITS } from '../../constants/plans';
import { useAppContext } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';

interface PlanPricingProps {
  isPublic?: boolean;
}

interface DbPlan {
  key: string;
  name: string;
  price_usd: number;
  monthly_credits: number;
  features: {
    active_modules?: string[];
  };
}

const PLANS_METADATA: Record<string, { tagline: string; highlight: boolean; buttonText: string; features: string[] }> = {
  free: {
    tagline: 'Validación / Free',
    highlight: false,
    buttonText: 'Empezar Gratis',
    features: [
      'Imagen Pro (Ads y Personas) - 10 cr',
      'Agentes IA Especializados - 1 cr',
      'Logística (Análisis Básico) - $0 cr',
      'Calculadora de Precios - $0 cr',
      'Landing Fast Incluida'
    ],
  },
  starter: {
    tagline: 'Emprendedor / Starter',
    highlight: false,
    buttonText: 'Seleccionar Starter',
    features: [
      'Todo lo de Plan FREE',
      'Video Pro UGC (Hasta 8s) - 80 cr',
      'Master Chat de Ventas',
      'Análisis de Rentabilidad Detallado',
      'Landing Pro Incluida'
    ],
  },
  pro: {
    tagline: 'Escalación / PRO',
    highlight: true,
    buttonText: 'Elegir PRO',
    features: [
      'Todo lo de Plan Starter',
      'Landing Pro Completas & Secciones',
      'Auditoría de Rentabilidad Avanzada',
      'Análisis de Fletes y Devoluciones',
      'Soporte Prioritario'
    ],
  },
  business: {
    tagline: 'Operaciones / Business',
    highlight: false,
    buttonText: 'Seleccionar Business',
    features: [
      'Todo lo de Plan PRO',
      'Consultoría Financiera IA',
      'Análisis de logística, ultimos movimientos',
      'Soporte VIP por WhatsApp',
      'Acceso Early Bird a Nuevos Agentes'
    ],
  }
};

const HARDCODED_PLANS: DbPlan[] = [
  { key: 'free', name: 'Gratuito', price_usd: 0, monthly_credits: 50, features: {} },
  { key: 'starter', name: 'Starter', price_usd: 19, monthly_credits: 500, features: {} },
  { key: 'pro', name: 'Professional', price_usd: 39, monthly_credits: 1200, features: {} },
  { key: 'business', name: 'Business', price_usd: 79, monthly_credits: 3000, features: {} },
];

const PlanPricing: React.FC<PlanPricingProps> = ({ isPublic = false }) => {
  const { authData } = useAppContext();
  const [plans, setPlans] = useState<DbPlan[]>(isPublic ? HARDCODED_PLANS : []);
  const [loading, setLoading] = useState(!isPublic);
  const [error, setError] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    // Si es público, no consultamos la DB (evitar carga innecesaria en landing)
    if (isPublic) {
      setLoading(false);
      return;
    }

    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price_usd', { ascending: true });

        if (error) throw error;

        // Filtrar solo los planes que tenemos en metadata. NUNCA MOSTRAR TESTER.
        const filteredPlans = data.filter((p: DbPlan) => {
          return !!PLANS_METADATA[p.key] && p.key !== 'tester';
        });

        setPlans(filteredPlans);
      } catch (err: any) {
        console.error('Error fetching plans:', err);
        setError('No se pudieron cargar los planes.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [isPublic]);

  const handleBuyPlan = async (planKey: string) => {
    if (isPublic && !authData?.isAuthenticated) {
      window.location.href = '/auth/register';
      return;
    }

    if (planKey === 'free') {
      alert('Ya tienes el plan gratuito activo.');
      return;
    }

    try {
      setLoadingPlan(planKey);

      // Obtener el token de sesión actual
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/payments/create-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ planKey }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Error al generar link de pago');
      }
    } catch (error) {
      console.error('Error al comprar plan:', error);
      alert('Error de conexión');
    } finally {
      setLoadingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <FaSpinner className="animate-spin text-primary-color text-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <FaExclamationTriangle className="text-amber-500 text-3xl mx-auto mb-4" />
        <p className="text-theme-secondary italic">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Aviso Pasarela de Pago */}
      {!isPublic && (
        <div className="max-w-4xl mx-auto bg-primary-color/5 border border-primary-color/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left transition-all hover:bg-primary-color/10">
          <div className="w-10 h-10 rounded-full bg-primary-color/10 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(18,216,250,0.2)]">
            <FaShieldAlt className="text-primary-color text-xl" />
          </div>
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-1">Pago 100% Seguro y Activación Inmediata</h4>
            <p className="text-gray-500 text-[11px] font-medium leading-relaxed">
              Al seleccionar un plan, serás redirigido a nuestra pasarela de pago segura. Tus créditos y beneficios se activarán <span className="text-primary-color font-bold italic">automáticamente</span> tras completar la transacción.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-end pt-2">
        {plans.map((plan) => {
          const meta = PLANS_METADATA[plan.key] || {
            tagline: 'Plan Especial',
            highlight: false,
            buttonText: 'Seleccionar',
            features: ['Acceso a módulos específicos']
          };

          const isCurrent = authData?.plan === plan.key;

          return (
            <div
              key={plan.key}
              className={`premium-card p-8 transition-all duration-500 flex flex-col h-full relative group ${meta.highlight
                ? 'border-primary-color/40 bg-gradient-to-b from-primary-color/10 to-transparent scale-105 shadow-[0_20px_50px_rgba(18,216,250,0.15)] z-20'
                : 'hover:border-white/20 bg-white/[0.02] z-10'
                }`}
            >
              {meta.highlight && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-5 py-2 bg-gradient-to-r from-[#12D8FA] to-[#0066FF] text-white text-[10px] font-black uppercase tracking-[0.25em] rounded-xl shadow-[0_10px_20px_rgba(18,216,250,0.4)] whitespace-nowrap z-30">
                  MÁS POPULAR
                </div>
              )}

              <div className="mb-8">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 block transition-colors duration-300 ${meta.highlight ? 'text-primary-color' : 'text-gray-500 group-hover:text-gray-400'}`}>
                  {meta.tagline}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white tracking-tighter">${plan.price_usd}</span>
                  <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">USD / Mes</span>
                </div>
              </div>

              <div className="mb-6 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <span className="text-[10px] font-black text-theme-tertiary uppercase tracking-widest block text-center">
                  {plan.monthly_credits.toLocaleString()} Créditos / Mes
                </span>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {meta.features.map((feature, idx) => (
                  <li key={idx} className={`flex items-start gap-3 text-[11px] transition-colors duration-300 ${meta.highlight ? 'font-bold text-gray-100' : 'font-medium text-gray-400 group-hover:text-gray-300'}`}>
                    <div className={`shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center ${meta.highlight ? 'bg-primary-color/20' : 'bg-emerald-500/10'}`}>
                      <FaCheckCircle className={`text-[10px] ${meta.highlight ? 'text-primary-color' : 'text-emerald-500'}`} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleBuyPlan(plan.key)}
                disabled={loadingPlan !== null || isCurrent}
                className={`w-full py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all duration-300 text-center border flex items-center justify-center gap-3 ${isCurrent
                  ? 'bg-gray-800/50 text-gray-600 border-white/5 cursor-not-allowed'
                  : meta.highlight
                    ? 'bg-gradient-to-r from-[#12D8FA] to-[#0066FF] text-white border-transparent shadow-[0_10px_25px_rgba(18,216,250,0.3)] hover:scale-[1.03] hover:shadow-[0_15px_30px_rgba(18,216,250,0.5)] active:scale-95'
                    : 'bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-white/20 active:scale-95'
                  }`}
              >
                {loadingPlan === plan.key ? (
                  <FaSpinner className="animate-spin" />
                ) : isCurrent ? (
                  'Tu Plan Actual'
                ) : (
                  <>
                    {meta.buttonText} <FaArrowRight className="text-[12px] group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          );
        })}

        <style jsx>{`
        .premium-card {
          border-radius: 2rem;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
        }
        .premium-card:hover {
          transform: translateY(-5px);
        }
      `}</style>
      </div>
    </div>
  );
};

export default PlanPricing;
