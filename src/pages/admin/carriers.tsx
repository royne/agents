import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CarrierImporter from '../../components/Admin/CarrierImporter';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Head from 'next/head';
import { FaTruck } from 'react-icons/fa';

export default function CarriersAdminPage() {
  return (
    <ProtectedRoute adminOnly={true}>
      <DashboardLayout>
        <Head>
          <title>DROPLAB - Gestión de Transportadoras</title>
        </Head>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <FaTruck className="text-primary-color mr-3 text-2xl" />
            <h1 className="text-3xl font-bold text-theme-primary">Gestión de Transportadoras</h1>
          </div>

          <p className="text-theme-secondary mb-8">
            Importa y administra las transportadoras disponibles en el sistema.
          </p>

          <div className="bg-theme-component rounded-lg shadow-lg p-6 mb-8">
            <CarrierImporter />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
