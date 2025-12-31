import type { AppProps } from 'next/app'
import '../styles/globals.css'
import { AppProvider, useAppContext } from '../contexts/AppContext';
import { useRouter, type NextRouter } from 'next/router';
import { useEffect, useState } from 'react';
import BrandLoader from '../components/common/BrandLoader';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppProvider>
      <AuthWrapper {...{ Component, pageProps }} router={useRouter()} />
    </AppProvider>
  );
}

interface AuthWrapperProps {
  Component: React.ComponentType<any>;
  pageProps: any;
  router: NextRouter;
}

function AuthWrapper({ Component, pageProps, router }: AuthWrapperProps) {
  const { authData, themeConfig } = useAppContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety fallback: Desbloqueo absoluto tras 6 segundos pase lo que pase
    const globalTimeout = setTimeout(() => {
      if (loading) {
        console.error('AuthWrapper: GLOBAL TIMEOUT REACHED');
        setLoading(false);
      }
    }, 6000);

    if (authData === null) {
      return () => clearTimeout(globalTimeout);
    };

    const isAuthPath = router.pathname.startsWith('/auth');
    const isPublicPath = router.pathname === '/';

    if (authData.isAuthenticated) {
      if (isAuthPath) {
        router.push('/');
      }
    } else {
      if (!isAuthPath && !isPublicPath) {
        router.push('/auth/login');
      }
    }

    setLoading(false);
    return () => clearTimeout(globalTimeout);
  }, [router.pathname, authData]);

  // Efecto para inicializar el tema
  useEffect(() => {
    if (themeConfig) {
      // Aplicar el tema al documento
      document.documentElement.style.setProperty('--primary-color', themeConfig.primaryColor);
      document.documentElement.classList.toggle('dark-theme', themeConfig.useDarkMode);
      document.documentElement.classList.toggle('custom-theme', !themeConfig.useDarkMode);
    }
  }, [themeConfig]);

  if (loading) {
    return <BrandLoader />;
  }

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary border border-transparent">
      <Component {...pageProps} />
    </div>
  );
}