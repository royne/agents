import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../../contexts/AppContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que protege rutas para que solo sean accesibles por administradores
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter();
  const { isAdmin, authData } = useAppContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si el usuario está autenticado y es administrador
    if (authData !== null) {
      if (!authData.isAuthenticated) {
        router.push('/auth/login');
      } else if (!isAdmin()) {
        // Si no es administrador, redirigir a la página principal
        router.push('/');
      } else {
        setLoading(false);
      }
    }
  }, [authData, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 py-2 px-3 rounded text-sm">
          <span className="font-bold">Área restringida:</span> Verificando permisos...
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
