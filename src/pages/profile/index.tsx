import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import UserProfile from '../../components/profile/UserProfile';
import MembershipCard from '../../components/profile/MembershipCard';
import Head from 'next/head';
import { FaUser } from 'react-icons/fa';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import PageHeader from '../../components/common/PageHeader';
import { useAppContext } from '../../contexts/AppContext';

export default function ProfilePage() {
  const { authData } = useAppContext();
  const plan = authData?.plan || 'basic';
  const planLabel = plan === 'premium' ? 'Premium' : plan === 'tester' ? 'Tester' : 'Basic';
  const status: 'active' | 'inactive' | 'trial' = plan === 'tester' ? 'trial' : 'active';
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Head>
          <title>DROPLAB - Mi Perfil</title>
        </Head>
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title={
              <>
                <FaUser className="inline-block mr-2 mb-1" />
                Mi Perfil
              </>
            }
            description="Gestiona tu información personal y preferencias de cuenta."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 w-full">
            <div className="w-full">
              <h2 className="text-xl font-bold text-theme-primary mb-4">Estado de Suscripción</h2>
              <MembershipCard status={status} planName={planLabel} />
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
