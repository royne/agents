import type { AppProps } from 'next/app'
import '../styles/globals.css'
import { AppProvider, useAppContext } from '../contexts/AppContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

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

  useEffect(() => {
    if (!authData?.isAuthenticated && !router.pathname.startsWith('/auth')) {
      router.push('/auth/login');
    }
    if (authData?.isAuthenticated && router.pathname.startsWith('/auth')) {
      router.push('/dashboard');
    }
  }, [authData, router]);

  return (
    <div className="min-h-screen max-h-screen bg-gray-900 text-gray-100 border border-transparent overflow-hidden">
      <Component {...pageProps} />
    </div>
  );
}