import { NextApiRequest, NextApiResponse } from 'next';
import { BoldService } from '../../../lib/boldService';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { Plan, PLAN_CREDITS } from '../../../constants/plans';
import { NotificationService } from '../../../lib/notificationService';

// Bold envía el cuerpo en crudo para la validación de la firma
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const boldSignature = req.headers['x-bold-signature'] as string;
  console.log(`[Webhook Bold] Petición recibida. Firma presente: ${!!boldSignature}`);

  try {
    const rawBuffer = await getRawBody(req);
    const rawBody = rawBuffer.toString('utf-8');
    
    console.log(`[Webhook Bold] Body recibido (len: ${rawBuffer.length} bytes).`);
    console.log(`[Webhook Bold] Inicio (hex): ${rawBuffer.slice(0, 10).toString('hex')}`);
    
    if (!boldSignature) {
      console.error('[Webhook Bold] Error: x-bold-signature ausente');
      return res.status(401).json({ error: 'Firma ausente' });
    }

    if (!BoldService.verifySignature(rawBuffer.toString('utf8'), boldSignature)) {
      console.error('[Webhook Bold] Error: Firma no válida');
      return res.status(401).json({ error: 'Firma no válida' });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event || payload.type;
    const eventData = payload.data || payload;
    
    const isApproved = eventType === 'SALE_APPROVED' || eventType === 'sale.approved';

    if (isApproved) {
      // Bold puede enviar la referencia en diferentes lugares según la versión
      const reference = eventData.metadata?.reference || eventData.reference || payload.reference;
      
      if (!reference) {
        console.error('[Webhook Bold] Error: No se encontró referencia en el payload:', JSON.stringify(payload).substring(0, 300));
        return res.status(400).json({ error: 'Referencia ausente' });
      }

      // La referencia tiene el formato userId_planKey_timestamp
      const referenceParts = reference.split('_');
      if (referenceParts.length < 2) {
        console.warn('[Webhook Bold] Referencia no estándar, intentando parseo alternativo...');
        // Aquí podrías añadir lógica si Bold Sandbox envía referencias diferentes
      }

      const [userId, planKey] = referenceParts;

      if (userId && planKey) {
        console.log(`[Webhook Bold] Procesando activación: User=${userId}, Plan=${planKey}`);
        
        const credits = PLAN_CREDITS[planKey as Plan] || 0;
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        // 1. Actualizar créditos fuente de verdad (user_credits)
        const { error: creditError } = await supabaseAdmin
          .from('user_credits')
          .update({
            plan_key: planKey,
            balance: credits,
            unlimited_credits: planKey === 'tester',
            expires_at: expiresAt.toISOString(),
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (creditError) {
          console.error('[Webhook Bold] Error DB user_credits:', creditError);
          throw creditError;
        }

        // 2. Actualizar perfil para redundancia/UI heredada
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            plan: planKey,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (profileError) {
          console.error('[Webhook Bold] Error DB profiles:', profileError);
        }
        
        // Notificar venta aprobada
        try {
          const rawAmount = eventData.amount?.total_amount || eventData.amount;
          const amount = rawAmount ? `$${rawAmount.toLocaleString('es-CO')}` : undefined;
          await NotificationService.notifyNewSale(userId, planKey, amount);
        } catch (notifErr) {
          console.warn('[Webhook Bold] Error enviando notificación:', notifErr);
        }
        
        console.log(`[Webhook Bold] ✅ ÉXITO: Plan ${planKey} activado para ${userId}`);
      }
    } else {
      console.log(`[Webhook Bold] Evento ignorado: ${eventType}`);
    }

    return res.status(200).json({ success: true, received: true });
  } catch (error: any) {
    console.error('[Webhook Bold] Error FATAL:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
