import React, { useState } from 'react';
import Head from 'next/head';
import DashboardLayout from '../components/layout/DashboardLayout';
import HeaderCredits from '../components/dashboard/HeaderCredits';
import AdsCarousel from '../components/v2/Dashboard/AdsCarousel';
import PhoneMockup from '../components/v2/Canvas/PhoneMockup';
import { FaRocket, FaInstagram, FaMobileAlt } from 'react-icons/fa';
import { LandingGenerationState, SectionGeneration } from '../types/image-pro';
import CreationSelectorModal from '../components/v2/Dashboard/CreationSelectorModal';
import DashboardTour from '../components/tours/DashboardTour';
import { useAppContext } from '../contexts/AppContext';
import PublicLanding from '../components/public/PublicLanding';
import WhatsAppButton from '../components/common/WhatsAppButton';
import OnboardingModal from '../components/auth/OnboardingModal';

import { SHOWCASE_ADS, SHOWCASE_LANDING_SECTIONS } from '../config/v2-showcase';

export default function Dashboard() {
  const { authData } = useAppContext();
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [adReferences] = useState<any[]>(SHOWCASE_ADS);
  const [landingGenerations] = useState<Record<string, SectionGeneration>>(() => {
    const gens: Record<string, SectionGeneration> = {};
    SHOWCASE_LANDING_SECTIONS.forEach(s => {
      gens[s.sectionId] = {
        status: 'completed',
        imageUrl: s.imageUrl,
        copy: { headline: s.headline, body: s.body }
      };
    });
    return gens;
  });

  const MOCK_LANDING_STATE: LandingGenerationState = {
    phase: 'landing',
    proposedStructure: {
      sections: SHOWCASE_LANDING_SECTIONS.map(s => ({
        sectionId: s.sectionId,
        title: s.title,
        reasoning: "Referencia de alta conversión."
      }))
    },
    selectedSectionId: null,
    selectedReferenceUrl: null,
    generations: landingGenerations,
    adGenerations: {},
    adConcepts: []
  };

  // Si authData es null (está cargando o verificando), mostramos un fondo oscuro mientras se decide
  if (!authData) {
    return <div className="min-h-screen bg-[#050608]"></div>;
  }

  // Mostrar la Landing Page si no hay sesión iniciada
  if (!authData.isAuthenticated) {
    return (
      <>
        <Head>
          <title>DROPAPP - IA para E-commerce</title>
        </Head>
        <PublicLanding />
      </>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>DROPAPP - Dashboard</title>
      </Head>

      <div className="v2-layout-container flex flex-col gap-8">
        {/* Header Replicado del Dashboard 1 */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <HeaderCredits className="flex-1" />
          <div className="pt-2">
            <button
              id="tour-v2-create-btn"
              onClick={() => setIsCreationModalOpen(true)}
              className="px-6 py-3 bg-primary-color text-black font-black rounded-xl text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_10px_30px_rgba(18,216,250,0.2)] flex items-center gap-2"
            >
              <FaRocket /> ¿Que quieres Crear?
            </button>
          </div>
        </div>

        <CreationSelectorModal
          isOpen={isCreationModalOpen}
          onClose={() => setIsCreationModalOpen(false)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda: Redes Sociales (8/12) */}
          <div className="lg:col-span-8">
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] px-4 py-2 backdrop-blur-3xl relative overflow-hidden h-fit">
              <div className="relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-color/5 blur-[60px] rounded-full pointer-events-none"></div>
                <AdsCarousel customAds={adReferences.length > 0 ? adReferences : undefined} />
              </div>
            </div>
          </div>

          {/* Columna Derecha: Mobile View (4/12) */}
          <div className="lg:col-span-4 flex flex-col items-center gap-4">
            <div className="w-full bg-white/[0.02] border border-white/5 rounded-[32px] px-4 py-4 flex flex-col items-center gap-3 h-fit">
              <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                <FaMobileAlt className="text-primary-color text-[10px]" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Gama de Landings</span>
              </div>

              <div className="w-full flex justify-center py-2 h-[670px] overflow-hidden">
                <PhoneMockup
                  landingState={MOCK_LANDING_STATE}
                  className="flex flex-col items-center"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <OnboardingModal isOpen={!!authData?.isAuthenticated && !authData?.is_setup_completed} />
      {authData?.isAuthenticated && authData?.is_setup_completed && <DashboardTour />}
      <WhatsAppButton />
    </DashboardLayout>
  );
}
