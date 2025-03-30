import type { AppProps } from 'next/app'
import '../styles/globals.css'
import { AppProvider, useAppContext } from '../contexts/AppContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppProvider>
      <AuthWrapper Component={Component} pageProps={pageProps} />
    </AppProvider>
  );
}

function AuthWrapper({ Component, pageProps }: AppProps) {
  const { authData } = useAppContext();
  const router = useRouter();
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

  if (loading) return <div className="min-h-screen bg-gray-900"></div>;

  return (
    <div className="min-h-screen max-h-screen bg-gray-900 text-gray-100 border border-transparent overflow-hidden">
      <Component {...pageProps} />
    </div>
  );
}