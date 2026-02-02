import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { CouponService } from '../../../lib/couponService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const supabase = createPagesServerClient({ req, res });
  let { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        session = { user } as any;
      }
    }
  }

  if (!session) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { code, planKey } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Faltan parámetros: code es requerido' });
  }

  try {
    let originalPrice = undefined;

    // 1. Obtener el precio original del plan (Opcional)
    if (planKey) {
      const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      );

      const { data: plan, error: planError } = await adminSupabase
        .from('subscription_plans')
        .select('price_usd')
        .eq('key', planKey)
        .single();

      if (!planError && plan) {
        originalPrice = plan.price_usd;
      }
    }

    // 2. Validar el cupón
    const result = await CouponService.validateCoupon(
      code,
      session.user.id,
      planKey,
      originalPrice
    );

    if (!result.isValid) {
      return res.status(400).json({ error: result.message });
    }

    return res.status(200).json({
      success: true,
      coupon: {
        id: result.coupon?.id,
        code: result.coupon?.code,
        type: result.coupon?.type,
        value: result.coupon?.value,
        plan_key: result.coupon?.plan_key
      },
      discountedAmount: result.discountedAmount,
      extraCredits: result.extraCredits
    });
  } catch (error: any) {
    console.error('Error validating coupon API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
