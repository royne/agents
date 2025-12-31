import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/common/PageHeader';
import PlanPricing from '../components/profile/PlanPricing';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Head from 'next/head';
import { FaRocket } from 'react-icons/fa';

export default function PricingPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Head>
          <title>DROPAPP - Planes de Suscripción</title>
        </Head>
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title={
              <>
                <FaRocket className="inline-block mr-3 text-primary-color" />
                Planes de Suscripción
              </>
            }
            description="Elige el plan que mejor se adapte a tus necesidades y escala tu negocio al siguiente nivel."
          />

          <div className="mt-12">
            <PlanPricing isPublic={false} />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
