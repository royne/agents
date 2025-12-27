import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useImageUsage() {
  const [credits, setCredits] = useState<number>(0);
  const [limit, setLimit] = useState<number>(20);
  const [plan, setPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Unimos con subscription_plans para obtener el límite
      const { data, error } = await supabase
        .from('user_credits')
        .select(`
          balance,
          plan_key,
          subscription_plans (
            monthly_credits
          )
        `)
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setCredits(data.balance);
        setPlan(data.plan_key);
        setLimit((data.subscription_plans as any)?.monthly_credits || 20);
      }
    } catch (err) {
      console.error('Error fetching credit usage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();

    // Suscribirse a cambios en tiempo real para los créditos del usuario actual
    const subscribeToCredits = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const channel = supabase
        .channel('user_credits_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_credits',
            filter: `user_id=eq.${session.user.id}`
          },
          (payload) => {
            if (payload.new && 'balance' in payload.new) {
              setCredits(payload.new.balance);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    subscribeToCredits();
  }, [fetchUsage]);

  return {
    credits,
    limit,
    plan,
    loading,
    refreshCredits: fetchUsage
  };
}
