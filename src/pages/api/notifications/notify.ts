import { NextApiRequest, NextApiResponse } from 'next';
import { NotificationService } from '../../../lib/notificationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { type, email, name, userId, plan } = req.body;

    if (type === 'new_user') {
      await NotificationService.notifyNewUser(email, name);
    } else if (type === 'new_sale') {
      await NotificationService.notifyNewSale(userId, plan);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in notify API:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
}
