import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import BrandLoader from '../../components/common/BrandLoader';

export default function AuthCallbackPage() {
  const router = useRouter();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const handleCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();

        if (error) {
          console.error('[AuthCallback] Error en sesión:', error);
          router.push('/auth/login');
          return;
        }

        // Redirigir al dashboard simplemente
        router.replace('/');
      } catch (err) {
        console.error('[AuthCallback] Error crítico:', err);
        router.replace('/auth/login');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050608]">
      <BrandLoader />
      <p className="text-gray-500 font-medium mt-6 text-[10px] uppercase tracking-widest animate-pulse">
        Finalizando inicio de sesión...
      </p>
    </div>
  );
}
