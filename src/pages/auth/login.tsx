import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../../contexts/AppContext';
import { FaRobot, FaEnvelope, FaLock } from 'react-icons/fa';

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
    <div className="min-h-screen flex items-center justify-center bg-theme-primary px-4">
      <div className="bg-theme-component p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          {/* Robot animado */}
          <div className="bg-theme-primary p-6 rounded-full mb-6 shadow-inner">
            <FaRobot className="text-6xl text-primary-color animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-theme-primary">Bienvenido</h1>
          <p className="text-theme-secondary mt-2">Inicia sesión para continuar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex flex-col gap-5 w-full">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-color">
                <FaEnvelope />
              </div>
              <input
                className="w-full p-3 pl-10 rounded-lg border border-theme-component-hover bg-theme-component focus:outline-none focus:ring-2 focus:ring-primary-color/50 transition-all"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-color">
                <FaLock />
              </div>
              <input
                className="w-full p-3 pl-10 rounded-lg border border-theme-component-hover bg-theme-component focus:outline-none focus:ring-2 focus:ring-primary-color/50 transition-all"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button 
              type="submit"
              className="w-full bg-primary-color text-white p-3 rounded-lg hover:bg-primary-color/90 transition-all font-medium mt-2"
            >
              Ingresar
            </button>
          </div>
        </form>
        
        <div className="mt-8 text-center">
          <span className="text-sm text-theme-secondary">
            Desarrollado por <strong className="text-primary-color">RAC</strong>
          </span>
        </div>
      </div>
    </div>
  );
}