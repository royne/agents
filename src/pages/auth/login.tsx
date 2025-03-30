import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../../contexts/AppContext';

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
    <div className="container mx-auto px-4 max-w-md">
      <div className="w-full p-8 mt-20">
        <div className="flex flex-col gap-8">
          <h1 className="text-3xl font-bold">Iniciar Sesión</h1>
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col gap-4 w-full">
              <input
                className="w-full p-2 rounded border border-gray-300 bg-gray-700"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="w-full p-2 rounded border border-gray-300 bg-gray-700"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button 
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Ingresar
              </button>
            </div>
          </form>
        </div>
        <span className="flex justify-center text-xs text-gray-400 mt-2">
          Desarrollado por <strong> RAC </strong>
        </span>
      </div>
    </div>
  );
}