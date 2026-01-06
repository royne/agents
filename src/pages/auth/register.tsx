import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../../contexts/AppContext';
import { FaEnvelope, FaLock, FaUser, FaPhone, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import { trackPixelEvent } from '../../utils/pixelEvents';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await register(email.trim(), password, phone.trim(), name.trim());
      if (result.success) {
        setIsSuccess(true);
        // Rastrear evento de registro como "Purchase" (Compra)
        trackPixelEvent('Purchase', {
          content_name: 'Registro de Usuario',
          status: 'success'
        });
      } else {
        setError(result.error || 'Error al crear la cuenta');
      }
    } catch (err) {
      setError('Error en el servidor');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050608] px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-color/10 rounded-full blur-[120px] opacity-50"></div>
        <div className="soft-card p-10 md:p-12 max-w-md w-full relative z-10 border-white/5 shadow-2xl backdrop-blur-xl text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/30">
            <FaCheckCircle className="text-4xl text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">¡Casi listo!</h2>
          <p className="text-gray-400 font-medium mb-8">
            Hemos enviado un enlace de confirmación a <span className="text-white font-bold">{email}</span>.
            Por favor verifica tu bandeja de entrada para activar tus 50 créditos iniciales.
          </p>
          <Link href="/auth/login" className="w-full inline-block bg-primary-color text-white py-4 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary-color/20">
            IR AL LOGIN
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050608] px-4 relative overflow-hidden py-12">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary-color/10 rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] opacity-50"></div>

      <div className="soft-card p-8 md:p-10 max-w-md w-full relative z-10 border-white/5 shadow-2xl backdrop-blur-xl">
        {/* Botón Volver al sitio */}
        <div className="absolute top-6 left-6">
          <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary-color transition-colors group">
            <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary-color/30">
              <FaArrowRight className="rotate-180 text-[8px]" />
            </div>
            Volver al sitio
          </Link>
        </div>

        <div className="flex flex-col items-center mb-8">
          {/* Logo DROPAPP */}
          <Link href="/" className="relative group mb-6">
            <div className="absolute -inset-2 bg-primary-color/20 rounded-[1.5rem] blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-700"></div>
            <div className="relative p-1 rounded-[1.2rem] bg-gradient-to-br from-white/20 to-transparent border border-white/10 shadow-xl backdrop-blur-md">
              <div className="bg-[#050608] rounded-[1rem] overflow-hidden p-3">
                <div className="relative w-12 h-12">
                  <Image
                    src="/droplab.png"
                    alt="DROPAPP"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tighter">Crear Cuenta</h1>
          <p className="text-gray-500 font-medium mt-1 text-xs uppercase tracking-widest text-center">Únete a la élite del e-commerce</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-4">
            {/* Nombre */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-color transition-colors">
                <FaUser className="text-base" />
              </div>
              <input
                type="text"
                className="w-full py-3.5 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color/30 transition-all font-medium text-sm"
                placeholder="Nombre Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-color transition-colors">
                <FaEnvelope className="text-base" />
              </div>
              <input
                type="email"
                className="w-full py-3.5 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color/30 transition-all font-medium text-sm"
                placeholder="Correo Electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Celular */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-color transition-colors">
                <FaPhone className="text-base" />
              </div>
              <input
                type="tel"
                className="w-full py-3.5 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color/30 transition-all font-medium text-sm"
                placeholder="WhatsApp / Celular"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-color transition-colors">
                <FaLock className="text-base" />
              </div>
              <input
                type="password"
                className="w-full py-3.5 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color/30 transition-all font-medium text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-color text-white py-4 rounded-xl font-black text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary-color/20 btn-modern disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
          >
            {loading ? 'CREANDO CUENTA...' : (
              <>
                CREAR CUENTA <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-gray-500 text-sm font-medium">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-primary-color hover:underline font-bold">
              Inicia Sesión
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center">
          <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">
            Digital Engine by <span className="text-primary-color">RAC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
