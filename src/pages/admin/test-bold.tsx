import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Head from 'next/head';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useAppContext } from '../../contexts/AppContext';
import PageHeader from '../../components/common/PageHeader';
import { FaTerminal, FaCreditCard, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useRouter } from 'next/router';

export default function TestBoldPage() {
  const { authData } = useAppContext();
  const router = useRouter();
  const { status } = router.query;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planKey, setPlanKey] = useState('pro');

  const handleTestPayment = async () => {
    if (!authData?.userId) {
      setError('Debes estar autenticado para realizar esta prueba.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/test-create-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: authData.userId,
          planKey: planKey
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el link de prueba');
      }

      // Redirigir a Bold
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Test Payment Error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute adminOnly={true}>
      <DashboardLayout>
        <Head>
          <title>DROPAPP - Debugging Vía Láctea (Bold)</title>
        </Head>
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title={
              <>
                <FaTerminal className="inline-block mr-2 mb-1 text-emerald-500" />
                Debug de Pagos Bold
              </>
            }
            description="Lanzador de pruebas controladas en producción ($1.000 COP). Esta página es estrictamente confidencial."
            backLink="/admin"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="soft-card p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FaCreditCard className="text-primary-color" />
                Nueva Prueba de Pago
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                    Plan a Simular
                  </label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary-color outline-none"
                    value={planKey}
                    onChange={(e) => setPlanKey(e.target.value)}
                  >
                    <option value="starter">Starter (Prueba)</option>
                    <option value="pro">Pro (Recomendado)</option>
                    <option value="business">Business (Prueba)</option>
                  </select>
                </div>

                <div className="p-4 bg-primary-color/10 border border-primary-color/20 rounded-xl">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Al hacer clic en el botón, se generará un link real de Bold por <span className="text-white font-bold">$1.000 COP</span>.
                    El webhook recibirá esta referencia y activará el plan <span className="text-primary-color font-bold uppercase">{planKey}</span>
                    como si fuera una compra regular.
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
                    <FaExclamationTriangle className="flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <button
                  onClick={handleTestPayment}
                  disabled={loading}
                  className="w-full bg-primary-color text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary-color/20 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      GENERANDO LINK...
                    </>
                  ) : (
                    'PAGAR $1.000 COP (PRODUCCIÓN)'
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="soft-card p-8">
                <h2 className="text-xl font-bold text-white mb-4">Instrucciones de Debugging</h2>
                <ul className="space-y-4 text-sm text-gray-400">
                  <li className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</span>
                    Abre los logs de Vercel en una ventana separada.
                  </li>
                  <li className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</span>
                    Realiza el pago de $1.000 con una tarjeta real.
                  </li>
                  <li className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</span>
                    Observa los logs con el prefijo <code className="text-primary-color">[Bold-Webhook]</code>.
                  </li>
                </ul>
              </div>

              {status === 'success' && (
                <div className="soft-card p-8 border-emerald-500/30 bg-emerald-500/5 animate-in zoom-in-95">
                  <div className="flex items-center gap-4 text-emerald-400 mb-2">
                    <FaCheckCircle className="text-2xl" />
                    <h3 className="font-bold">Pago Retornado</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    Has vuelto de la pasarela con éxito. Ahora espera unos segundos y verifica si tus créditos y plan se han actualizado en el dashboard.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
