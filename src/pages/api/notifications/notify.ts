import { NextApiRequest, NextApiResponse } from 'next';
import { NotificationService } from '../../../lib/notificationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { type, email, name, userId, plan } = req.body;
    console.log(`[NotifyAPI] Recibida petición: type=${type}, email=${email}, name=${name}`);

    if (type === 'new_user') {
      const success = await NotificationService.notifyNewUser(email, name);
      console.log(`[NotifyAPI] Resultado notifyNewUser: ${success}`);
    } else if (type === 'new_sale') {
      const success = await NotificationService.notifyNewSale(userId, plan);
      console.log(`[NotifyAPI] Resultado notifyNewSale: ${success}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in notify API:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
}
