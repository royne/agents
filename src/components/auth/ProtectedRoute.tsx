import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../../contexts/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false,
  superAdminOnly = false 
}) => {
  const router = useRouter();
  const { authData, isAdmin, isSuperAdmin } = useAppContext();

  useEffect(() => {
    // Si no hay datos de autenticación, redirigir al login
    if (!authData || !authData.isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Si la ruta es solo para superadmin y el usuario no es superadmin, redirigir al dashboard
    if (superAdminOnly && !isSuperAdmin()) {
      router.push('/');
      return;
    }

    // Si la ruta es solo para admin y el usuario no es admin ni superadmin, redirigir al dashboard
    if (adminOnly && !isAdmin()) {
      router.push('/');
      return;
    }
  }, [authData, router, adminOnly, superAdminOnly, isAdmin, isSuperAdmin]);

  // Si no hay datos de autenticación o estamos verificando permisos, mostrar un indicador de carga
  if (!authData || !authData.isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-theme-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color mx-auto"></div>
          <p className="mt-4 text-theme-secondary">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si la ruta es solo para superadmin y el usuario no es superadmin, mostrar mensaje de acceso denegado
  if (superAdminOnly && !isSuperAdmin()) {
    return (
      <div className="flex items-center justify-center h-screen bg-theme-primary">
        <div className="text-center p-8 bg-theme-component rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-theme-primary mb-4">Acceso Restringido</h1>
          <p className="text-theme-secondary mb-6">Esta sección solo está disponible para superadministradores.</p>
          <button 
            onClick={() => router.push('/')} 
            className="px-4 py-2 bg-primary-color text-white rounded hover:bg-blue-700 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Si la ruta es solo para admin y el usuario no es admin ni superadmin, mostrar mensaje de acceso denegado
  if (adminOnly && !isAdmin()) {
    return (
      <div className="flex items-center justify-center h-screen bg-theme-primary">
        <div className="text-center p-8 bg-theme-component rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-theme-primary mb-4">Acceso Restringido</h1>
          <p className="text-theme-secondary mb-6">Esta sección solo está disponible para administradores.</p>
          <button 
            onClick={() => router.push('/')} 
            className="px-4 py-2 bg-primary-color text-white rounded hover:bg-blue-700 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
