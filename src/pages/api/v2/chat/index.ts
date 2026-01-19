import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatOrchestratorAgent } from '../../../../lib/agents/ChatOrchestratorAgent';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, productData, creativePaths, landingState } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages are required and must be an array.' });
    }

    const response = await ChatOrchestratorAgent.chat(messages, productData, creativePaths, landingState);

    return res.status(200).json({
      success: true,
      data: response
    });

  } catch (error: any) {
    console.error('[API/V2/Chat] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
