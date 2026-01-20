import { NextApiRequest, NextApiResponse } from 'next';
import { BoldService } from '../../../lib/boldService';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Verificar que hay un usuario logueado o que viene de un origen confiable (admin)
  // Como es de prueba, usaremos el userId que venga en el body o uno por defecto si es admin
  const { userId, planKey = 'pro' } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'UserId es requerido para la prueba' });
  }

  try {
    const timestamp = Date.now();
    const reference = `${userId}_${planKey}_TEST_${timestamp}`;
    
    console.log(`[Bold-Test] Creando link de prueba para ${userId}. Referencia: ${reference}`);

    const paymentUrl = await BoldService.createPaymentLink({
      amount: 1000, // $1.000 COP
      currency: 'COP',
      reference,
      description: `PRUEBA DE PAGO - PLAN ${planKey.toUpperCase()}`,
      callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dropapp.lat'}/admin/test-bold?status=success`
    });

    return res.status(200).json({ success: true, url: paymentUrl });
  } catch (error: any) {
    console.error('[Bold-Test] Error creando link:', error);
    return res.status(500).json({ error: error.message });
  }
}
