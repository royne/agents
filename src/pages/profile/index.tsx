import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import UserProfile from '../../components/profile/UserProfile';
import MembershipCard from '../../components/profile/MembershipCard';
import Head from 'next/head';
import { FaUser } from 'react-icons/fa';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Head>
          <title>Unlocked Ecom - Mi Perfil</title>
        </Head>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <FaUser className="text-primary-color mr-3 text-2xl" />
            <h1 className="text-3xl font-bold text-theme-primary">Mi Perfil</h1>
          </div>
          
          <p className="text-theme-secondary mb-8">
            Gestiona tu información personal y preferencias de cuenta.
          </p>
          
          <div className="grid grid-cols-1 gap-8 mb-8 w-full">
            <div className="w-full">
              <h2 className="text-xl font-bold text-theme-primary mb-4">Estado de Suscripción</h2>
              <MembershipCard status="active" planName="Premium" expirationDate="31/12/2025" />
            </div>
            
            <div className="w-full">
              <h2 className="text-xl font-bold text-theme-primary mb-4">Información Personal</h2>
              <UserProfile showEditButton={true} />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
