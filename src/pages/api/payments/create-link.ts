import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { BoldService } from '../../../lib/boldService';
import { Plan } from '../../../constants/plans';
import { CouponService } from '../../../lib/couponService';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const supabase = createPagesServerClient({ req, res });
  let { data: { session } } = await supabase.auth.getSession();

  // Fallback para tokens en el header (importante para clientes que no usan cookies)
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
    return res.status(401).json({ error: 'No autorizado - Sesión no encontrada' });
  }

  const { planKey, couponCode } = req.body;

  if (!planKey) {
    return res.status(400).json({ error: 'Plan no especificado' });
  }

  try {
    // 1. Obtener detalles del plan usando el cliente de administración (bypass RLS)
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const { data: plan, error: planError } = await adminSupabase
      .from('subscription_plans')
      .select('price_usd, name')
      .eq('key', planKey)
      .single();

    if (planError || !plan) {
      console.error('Plan not found in DB:', { planKey, planError });
      return res.status(404).json({ error: `Plan '${planKey}' no encontrado en la base de datos` });
    }

    let amount = plan.price_usd;
    let couponId = null;

    // 2. Aplicar Cupón si existe
    if (couponCode) {
      const validation = await CouponService.validateCoupon(
        couponCode,
        session.user.id,
        planKey,
        amount
      );

      if (validation.isValid && validation.coupon) {
        amount = validation.discountedAmount;
        couponId = validation.coupon.id;
        console.log(`[CreateLink] Aplicando cupón ${couponCode} (${couponId}). Nuevo monto: ${amount}`);
      } else {
        console.warn(`[CreateLink] Intento de uso de cupón inválido: ${couponCode} - ${validation.message}`);
        // Opcional: Podríamos retornar error aquí, pero por ahora solo ignoramos el cupón inválido
        // para dar una mejor UX (el usuario paga el precio full si metió mal el código)
      }
    }
    
    // Redondear para evitar errores de precisión a 1 decimal
    const roundedAmount = Math.round(amount * 10) / 10;
    
    if (roundedAmount <= 0 && plan.price_usd > 0) {
      return res.status(400).json({ error: 'El cupón cubre el 100% del costo. Contacta a soporte para activación manual' });
    }

    const userEmail = session.user.email;
    const userId = session.user.id;
    
    // Mapeo de plan a prefijo de 1 letra para ahorrar espacio
    const planPrefixes: Record<string, string> = {
      'free': 'F',
      'starter': 'S',
      'pro': 'P',
      'business': 'B',
      'tester': 'T'
    };
    const pfx = planPrefixes[planKey] || 'X';
    
    // Unicidad: últimos 5 dígitos del timestamp (base 36 para más brevedad: 3-4 chars)
    const unique = Date.now().toString(36).slice(-4);
    
    // Cupón: máximo 15 caracteres para no exceder los 60 totales
    const cleanCoupon = couponCode ? couponCode.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15) : 'NONE';

    // ESTRUCTURA: UUID(36) + _ + PFX(1) + _ + COUPON(max 15) + _ + UNIQ(4)
    // 36 + 1 + 1 + 1 + 15 + 1 + 4 = 59 caracteres (Perfecto < 60)
    const reference = `${userId}_${pfx}_${cleanCoupon}_${unique}`;
    
    const description = `Suscripción ${plan.name} - DROPAPP${couponCode ? ` (Cupón: ${couponCode})` : ''}`;
    
    const host = req.headers.host;
    const isLocalhost = host?.includes('localhost') || host?.includes('127.0.0.1');
    const callbackUrl = isLocalhost ? undefined : `https://${host}/profile?payment=success`;

    const paymentUrl = await BoldService.createPaymentLink({
      amount: roundedAmount,
      currency: 'USD',
      reference,
      description,
      callbackUrl,
      payerEmail: userEmail
    });

    console.log('roundedAmount', roundedAmount);
    console.log('planKey', planKey);
    console.log('couponCode', couponCode);
    console.log('reference', reference);
    console.log('paymentUrl', paymentUrl);
    return res.status(200).json({ url: paymentUrl });
  } catch (error: any) {
    console.error('Error generating Bold link:', error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}
