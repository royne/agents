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
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          router.push('/auth/login');
          return;
        }

        const user = data.session.user;
        const createdAt = new Date(user.created_at).getTime();
        const now = new Date().getTime();
        const isNewUser = Math.abs(now - createdAt) < 60000; // 1 minuto

        if (isNewUser) {
          // Backup: Guardamos un flag en localStorage por si el query param se pierde en los redirects de Next.js
          localStorage.setItem('pending_new_user_notification', 'true');
        }

        // Redirigir al dashboard con flag si es nuevo
        const target = isNewUser ? '/?new_user=true' : '/';

        // Usamos window.location.href para un "hard redirect" que asegura que el parámetro llegue
        // y evita interferencias del router de Next.js en el paso intermedio
        window.location.href = target;
      } catch (err) {
        console.error('[AuthCallback] Error crítico:', err);
        router.push('/auth/login');
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
