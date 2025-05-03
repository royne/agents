import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaUsers, FaDatabase, FaTruck, FaShieldAlt } from 'react-icons/fa';
import Link from 'next/link';
import Head from 'next/head';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useAppContext } from '../../contexts/AppContext';

const adminModules = [
  {
    name: 'Gestión de Usuarios',
    icon: FaUsers,
    description: 'Administrar usuarios y permisos',
    path: '/admin/users',
    superAdminOnly: true
  },
  {
    name: 'Base de Datos',
    icon: FaDatabase,
    description: 'Gestión avanzada de base de datos',
    path: '/admin/database',
    superAdminOnly: false
  },
  {
    name: 'Transportadoras',
    icon: FaTruck,
    description: 'Gestión de transportadoras',
    path: '/admin/carriers',
    superAdminOnly: false
  },
  {
    name: 'Seguridad',
    icon: FaShieldAlt,
    description: 'Configuración de seguridad',
    path: '/admin/security',
    superAdminOnly: true
  }
];

export default function AdminDashboard() {
  const { isSuperAdmin } = useAppContext();

  return (
    <ProtectedRoute adminOnly={true}>
      <DashboardLayout>
        <Head>
          <title>Unlocked Ecom - Panel de Administración</title>
        </Head>
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-theme-primary mb-2">Panel de Administración</h1>
            <p className="text-theme-secondary">Gestiona todos los aspectos de la plataforma desde este panel centralizado.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminModules.map((module) => {
              // Si el módulo es solo para superadmin y el usuario no es superadmin, no mostrar
              if (module.superAdminOnly && !isSuperAdmin()) {
                return null;
              }
              
              return (
                <Link key={module.path} href={module.path}>
                  <div className="bg-theme-component p-6 rounded-lg shadow-md cursor-pointer hover:bg-theme-component-hover transform hover:-translate-y-0.5 transition-all duration-200">
                    <div className="flex flex-col gap-4 items-center">
                      <module.icon className="w-8 h-8 text-primary-color" />
                      <h2 className="text-xl font-bold text-theme-primary">
                        {module.name}
                      </h2>
                      <p className="text-theme-secondary text-center">
                        {module.description}
                      </p>
                      {module.superAdminOnly && (
                        <div className="mt-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          Solo SuperAdmin
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
