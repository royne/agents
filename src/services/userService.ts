import { supabase } from '../lib/supabase';
import { trackPixelEvent } from '../utils/pixelEvents';

export interface OnboardingData {
  userId: string;
  email: string;
  name: string;
  phone: string;
  country: string;
  avatar_url?: string;
}

export const UserService = {
  /**
   * Completa el proceso de onboarding del usuario:
   * 1. Actualiza el perfil en Supabase.
   * 2. Procesa la atribución de referidos (si existe en localStorage).
   * 3. Dispara eventos de marketing (Meta Pixel).
   * 4. Envía notificaciones a Discord.
   */
  async completeOnboarding(data: OnboardingData) {
    console.log('[UserService] Iniciando finalización de onboarding para:', data.email);

    try {
      // 1. Obtener referido del localStorage
      const referralCode = localStorage.getItem('dropapp_ref');
      
      // 2. Actualizar perfil del usuario
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: data.phone,
          country: data.country,
          avatar_url: data.avatar_url,
          is_setup_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', data.userId);

      if (profileError) throw profileError;

      // 3. Procesar Referido (Si existe)
      if (referralCode) {
        console.log('[UserService] Procesando referido:', referralCode);
        
        // Buscar al mentor
        const { data: mentorConfig } = await supabase
          .from('referral_configs')
          .select('user_id')
          .filter('referral_code', 'ilike', referralCode.trim())
          .single();

        if (mentorConfig && mentorConfig.user_id !== data.userId) {
          // Crear relación de referido
          await supabase.from('referrals').insert({
            mentor_id: mentorConfig.user_id,
            referred_id: data.userId,
            status: 'registered'
          });
          console.log('[UserService] Relación de referido creada con éxito.');
        }
        
        // Limpiar el localStorage después de procesarlo
        localStorage.removeItem('dropapp_ref');
      }

      // 4. Disparar Meta Pixel (CompleteRegistration)
      // Usamos datos enriquecidos para mejor matching
      trackPixelEvent('CompleteRegistration', {
        content_name: 'Registro Completo Onboarding',
        status: 'success',
        email: data.email,
        name: data.name,
        phone: data.phone,
        country: data.country,
        method: 'google'
      });

      // 5. Notificar a Discord (vía nuestra API interna)
      await fetch('/api/notifications/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_user',
          email: data.email,
          name: data.name,
          country: data.country,
          phone: data.phone
        })
      });

      return { success: true };
    } catch (error) {
      console.error('[UserService] Error en completeOnboarding:', error);
      return { success: false, error };
    }
  }
};
