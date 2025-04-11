import type { NextApiRequest, NextApiResponse } from 'next';
import { scriptLoaderService } from '../../../services/scripts/scriptLoaderService';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = req.headers['x-api-key'];
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(401).json({ error: 'API Key es requerida' });
  }

  const { scripts } = req.body;
  
  if (!Array.isArray(scripts) || scripts.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de scripts' });
  }

  try {
    const results = await scriptLoaderService.loadScripts(scripts);
    const successCount = results.filter(r => r.success).length;
    
    res.status(200).json({
      success: successCount,
      total: scripts.length,
      failed: scripts.length - successCount
    });
  } catch (error) {
    console.error('Error al cargar scripts:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};