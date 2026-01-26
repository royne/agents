import { NextApiRequest, NextApiResponse } from 'next';
import { NotificationService } from '../../../lib/notificationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // LOG QUE SÍ O SÍ APARECE EN VERCEL
  console.log('--- NOTIFICATION API START ---');
  console.log('Method:', req.method);
  console.log('Body:', JSON.stringify(req.body));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { type, email, name, userId, plan } = req.body;

    if (type === 'new_user') {
      console.log(`[API] Notificando nuevo usuario: ${email}`);
      const success = await NotificationService.notifyNewUser(email, name);
      console.log(`[API] Resultado Discord: ${success}`);
      return res.status(200).json({ success, step: 'new_user' });
    } 
    
    if (type === 'new_sale') {
      console.log(`[API] Notificando nueva venta: ${userId}`);
      const success = await NotificationService.notifyNewSale(userId, plan);
      return res.status(200).json({ success, step: 'new_sale' });
    }

    console.log('[API] Tipo de notificación no reconocido');
    return res.status(400).json({ error: 'Tipo no válido' });
  } catch (error) {
    console.error('[API] ERROR CRÍTICO:', error);
    return res.status(500).json({ 
      error: 'Error interno', 
      msg: error instanceof Error ? error.message : 'Error desconocido' 
    });
  } finally {
    console.log('--- NOTIFICATION API END ---');
  }
}
