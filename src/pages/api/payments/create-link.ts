import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { BoldService } from '../../../lib/boldService';
import { Plan } from '../../../constants/plans';


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

  const { planKey } = req.body;

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

    const amount = plan.price_usd;
    
    // Si el precio es 0, no generamos link (el frontend ya debería filtrar esto, pero por seguridad)
    if (amount <= 0) {
      return res.status(400).json({ error: 'Este plan es gratuito o no requiere pago' });
    }

    const userEmail = session.user.email;
    const userId = session.user.id;
    
    // Referencia única: user_id|plan_key|timestamp
    const reference = `${userId}_${planKey}_${Date.now()}`;
    const description = `Suscripción ${plan.name} - DROPAPP`;
    
    // URL de retorno (Bold prohíbe el uso de 'localhost' en esta URL, causando error 403)
    const host = req.headers.host;
    const isLocalhost = host?.includes('localhost') || host?.includes('127.0.0.1');
    const callbackUrl = isLocalhost ? undefined : `https://${host}/profile?payment=success`;

    const paymentUrl = await BoldService.createPaymentLink({
      amount,
      currency: 'USD',
      reference,
      description,
      callbackUrl,
      payerEmail: userEmail
    });

    return res.status(200).json({ url: paymentUrl });
  } catch (error: any) {
    console.error('Error generating Bold link:', error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}
