import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import BrandLoader from '../../components/common/BrandLoader';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const handleCallback = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[AuthCallback] Error Session:', sessionError);
          setError(sessionError.message);
          return;
        }

        if (data.session && data.session.user) {
          const user = data.session.user;

          // Lógica de detección de nuevo usuario (margen de 1 minuto)
          const createdAt = new Date(user.created_at).getTime();
          const now = new Date().getTime();
          const diffInMinutes = (now - createdAt) / 1000 / 60;
          const isNewUser = diffInMinutes < 1;

          if (isNewUser) {
            try {
              const response = await fetch('/api/notifications/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'new_user',
                  email: user.email,
                  name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]
                })
              });

              if (!response.ok) {
                console.warn('[AuthCallback] No se pudo enviar la notificación a Discord');
              }
            } catch (notifyErr) {
              console.error('[AuthCallback] Error enviando notificación:', notifyErr);
            }
          }

          // Redirección final al Dashboard
          router.push('/');
        } else {
          // No hay sesión aún, verificar hash por si acaso
          const hash = window.location.hash;
          if (hash && (hash.includes('error') || hash.includes('access_token'))) {
            setTimeout(() => router.push('/'), 2000);
          } else {
            router.push('/auth/login');
          }
        }
      } catch (err) {
        console.error('[AuthCallback] Critical Error:', err);
        setError('Error crítico durante la autenticación.');
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050608] text-white p-4">
        <div className="soft-card p-8 border-rose-500/20 max-w-sm w-full text-center">
          <div className="text-rose-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-2">Error de Autenticación</h1>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-primary-color py-3 rounded-xl font-bold"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050608]">
      <BrandLoader />
      <p className="mt-8 text-gray-400 font-medium animate-pulse tracking-widest text-xs uppercase text-center px-4">
        Cargando tu cuenta...
      </p>
    </div>
  );
}
