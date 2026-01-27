import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface HookAuthData {
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
  name?: string;
}

export const useNewUserNotification = (authData: HookAuthData | null) => {
  const isProcessing = useRef(false);

  useEffect(() => {
    // 1. Validaciones básicas
    if (!authData?.isAuthenticated || !authData.userId || isProcessing.current) return;

    const checkAndNotify = async () => {
      try {
        const userId = authData.userId;
        const storageKey = `notified_user_${userId}`;

        // 2. CANDADO INMUTABLE: Si ya lo procesamos en este navegador para esta cuenta, FIN.
        if (localStorage.getItem(storageKey)) return;

        isProcessing.current = true;
        console.log('[useNewUserNotification] Verificando cuenta nueva por fecha...');

        // 3. Consultar datos frescos de Supabase Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          isProcessing.current = false;
          return;
        }

        // 4. Lógica de antigüedad (1 minuto de margen para ser ultra-precisos)
        const createdAt = new Date(user.created_at).getTime();
        const now = new Date().getTime();
        const diffInMinutes = Math.abs(now - createdAt) / 1000 / 60;

        if (diffInMinutes < 1) {
          console.log('[useNewUserNotification] ¡Bingo! Cuenta recién creada (menos de 1min). Notificando...');
          
          await fetch('/api/notifications/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'new_user',
              email: user.email || authData.email,
              name: authData.name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]
            })
          });
        }

        // 5. BLOQUEO PERMANENTE: Marcamos como procesado para este usuario.
        localStorage.setItem(storageKey, 'true');
        
      } catch (err) {
        console.error('[useNewUserNotification] Error silencioso:', err);
      } finally {
        isProcessing.current = false;
      }
    };

    checkAndNotify();
  }, [authData?.isAuthenticated, authData?.userId]);
};
