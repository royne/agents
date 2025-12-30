import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaUsers, FaDatabase, FaTruck, FaShieldAlt, FaMagic, FaChartLine } from 'react-icons/fa';
import Link from 'next/link';
import Head from 'next/head';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useAppContext } from '../../contexts/AppContext';
import PageHeader from '../../components/common/PageHeader';

const adminModules = [
  {
    name: 'Gestión de Usuarios',
    icon: FaUsers,
    description: 'Administrar usuarios y permisos',
    path: '/admin/users',
    superAdminOnly: false
  },
  {
    name: 'Embeddings',
    icon: FaDatabase,
    description: 'Gestionar scripts para el sistema RAG',
    path: '/admin/embeddings',
    superAdminOnly: true
  },
  {
    name: 'Transportadoras',
    icon: FaTruck,
    description: 'Importar y gestionar transportadoras',
    path: '/admin/carriers',
    superAdminOnly: true
  },
  {
    name: 'Seguridad',
    icon: FaShieldAlt,
    description: 'Configuración de seguridad',
    path: '/admin/security',
    superAdminOnly: true
  },
  {
    name: 'Módulos por Plan',
    icon: FaShieldAlt,
    description: 'Activar/Desactivar módulos para cada nivel de suscripción',
    path: '/admin/plans',
    superAdminOnly: true
  },
  {
    name: 'Créditos y Usuarios',
    icon: FaUsers,
    description: 'Gestionar saldos de créditos y planes de usuarios',
    path: '/admin/subscriptions',
    superAdminOnly: false
  },
  {
    name: 'Configuración Imagen Pro',
    icon: FaMagic,
    description: 'Gestionar plantillas y modelos de imágenes',
    path: '/admin/image-config',
    superAdminOnly: true
  },
  {
    name: 'Análisis Diario',
    icon: FaChartLine,
    description: 'Análisis de rendimiento por campaña y anuncio',
    path: '/data-analysis/daily-orders',
    superAdminOnly: false
  }
];

export default function AdminDashboard() {
  const { isAdmin, isSuperAdmin } = useAppContext();

  return (
    <ProtectedRoute adminOnly={true}>
      <DashboardLayout>
        <Head>
          <title>DROPAPP - Panel de Administración</title>
        </Head>
        <div>
          <PageHeader
            title="Panel de Administración"
            description="Accede a las diferentes herramientas de administración del sistema."
          />
          <div className="mb-6">
            <p className="text-theme-secondary">Gestiona todos los aspectos de la plataforma desde este panel centralizado.</p>
            {!isSuperAdmin() && isAdmin() && (
              <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
                <p className="font-medium">Acceso limitado</p>
                <p className="text-sm">Algunas funciones están disponibles solo para super administradores.</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminModules.map((module) => {
              // Si el módulo es solo para superadmin y el usuario no es superadmin, no mostrar
              if (module.superAdminOnly && !isSuperAdmin()) {
                return null;
              }

              return (
                <Link key={module.path} href={module.path}>
                  <div className="bg-theme-component p-6 rounded-lg shadow-md cursor-pointer hover:bg-theme-component-hover transform hover:-translate-y-0.5 transition-all duration-200 h-full">
                    <div className="flex flex-col gap-4 items-center h-full">
                      <module.icon className="w-8 h-8 text-primary-color" />
                      <h2 className="text-xl font-bold text-theme-primary">
                        {module.name}
                      </h2>
                      <p className="text-theme-secondary text-center">
                        {module.description}
                      </p>
                      <div className="flex-grow"></div>
                      {module.superAdminOnly ? (
                        <div className="mt-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          Solo SuperAdmin
                        </div>
                      ) : (
                        <div className="mt-2 opacity-0 px-2 py-1 text-xs">
                          Espaciador invisible
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
