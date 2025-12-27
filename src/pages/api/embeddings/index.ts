import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from '@langchain/openai';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Ensure user is authenticated
  const supabaseServer = createPagesServerClient({ req, res });
  const { data: { session } } = await supabaseServer.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { action, text, query, limit = 5 } = req.body;

  try {
    const openAIApiKey = process.env.OPENAI_API_KEY;
    if (!openAIApiKey) {
      return res.status(500).json({ error: 'Server configuration error: Missing OpenAI API Key' });
    }

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: openAIApiKey,
      modelName: 'text-embedding-3-small'
    });

    if (action === 'embed') {
      if (!text) return res.status(400).json({ error: 'Missing text to embed' });
      const vector = await embeddings.embedQuery(text);
      return res.status(200).json({ vector });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error: any) {
    console.error('[api/embeddings] Error:', error);
    return res.status(500).json({ error: 'Error processing embedding request', detail: error.message });
  }
};
