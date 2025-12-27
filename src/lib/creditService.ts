import { supabase } from './supabase';
import { CREDIT_COSTS, CreditAction } from '../constants/credits';

export class CreditService {
  /**
   * Verifica si un usuario tiene créditos suficientes para una acción.
   * Si es super_admin u owner, retorna true (bypass).
   */
  static async canPerformAction(userId: string, action: CreditAction, supabaseClient: any = supabase): Promise<{ can: boolean; balance: number; isUnlimited: boolean }> {
    const cost = CREDIT_COSTS[action];
    if (cost === 0) return { can: true, balance: 0, isUnlimited: true };

    const { data: credits, error } = await supabaseClient
      .from('user_credits')
      .select('balance, unlimited_credits')
      .eq('user_id', userId)
      .single();

    if (error || !credits) {
      console.error('Error fetching credits:', error);
      return { can: false, balance: 0, isUnlimited: false };
    }

    if (credits.unlimited_credits) {
      return { can: true, balance: credits.balance, isUnlimited: true };
    }

    return {
      can: credits.balance >= cost,
      balance: credits.balance,
      isUnlimited: false
    };
  }

  /**
   * Consume créditos de un usuario y registra la acción en el log.
   * No resta si el usuario tiene créditos ilimitados.
   */
  static async consumeCredits(userId: string, action: CreditAction, details: any = {}, supabaseClient: any = supabase) {
    const cost = CREDIT_COSTS[action];
    if (cost === 0) return { success: true };

    // 1. Obtener estado actual
    const { data: credits } = await supabaseClient
      .from('user_credits')
      .select('balance, unlimited_credits, total_consumed')
      .eq('user_id', userId)
      .single();

    if (!credits) return { success: false, error: 'No se encontró billetera de créditos' };

    // 2. Si es ilimitado, solo logueamos pero no restamos
    if (credits.unlimited_credits) {
      await this.logUsage(userId, action, 0, details, supabaseClient);
      return { success: true, balance: credits.balance };
    }

    if (credits.balance < cost) {
      return { success: false, error: 'Créditos insuficientes' };
    }

    // 3. Restar créditos
    const newBalance = credits.balance - cost;
    const { error: updateError } = await supabaseClient
      .from('user_credits')
      .update({ 
        balance: newBalance,
        total_consumed: (credits.total_consumed || 0) + cost,
        updated_at: new UTCDate().toISOString() 
      })
      .eq('user_id', userId);

    if (updateError) return { success: false, error: updateError.message };

    // 4. Registrar log
    await this.logUsage(userId, action, cost, details, supabaseClient);

    return { success: true, balance: newBalance };
  }

  private static async logUsage(userId: string, action: CreditAction, spent: number, details: any, supabaseClient: any = supabase) {
    await supabaseClient.from('usage_log').insert({
      user_id: userId,
      action_type: action.toLowerCase(),
      credits_spent: spent,
      details
    });
  }
}

// Clase auxiliar para fechas (si no existe)
class UTCDate extends Date {
    toISOString() {
        return super.toISOString();
    }
}
