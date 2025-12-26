import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useImageUsage() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('image_gen_count')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;
      setCount(data?.image_gen_count || 0);
    } catch (err) {
      console.error('Error fetching image usage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();

    // Suscribirse a cambios en tiempo real para el perfil del usuario actual
    const subscribeToProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const channel = supabase
        .channel('profile_usage_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${session.user.id}`
          },
          (payload) => {
            if (payload.new && 'image_gen_count' in payload.new) {
              setCount(payload.new.image_gen_count);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    subscribeToProfile();
  }, [fetchUsage]);

  return {
    count,
    loading,
    refreshCount: fetchUsage
  };
}
