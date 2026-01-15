import { FaTrash, FaHistory } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ReferenceLibraryModal } from '../../components/ImageGen/ReferenceLibraryModal';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAppContext } from '../../contexts/AppContext';

// Modulares e Internos
import { useLandingPro } from '../../hooks/useLandingPro';
import PlanSelector from '../../components/LandingPro/PlanSelector';
import SectionSelector from '../../components/LandingPro/SectionSelector';
import IdentityCore from '../../components/LandingPro/IdentityCore';
import LandingPreview from '../../components/LandingPro/LandingPreview';
import CorrectionModal from '../../components/LandingPro/CorrectionModal';
import { HistoryModal } from '../../components/ImageGen/HistoryModal';
import LandingProTour from '../../components/tours/LandingProTour';
import { useState } from 'react';

export default function LandingProPage() {
  const router = useRouter();
  const { authData, canAccessModule } = useAppContext();
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const { state, actions } = useLandingPro();

  if (!canAccessModule('landing-pro')) {
    if (typeof window !== 'undefined') router.push('/');
    return null;
  }

  return (
    <ProtectedRoute moduleKey={'landing-pro'}>
      <DashboardLayout>
        <Head>
          <title>Landing PRO - Dropapp</title>
        </Head>

        <div className="max-w-6xl mx-auto pb-20">
          {/* Header con Estética Premium */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-primary-color/20 rounded-2xl border border-primary-color/20">
                  <span className="text-2xl">🚀</span>
                </div>
                <h1 className="text-3xl font-black text-theme-primary tracking-tighter">Landing <span className="text-primary-color drop-shadow-[0_0_15px_rgba(18,216,250,0.4)]">PRO</span></h1>
              </div>
              <p className="text-theme-tertiary font-medium opacity-60">Diseña secciones de alta conversión impulsadas por IA estratégica.</p>
              <p className="text-primary-color text-[10px] font-black uppercase tracking-widest mt-1 opacity-90">Gasto: 10 créditos por sección (imagen)</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setIsHistoryModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-theme-component border border-white/10 hover:border-primary-color/50 transition-all text-theme-secondary text-xs font-black uppercase tracking-widest btn-modern"
              >
                <FaHistory /> Historial
              </button>

              <button
                onClick={actions.resetProject}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-500 transition-all text-xs font-black uppercase tracking-widest"
              >
                <FaTrash className="text-[10px]" /> Limpiar
              </button>

              <PlanSelector
                landingMode={state.landingMode}
                onModeChange={actions.changeMode}
              />
            </div>
          </div>

          <SectionSelector
            landingMode={state.landingMode}
            currentStep={state.currentStep}
            activeSections={state.activeSections}
            generations={state.generations}
            isSectionSelectorOpen={state.isSectionSelectorOpen}
            onStepChange={actions.handleStepChange}
            setIsSectionSelectorOpen={actions.setIsSectionSelectorOpen}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <IdentityCore
              productData={state.productData}
              baseImageBase64={state.baseImageBase64}
              styleImageBase64={state.styleImageBase64}
              selectedLayout={state.selectedLayout}
              isContextOpen={state.isContextOpen}
              onProductDataChange={actions.setProductData}
              onImageSelect={actions.handleImageSelect}
              onStyleImageSelect={actions.handleStyleImageSelect}
              onLayoutSelect={actions.setSelectedLayout}
              setIsLibraryOpen={actions.setIsLibraryOpen}
              setIsContextOpen={actions.setIsContextOpen}
              setStyleImageBase64={actions.setStyleImageBase64}
            />

            <LandingPreview
              currentSection={state.currentSection}
              landingMode={state.landingMode}
              currentStep={state.currentStep}
              activeSections={state.activeSections}
              generations={state.generations}
              isGenerating={state.isGenerating}
              onGenerate={() => actions.handleGenerateStep(false)}
              onStepChange={actions.handleStepChange}
              onCorrectionOpen={() => actions.setIsCorrectionModalOpen(true)}
            />
          </div>
        </div>

        <CorrectionModal
          isOpen={state.isCorrectionModalOpen}
          isGenerating={state.isGenerating}
          correctionPrompt={state.correctionPrompt}
          onClose={() => actions.setIsCorrectionModalOpen(false)}
          onPromptChange={actions.setCorrectionPrompt}
          onApply={() => actions.handleGenerateStep(true)}
        />

        <ReferenceLibraryModal
          isOpen={state.isLibraryOpen}
          onClose={() => actions.setIsLibraryOpen(false)}
          category="landing"
          onSelect={(url) => {
            actions.setStyleImageBase64(url);
            actions.setIsLibraryOpen(false);
          }}
        />

        <HistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          userId={authData?.userId || ''}
        />

        <LandingProTour />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
