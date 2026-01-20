import React from 'react';
import Head from 'next/head';
import SplitLayout from '../../components/v2/Layout/SplitLayout';
import ChatOrchestrator from '../../components/v2/Chat/ChatOrchestrator';
import ArtifactViewer from '../../components/v2/Canvas/ArtifactViewer';
import { useDiscovery } from '../../hooks/useDiscovery';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Notification from '../../components/common/Notification';

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
    setPhase
  } = useDiscovery();

  return (
    <DashboardLayout>
      <Head>
        <title>DropApp V2 | Invisible Engineering</title>
      </Head>

      <div className="v2-layout-container">
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
              setPhase={setPhase}
            />
          }
        />

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
