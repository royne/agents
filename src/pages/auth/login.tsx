import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../../contexts/AppContext';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await login(email.trim(), password);
      if (success) {
        router.push('/');
      } else {
        setError('Credenciales inválidas');
      }
    } catch (error) {
      setError('Error en el servidor');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0C10] px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-color/10 rounded-full blur-[120px] -mr-64 -mt-64 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -ml-64 -mb-64 opacity-50"></div>

      <div className="soft-card p-10 md:p-12 max-w-md w-full relative z-10 border-white/5 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center mb-10">
          {/* Logo DROPAPP Premium */}
          <div className="relative group mb-8">
            <div className="absolute -inset-2 bg-primary-color/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-700"></div>
            <div className="relative p-1 rounded-[1.5rem] bg-gradient-to-br from-white/20 to-transparent border border-white/10 shadow-xl backdrop-blur-md">
              <div className="bg-[#0A0C10] rounded-[1.3rem] overflow-hidden p-4">
                <div className="relative w-20 h-20">
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
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Bienvenido</h1>
          <p className="text-gray-500 font-medium mt-2 text-sm uppercase tracking-widest">Portal de acceso inteligente</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-color transition-colors">
                <FaEnvelope className="text-lg" />
              </div>
              <input
                type="email"
                className="w-full py-4 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color/30 transition-all font-medium"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-color transition-colors">
                <FaLock className="text-lg" />
              </div>
              <input
                className="w-full py-4 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color/30 transition-all font-medium"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary-color text-white py-4 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_20px_-5px_rgba(59,130,246,0.3)] btn-modern"
          >
            INGRESAR
          </button>
        </form>

        <div className="mt-12 text-center">
          <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
            Digital Engine by <span className="text-primary-color">RAC</span>
          </div>
        </div>
      </div>
    </div>
  );
}