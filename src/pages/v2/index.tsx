import React from 'react';
import Head from 'next/head';
import SplitLayout from '../../components/v2/Layout/SplitLayout';
import ChatOrchestrator from '../../components/v2/Chat/ChatOrchestrator';
import ArtifactViewer from '../../components/v2/Canvas/ArtifactViewer';
import { useDiscovery } from '../../hooks/useDiscovery';
import DashboardLayout from '../../components/layout/DashboardLayout';

const V2PrototypePage: React.FC = () => {
  const { productData, isDiscovering, error, discover, resetDiscovery } = useDiscovery();

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
              isDiscovering={isDiscovering}
              onReset={resetDiscovery}
            />
          }
          canvasPanel={
            <ArtifactViewer
              data={productData}
              isLoading={isDiscovering}
              error={error}
            />
          }
        />
      </div>
    </DashboardLayout>
  );
};

export default V2PrototypePage;
