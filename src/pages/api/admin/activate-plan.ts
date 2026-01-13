import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { Plan, PLAN_CREDITS } from '../../../constants/plans';
import { NotificationService } from '../../../lib/notificationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { userId, planKey, amount, skipCommission = false } = req.body;

  if (!userId || !planKey) {
    return res.status(400).json({ error: 'Faltan parámetros: userId y planKey son requeridos' });
  }

  // Verificar que el solicitante sea admin
  const { data: { user: requester }, error: authError } = await supabaseAdmin.auth.getUser(
    req.headers.authorization?.replace('Bearer ', '') || ''
  );

  if (authError || !requester) {
    // Si no hay cabecera auth, intentamos verificar via cookie/session por si acaso
    // Pero para APIs de admin usualmente pedimos el token
  }

  // Doble check de rol en profiles
  const { data: requesterProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('user_id', requester?.id)
    .single();

  if (requesterProfile?.role !== 'admin' && requesterProfile?.role !== 'superadmin') {
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
  }

  try {
    console.log(`[Admin] Activación Manual solicitada por ${requester?.email}: User=${userId}, Plan=${planKey}`);
    
    const credits = PLAN_CREDITS[planKey as Plan] || 0;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    // 1. Upsert créditos (asegura creación si no existe)
    const { error: creditError } = await supabaseAdmin
      .from('user_credits')
      .upsert({
        user_id: userId,
        plan_key: planKey,
        balance: credits,
        unlimited_credits: planKey === 'tester',
        expires_at: expiresAt.toISOString(),
        is_active: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (creditError) throw creditError;

    // 2. Actualizar perfil
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        plan: planKey,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (profileError) throw profileError;

    // 3. Registrar en Historial de Pagos (Para Dashboards futuros)
    const { error: historyError } = await supabaseAdmin
      .from('payment_history')
      .insert({
        user_id: userId,
        plan_key: planKey,
        amount: amount || 0,
        currency: 'COP',
        external_reference: `MANUAL_BY_${requester?.email}`,
        payment_method: 'admin_manual',
        status: 'success'
      });

    if (historyError) {
      console.error('[Admin] Error registrando historial:', historyError);
    }
    
    // 4. Sistema de Referidos: Registrar Venta (Opcional)
    let referralStatus = 'No es referido / Omitido';
    if (!skipCommission) {
      try {
        const { data: referral } = await supabaseAdmin
          .from('referrals')
          .select('id')
          .eq('referred_id', userId)
          .single();

        if (referral) {
          const saleAmount = amount || (planKey === 'pro' ? 49000 : planKey === 'starter' ? 29000 : 99000);

          await supabaseAdmin.from('referral_commissions').insert({
            referral_id: referral.id,
            sale_amount: saleAmount,
            status: 'pending'
          });

          await supabaseAdmin
            .from('referrals')
            .update({ 
              status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('id', referral.id);
          
          referralStatus = 'Venta y comisión registradas';
        }
      } catch (refErr) {
        console.warn('[Admin] Nota: El usuario no parece ser un referido o hubo un error menor:', refErr);
      }
    }

    // 4. Notificar (Marcado como manual para evitar Discord)
    try {
      await NotificationService.notifyNewSale(userId, planKey, amount ? `$${amount} (Manual)` : 'GIFT', true);
    } catch (notifErr) {
      console.warn('[Admin] Error en notificación:', notifErr);
    }
    
    return res.status(200).json({ 
      success: true, 
      message: `Plan ${planKey} activado manualmente`,
      details: {
        userId,
        planKey,
        creditsGranted: credits,
        referralStatus
      }
    });

  } catch (error: any) {
    console.error('[Admin] Error en activación manual:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
