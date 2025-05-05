import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import UserProfile from '../../components/profile/UserProfile';
import MembershipCard from '../../components/profile/MembershipCard';
import Head from 'next/head';
import { FaUser } from 'react-icons/fa';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import PageHeader from '../../components/common/PageHeader';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Head>
          <title>Unlocked Ecom - Mi Perfil</title>
        </Head>
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title={
              <>
                <FaUser className="inline-block mr-2 mb-1" />
                Mi Perfil
              </>
            }
            description="Gestiona tu información personal y preferencias de cuenta."
          />
          
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
