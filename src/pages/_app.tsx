import type { AppProps } from 'next/app'
import '../styles/globals.css'
import '../styles/pomodoro.css'
import { AppProvider, useAppContext } from '../contexts/AppContext';
import { PomodoroProvider, usePomodoroContext } from '../contexts/PomodoroContext';
import MiniPomodoro from '../components/planning/pomodoro/MiniPomodoro';
import { useRouter, type NextRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function App({ Component, pageProps }: AppProps) {
const router = useRouter();
  return (
    <AppProvider>
      <PomodoroProvider>
        <AuthWrapper {...{Component, pageProps}} router={useRouter()} />
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
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && !authData) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (session && router.pathname.startsWith('/auth')) {
        router.push('/');
      } else if (!session && !router.pathname.startsWith('/auth')) {
        router.push('/auth/login');
      }
      setLoading(false);
    };

    checkAuth();
  }, [router, authData]);
  
  // Efecto para inicializar el tema
  useEffect(() => {
    if (themeConfig) {
      // Aplicar el tema al documento
      document.documentElement.style.setProperty('--primary-color', themeConfig.primaryColor);
      document.documentElement.classList.toggle('dark-theme', themeConfig.useDarkMode);
      document.documentElement.classList.toggle('custom-theme', !themeConfig.useDarkMode);
    }
  }, [themeConfig]);

  if (loading) return <div className="min-h-screen bg-theme-primary"></div>;

  return (
    <div className="min-h-screen max-h-screen bg-theme-primary text-theme-primary border border-transparent overflow-hidden">
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