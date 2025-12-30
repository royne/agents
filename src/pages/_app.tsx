import type { AppProps } from 'next/app'
import '../styles/globals.css'
import '../styles/pomodoro.css'
import { AppProvider, useAppContext } from '../contexts/AppContext';
import { PomodoroProvider, usePomodoroContext } from '../contexts/PomodoroContext';
import MiniPomodoro from '../components/planning/pomodoro/MiniPomodoro';
import { useRouter, type NextRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import BrandLoader from '../components/common/BrandLoader';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <AppProvider>
      <PomodoroProvider>
        <AuthWrapper {...{ Component, pageProps }} router={useRouter()} />
      </PomodoroProvider>
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
  const { activeTask, isPomodorActive, stopPomodoro } = usePomodoroContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 [DEBUG] AuthWrapper: Mount/Update', { loading, authDataNull: authData === null });

    // Safety fallback: Desbloqueo absoluto tras 6 segundos pase lo que pase
    const globalTimeout = setTimeout(() => {
      if (loading) {
        console.error('🚨 [DEBUG] AuthWrapper: GLOBAL TIMEOUT REACHED');
        setLoading(false);
      }
    }, 6000);

    if (authData === null) {
      console.log('🔍 [DEBUG] AuthWrapper: authData es null, esperando...');
      return () => clearTimeout(globalTimeout);
    };

    console.log('🔍 [DEBUG] AuthWrapper: Procesando authData', authData);

    const isAuthPath = router.pathname.startsWith('/auth');
    const isPublicPath = router.pathname === '/';

    if (authData.isAuthenticated) {
      if (isAuthPath) {
        console.log('🔍 [DEBUG] AuthWrapper: Redirect to /');
        router.push('/');
      }
    } else {
      if (!isAuthPath && !isPublicPath) {
        console.log('🔍 [DEBUG] AuthWrapper: Redirect to login');
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

      {/* Renderizar el MiniPomodoro cuando hay una tarea activa */}
      {isPomodorActive && activeTask && (
        <MiniPomodoro
          taskId={activeTask.id}
          taskTitle={activeTask.title}
          onClose={stopPomodoro}
        />
      )}
    </div>
  );

}