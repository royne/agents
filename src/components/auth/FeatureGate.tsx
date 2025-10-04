import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { FeatureKey } from '../../constants/features';
import { useRouter } from 'next/router';

interface FeatureGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const DefaultFallback: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className="flex items-center justify-center py-16">
    <div className="text-center p-8 bg-theme-component rounded-lg shadow-md max-w-md">
      <div className="text-red-500 text-5xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold text-theme-primary mb-4">Acceso restringido</h1>
      <p className="text-theme-secondary mb-6">Tu plan actual no incluye esta función.</p>
      <button 
        onClick={onClick} 
        className="px-4 py-2 bg-primary-color text-white rounded hover:bg-blue-700 transition-colors"
      >
        Ver planes
      </button>
    </div>
  </div>
);

const FeatureGate: React.FC<FeatureGateProps> = ({ feature, children, fallback }) => {
  const { hasFeature } = useAppContext();
  const router = useRouter();

  if (!hasFeature(feature)) {
    if (fallback) return <>{fallback}</>;
    return <DefaultFallback onClick={() => router.push('/settings')} />;
  }

  return <>{children}</>;
};

export default FeatureGate;
