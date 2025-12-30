import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import UserProfile from '../../components/profile/UserProfile';
import MembershipCard from '../../components/profile/MembershipCard';
import Head from 'next/head';
import { FaUser, FaHistory } from 'react-icons/fa';
import UsageHistoryTable from '../../components/profile/UsageHistoryTable';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import PageHeader from '../../components/common/PageHeader';
import { useAppContext } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';

export default function ProfilePage() {
  const { authData } = useAppContext();
  const [credits, setCredits] = React.useState<{ balance: number; plan_key: string; unlimited_credits: boolean } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (authData?.userId) {
      fetchUserCredits();
    }
  }, [authData?.userId]);

  const fetchUserCredits = async () => {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('balance, plan_key, unlimited_credits')
        .eq('user_id', authData?.userId)
        .single();

      if (data) {
        setCredits(data);
      }
    } catch (err) {
      console.error('Error fetching profile credits:', err);
    } finally {
      setLoading(false);
    }
  };

  const planKey = credits?.plan_key || authData?.plan || 'free';
  const status: 'active' | 'inactive' | 'trial' = planKey === 'tester' ? 'trial' : 'active';
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Head>
          <title>DROPAPP - Mi Perfil</title>
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
              <MembershipCard
                status={status}
                planName={planKey}
                balance={credits?.balance}
                isUnlimited={credits?.unlimited_credits}
              />
            </div>

            <div className="w-full">
              <h2 className="text-xl font-bold text-theme-primary mb-4">Información Personal</h2>
              <UserProfile showEditButton={true} />
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-theme-primary mb-4 flex items-center gap-2">
              <FaHistory className="text-primary-color" />
              Resumen de Consumo de Créditos
            </h2>
            <UsageHistoryTable userId={authData?.userId || ''} />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
