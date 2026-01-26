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
    console.log('[AuthCallback] Iniciando procesamiento de sesión (Unica vez)');
    const handleCallback = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Callback error:', sessionError);
        setError(sessionError.message);
        return;
      }

      if (data.session && data.session.user) {
        const user = data.session.user;

        // Verificar si es un nuevo registro
        const createdAt = new Date(user.created_at).getTime();
        const now = new Date().getTime();
        const diffInMinutes = (now - createdAt) / 1000 / 60;
        const isNewUser = diffInMinutes < 1; // Revertido a 1 minuto por solicitud del usuario

        console.log(`[AuthCallback] Usuario: ${user.email}, Creado hace: ${diffInMinutes.toFixed(2)} minutos. isNewUser: ${isNewUser}`);

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
              const errData = await response.json();
              console.error('[AuthCallback] Error en API notificación:', errData);
            } else {
              console.log('[AuthCallback] Notificación enviada correctamente a la API');
            }
          } catch (e) {
            console.error('[AuthCallback] Error al llamar a la API de notificación:', e);
          }
        }

        // Todo bien, redirigir al home o dashboard
        router.push('/');
      } else {
        // No hay sesión aún, tal vez PKCE está procesando o hay error de hash
        const hash = window.location.hash;
        if (hash && (hash.includes('error') || hash.includes('access_token'))) {
          // Si hay access_token el listener de onAuthStateChange en AppContext probablemente ya lo tomó
          // Esperamos un poco y redirigimos
          setTimeout(() => router.push('/'), 2000);
        } else {
          // Si no hay hash ni sesión, algo falló o se canceló
          // setError('No se pudo establecer la sesión');
        }
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
      <p className="mt-8 text-gray-400 font-medium animate-pulse tracking-widest text-xs uppercase">
        Verificando credenciales...
      </p>
    </div>
  );
}
