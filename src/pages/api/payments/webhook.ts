import { NextApiRequest, NextApiResponse } from 'next';
import { BoldService } from '../../../lib/boldService';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { Plan, PLAN_CREDITS } from '../../../constants/plans';

// Bold envía el cuerpo en crudo para la validación de la firma
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: NextApiRequest) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers['x-bold-signature'] as string;

    if (!BoldService.verifySignature(rawBody, signature)) {
      console.error('Firma de Bold no válida');
      return res.status(401).json({ error: 'Firma no válida' });
    }

    const payload = JSON.parse(rawBody);
    console.log('Webhook de Bold recibido:', payload.event);

    // Solo procesamos ventas aprobadas
    if (payload.event === 'SALE_APPROVED') {
      const { reference } = payload.data;
      
      // La referencia tiene el formato userId_planKey_timestamp
      const [userId, planKey] = reference.split('_');

      if (userId && planKey) {
        console.log(`Pago aprobado para usuario ${userId}, plan ${planKey}`);
        
        const credits = PLAN_CREDITS[planKey as Plan] || 0;
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        // 1. Actualizar créditos fuente de verdad (user_credits) con supabaseAdmin
        const { error: creditError } = await supabaseAdmin
          .from('user_credits')
          .update({
            plan_key: planKey,
            balance: credits,
            unlimited_credits: planKey === 'tester',
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (creditError) {
          console.error('Error al actualizar créditos con supabaseAdmin:', creditError);
        } else {
          // 2. Actualizar perfil para redundancia/UI heredada
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ 
              plan: planKey,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

          if (profileError) {
            console.error('Error al actualizar perfil con supabaseAdmin:', profileError);
          }
          
          console.log(`✅ Plan ${planKey} activado correctamente para ${userId}`);
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Error en Webhook de Bold:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
}
