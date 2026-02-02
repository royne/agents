import { supabaseAdmin } from './supabaseAdmin';
import { Plan } from '../constants/plans';

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'extra_credits';
  value: number;
  plan_key: string | null;
  max_uses: number;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
}

export interface CouponValidationResult {
  isValid: boolean;
  message?: string;
  coupon?: Coupon;
  discountedAmount?: number;
  extraCredits?: number;
}

export class CouponService {
  /**
   * Valida un cupón para un usuario y plan específico.
   */
  static async validateCoupon(
    code: string,
    userId: string,
    planKey?: string,
    originalAmount?: number
  ): Promise<CouponValidationResult> {
    try {
      // 1. Buscar el cupón
      const { data: coupon, error } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (error || !coupon) {
        return { isValid: false, message: 'El cupón no existe' };
      }

      // 2. Validar si está activo
      if (!coupon.is_active) {
        return { isValid: false, message: 'El cupón no está activo' };
      }

      // 3. Validar fecha de expiración
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return { isValid: false, message: 'El cupón ha expirado' };
      }

      // 4. Validar límite de usos totales
      if (coupon.current_uses >= coupon.max_uses) {
        return { isValid: false, message: 'El cupón ha alcanzado su límite de usos' };
      }

      // 5. Validar si aplica al plan seleccionado (solo si se provee planKey)
      if (planKey && coupon.plan_key && coupon.plan_key !== planKey) {
        return { isValid: false, message: `Este cupón solo es válido para el plan ${coupon.plan_key}` };
      }

      // 6. Validar si el usuario ya lo usó (Regla: 1 por usuario)
      const { data: usage, error: usageError } = await supabaseAdmin
        .from('coupon_usage')
        .select('id')
        .eq('coupon_id', coupon.id)
        .eq('user_id', userId)
        .single();

      if (usage) {
        return { isValid: false, message: 'Ya has utilizado este cupón anteriormente' };
      }

      // 7. Calcular beneficios
      let discountedAmount = originalAmount || 0;
      let extraCredits = 0;

      if (coupon.type === 'percentage') {
        discountedAmount = (originalAmount || 0) * (1 - coupon.value / 100);
      } else if (coupon.type === 'fixed_amount') {
        discountedAmount = Math.max(0, (originalAmount || 0) - coupon.value);
      } else if (coupon.type === 'extra_credits') {
        extraCredits = coupon.value;
      }

      return {
        isValid: true,
        coupon,
        discountedAmount,
        extraCredits
      };
    } catch (error: any) {
      console.error('[CouponService] Error validating coupon:', error);
      return { isValid: false, message: 'Error interno validando el cupón' };
    }
  }

  /**
   * Registra el uso de un cupón tras un pago exitoso.
   */
  static async registerUsage(couponId: string, userId: string, paymentId: string): Promise<boolean> {
    try {
      // 1. Insertar el uso (La restricción UNIQUE en la DB evitará duplicados por si acaso)
      const { error: usageError } = await supabaseAdmin
        .from('coupon_usage')
        .insert({
          coupon_id: couponId,
          user_id: userId,
          payment_id: paymentId
        });

      if (usageError) {
        console.error('[CouponService] Error inserting usage:', usageError);
        return false;
      }

      // 2. Incrementar el contador de usos
      // Nota: En un entorno de alta concurrencia esto debería ser un rpc o incremento atómico
      // pero para el volumen inicial de DropApp, un update manual es suficiente.
      const { data: coupon } = await supabaseAdmin
        .from('coupons')
        .select('current_uses')
        .eq('id', couponId)
        .single();

      if (coupon) {
        await supabaseAdmin
          .from('coupons')
          .update({ current_uses: (coupon.current_uses || 0) + 1 })
          .eq('id', couponId);
      }

      return true;
    } catch (error) {
      console.error('[CouponService] Exception in registerUsage:', error);
      return false;
    }
  }
}
