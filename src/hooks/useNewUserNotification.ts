import { useEffect } from 'react';
import { useRouter } from 'next/router';

interface HookAuthData {
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
  name?: string;
}

export const useNewUserNotification = (authData: HookAuthData | null) => {
  const router = useRouter();

  useEffect(() => {
    // 1. Solo actuar si el usuario está autenticado y el router está listo
    if (!authData?.isAuthenticated || !authData.userId || !router.isReady) return;

    // 2. Detectar señal (Query Param o Fallback en LocalStorage)
    const hasQueryParam = router.query.new_user === 'true';
    const hasLocalStorageFlag = localStorage.getItem('pending_new_user_notification') === 'true';

    if (hasQueryParam || hasLocalStorageFlag) {
      const notifyNewUser = async () => {
        try {
          console.log('[useNewUserNotification] Señal de nuevo usuario detectada. Notificando...');
          
          // Limpiar señales para evitar duplicados
          localStorage.removeItem('pending_new_user_notification');
          
          if (hasQueryParam) {
            const { new_user, ...restQuery } = router.query;
            router.replace({ pathname: router.pathname, query: restQuery }, undefined, { shallow: true });
          }

          await fetch('/api/notifications/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'new_user',
              email: authData.email || authData.userId,
              name: authData.name || 'Nuevo Usuario'
            })
          });
          
          console.log('[useNewUserNotification] Notificación enviada con éxito.');
        } catch (err) {
          console.error('[useNewUserNotification] Error al procesar notificación:', err);
        }
      };

      notifyNewUser();
    }
  }, [authData?.isAuthenticated, authData?.userId, router.query.new_user, router.isReady]);
};
