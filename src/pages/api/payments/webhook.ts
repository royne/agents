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
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[Bold-Webhook][${requestId}] >>> NUEVA SOLICITUD RECIBIDA`);
  console.log(`[Bold-Webhook][${requestId}] Method: ${req.method}, URL: ${req.url}`);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const boldSignature = req.headers['x-bold-signature'] as string;
  console.log(`[Bold-Webhook][${requestId}] Firma ('x-bold-signature'): ${boldSignature ? boldSignature.substring(0, 10) + '...' : 'AUSENTE'}`);
  
  try {
    const rawBuffer = await getRawBody(req);
    const rawBody = rawBuffer.toString('utf-8');
    
    console.log(`[Bold-Webhook][${requestId}] RAW BODY LENGTH: ${rawBuffer.length} bytes`);
    
    if (!boldSignature) {
      console.error(`[Bold-Webhook][${requestId}] ERROR: x-bold-signature ausente en headers`);
      return res.status(401).json({ error: 'Firma ausente' });
    }

    // Validación de firma
    console.log(`[Bold-Webhook][${requestId}] Validando firma...`);
    if (!BoldService.verifySignature(rawBody, boldSignature)) {
      console.error(`[Bold-Webhook][${requestId}] ERROR: Verificación de firma fallida`);
      // En modo debug, podríamos querer ver el body si falla la firma (cuidado con PII)
      // console.log(`[Bold-Webhook][${requestId}] BODY que falló:`, rawBody.substring(0, 1000));
      return res.status(401).json({ error: 'Firma no válida' });
    }
    console.log(`[Bold-Webhook][${requestId}] Firma VALIDADA correctamente`);

    const payload = JSON.parse(rawBody);
    const eventType = payload.event || payload.type;
    const eventData = payload.data || payload;
    
    console.log(`[Bold-Webhook][${requestId}] EVENTO: ${eventType}`);

    const isApproved = eventType === 'SALE_APPROVED' || eventType === 'sale.approved';

    if (isApproved) {
      console.log(`[Bold-Webhook][${requestId}] PROCESANDO VENTA APROBADA`);
      
      const reference = eventData.metadata?.reference || eventData.reference || payload.reference;
      console.log(`[Bold-Webhook][${requestId}] REFERENCIA EXTRAÍDA: ${reference}`);
      
      if (!reference) {
        console.error(`[Bold-Webhook][${requestId}] ERROR: No se encontró referencia en el payload`);
        return res.status(400).json({ error: 'Referencia ausente' });
      }

      const referenceParts = reference.split('_');
      const [userId, planKey] = referenceParts;
      console.log(`[Bold-Webhook][${requestId}] PARSEO REFERENCIA -> User: ${userId}, Plan: ${planKey}`);

      if (userId && planKey) {
        const credits = PLAN_CREDITS[planKey as Plan] || 0;
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        console.log(`[Bold-Webhook][${requestId}] Iniciando actualización de DB para ${userId}`);

        // 1. Actualizar créditos
        console.log(`[Bold-Webhook][${requestId}] [1/4] Actualizando user_credits...`);
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
          console.error(`[Bold-Webhook][${requestId}] ERROR DB user_credits:`, creditError);
          throw creditError;
        }
        console.log(`[Bold-Webhook][${requestId}] User credits OK`);

        // 2. Actualizar perfil
        console.log(`[Bold-Webhook][${requestId}] [2/4] Actualizando profile...`);
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            plan: planKey,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (profileError) {
          console.error(`[Bold-Webhook][${requestId}] ERROR DB profiles:`, profileError);
        } else {
          console.log(`[Bold-Webhook][${requestId}] Profile OK`);
        }

        // 3. Registrar Historial
        console.log(`[Bold-Webhook][${requestId}] [3/4] Registrando payment_history...`);
        const rawAmount = eventData.amount?.total_amount || eventData.amount || 0;
        const { error: historyError } = await supabaseAdmin
          .from('payment_history')
          .insert({
            user_id: userId,
            plan_key: planKey,
            amount: rawAmount,
            currency: eventData.amount?.currency || 'COP',
            external_reference: eventData.id || payload.id,
            payment_method: eventData.payment_method?.type || 'bold',
            status: 'success'
          });

        if (historyError) {
          console.error(`[Bold-Webhook][${requestId}] ERROR registrando historial:`, historyError);
        } else {
          console.log(`[Bold-Webhook][${requestId}] History OK`);
        }
        
        // 4. Referidos
        console.log(`[Bold-Webhook][${requestId}] [4/4] Procesando Referidos...`);
        try {
          const { data: referral } = await supabaseAdmin
            .from('referrals')
            .select('id')
            .eq('referred_id', userId)
            .single();

          if (referral) {
            console.log(`[Bold-Webhook][${requestId}] Referido encontrado (${referral.id}), registrando comisión.`);
            await supabaseAdmin.from('referral_commissions').insert({
              referral_id: referral.id,
              sale_amount: rawAmount,
              status: 'pending'
            });

            await supabaseAdmin
              .from('referrals')
              .update({ 
                status: 'active',
                updated_at: new Date().toISOString()
              })
              .eq('id', referral.id);
            console.log(`[Bold-Webhook][${requestId}] Proceso de referidos OK`);
          } else {
            console.log(`[Bold-Webhook][${requestId}] No es un usuario referido.`);
          }
        } catch (refErr) {
          console.warn(`[Bold-Webhook][${requestId}] Nota: No se pudo procesar referidos (puede que no tenga mentor).`);
        }

        // Notificación Final
        console.log(`[Bold-Webhook][${requestId}] Disparando notificación Discord...`);
        try {
          const amount = rawAmount ? `$${rawAmount.toLocaleString('es-CO')}` : undefined;
          await NotificationService.notifyNewSale(userId, planKey, amount);
          console.log(`[Bold-Webhook][${requestId}] Notificación enviada`);
        } catch (notifErr) {
          console.error(`[Bold-Webhook][${requestId}] Error en notificación:`, notifErr);
        }
        
        console.log(`[Bold-Webhook][${requestId}] ✅ PROCESO COMPLETADO EXITOSAMENTE`);
      } else {
        console.error(`[Bold-Webhook][${requestId}] ERROR: No se pudieron extraer userId o planKey de la referencia: ${reference}`);
      }
    } else {
      console.log(`[Bold-Webhook][${requestId}] Evento ignorado (no es venta aprobada): ${eventType}`);
    }

    return res.status(200).json({ success: true, received: true });
  } catch (error: any) {
    console.error(`[Bold-Webhook][${requestId}] ERROR FATAL:`, error.message);
    if (error.stack) console.error(error.stack);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
