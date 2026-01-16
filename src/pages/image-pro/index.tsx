import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaMagic, FaHistory, FaCog } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAppContext } from '../../contexts/AppContext';
import { ReferenceLibraryModal } from '../../components/ImageGen/ReferenceLibraryModal';
import { HistoryModal } from '../../components/ImageGen/HistoryModal';
import ImageProTour from '../../components/tours/ImageProTour';
import { useImagePro } from '../../hooks/useImagePro';

// Componentes modulares
import ModeSelector from '../../components/ImagePro/ModeSelector';
import ImageConfig from '../../components/ImagePro/ImageConfig';
import ImagePreview from '../../components/ImagePro/ImagePreview';
import RefinementModal from '../../components/ImagePro/RefinementModal';
import ConfigModal from '../../components/ImagePro/ConfigModal';

export default function ImageProPage() {
  const { authData, canAccessModule } = useAppContext();
  const { state, actions } = useImagePro();
  const router = useRouter();

  if (!canAccessModule('image-pro')) {
    if (typeof window !== 'undefined') router.push('/');
    return null;
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Agente Pro - Dropapp</title>
      </Head>

      <div className="max-w-6xl mx-auto">
        {/* Header con Estética Premium */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary-color/20 rounded-lg">
                <FaMagic className="text-primary-color text-2xl" />
              </div>
              <h1 className="text-3xl font-bold text-theme-primary tracking-tight">Agente <span className="text-primary-color drop-shadow-[0_0_10px_rgba(18,216,250,0.5)]">Pro</span></h1>
            </div>
            <p className="text-theme-secondary opacity-80">Generación estratégica de imágenes con IA avanzada</p>
            <p className="text-primary-color text-[10px] font-black uppercase tracking-widest mt-1 opacity-90">Gasto: 10 créditos por imagen</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => actions.setIsHistoryModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-theme-component border border-white/10 hover:border-primary-color/50 transition-all text-theme-secondary btn-modern"
            >
              <FaHistory /> Historial
            </button>
            <button
              onClick={() => actions.setIsConfigModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-theme-component border border-white/10 hover:border-primary-color/50 transition-all text-theme-secondary btn-modern"
            >
              <FaCog /> Configuración
            </button>
          </div>
        </div>

        <ModeSelector
          activeMode={state.generationMode}
          onSelect={actions.setGenerationMode}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <ImageConfig state={state} actions={actions} />
          </div>

          <div className="lg:col-span-8">
            <ImagePreview state={state} actions={actions} />
          </div>
        </div>
      </div>

      {/* Modales */}
      <ConfigModal
        isOpen={state.isConfigModalOpen}
        onClose={() => actions.setIsConfigModalOpen(false)}
        aspectRatio={state.aspectRatio}
        onAspectRatioChange={actions.setAspectRatio}
        productData={state.productData}
        onProductDataChange={actions.setProductData}
      />

      <RefinementModal
        isOpen={state.isCorrectionModalOpen}
        onClose={() => actions.setIsCorrectionModalOpen(false)}
        prompt={state.correctionPrompt}
        onPromptChange={actions.setCorrectionPrompt}
        onApply={() => actions.handleGenerate(true)}
      />

      <ReferenceLibraryModal
        isOpen={state.isLibraryOpen}
        onClose={() => actions.setIsLibraryOpen(false)}
        category="ads"
        onSelect={(url) => actions.setStyleImageBase64(url)}
      />

      <HistoryModal
        isOpen={state.isHistoryModalOpen}
        onClose={() => actions.setIsHistoryModalOpen(false)}
        userId={authData?.userId || ''}
      />

      <ImageProTour />
    </DashboardLayout>
  );
}
