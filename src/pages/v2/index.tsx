import React from 'react';
import Head from 'next/head';
import SplitLayout from '../../components/v2/Layout/SplitLayout';
import ChatOrchestrator from '../../components/v2/Chat/ChatOrchestrator';
import ArtifactViewer from '../../components/v2/Canvas/ArtifactViewer';
import { useDiscovery } from '../../hooks/useDiscovery';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Notification from '../../components/common/Notification';
import HeaderCredits from '../../components/dashboard/HeaderCredits';

const V2PrototypePage: React.FC = () => {
  const {
    productData,
    creativePaths,
    landingState,
    isDiscovering,
    isRecommending,
    isDesigning,
    error,
    success,
    setError,
    setSuccess,
    discover,
    getCreativeRecommendations,
    generateLandingProposal,
    selectSection,
    selectReference,
    resetDiscovery,
    setProductData,
    generateSection,
    generateAdImage,
    updateSectionInstructions,
    getAdConcepts,
    setPhase,
    startAutoGeneration,
    stopAutoGeneration
  } = useDiscovery();

  return (
    <DashboardLayout>
      <Head>
        <title>DropApp V2 | Invisible Engineering</title>
      </Head>

      <div className="v2-layout-container flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold border-l-4 border-primary-color pl-4 tracking-tight text-white">DropApp V2 <span className="text-primary-color/50 text-sm ml-2 font-black uppercase tracking-widest">BETA</span></h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] pl-5 opacity-70">Ingeniería invisible para tu e-commerce</p>
          </div>
          <HeaderCredits showWelcome={false} className="md:min-w-[320px]" />
        </div>

        <div className="flex-1 min-h-0">
          <SplitLayout
            chatPanel={
              <ChatOrchestrator
                onDiscover={discover}
                isDiscovering={isDiscovering || isRecommending || isDesigning}
                onReset={resetDiscovery}
                productData={productData}
                setProductData={setProductData}
                creativePaths={creativePaths}
                landingState={landingState}
                onUpdateSection={updateSectionInstructions}
                setSuccess={setSuccess}
              />
            }
            canvasPanel={
              <ArtifactViewer
                data={productData}
                creativePaths={creativePaths}
                landingState={landingState}
                isLoading={isDiscovering || isRecommending}
                isRecommending={isRecommending}
                isDesigning={isDesigning}
                error={error}
                onConfirmDiscovery={getCreativeRecommendations}
                onSelectPath={generateLandingProposal}
                onSelectSection={selectSection}
                onSelectReference={selectReference}
                onGenerateSection={generateSection}
                onGenerateAds={getAdConcepts}
                onGenerateAdImage={generateAdImage}
                onAutoGenerate={startAutoGeneration}
                onStopAutoGenerate={stopAutoGeneration}
                setPhase={setPhase}
              />
            }
          />
        </div>

        {error && (
          <Notification
            message={error}
            type="error"
            onClose={() => setError(null)}
          />
        )}
        {success && (
          <Notification
            message={success}
            type="success"
            onClose={() => setSuccess(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default V2PrototypePage;
