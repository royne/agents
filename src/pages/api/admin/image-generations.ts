import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../../../types/database';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createPagesServerClient<Database>({ req, res });

  // 1. Check authentication and roles
  let userId: string | undefined;
  
  // Try session first (cookie-based)
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    userId = session.user.id;
  } else {
    // Fallback to Bearer token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (!authError && user) {
        userId = user.id;
      }
    }
  }

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin' || profile?.role === 'owner';
  
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // 2. Pagination parameters
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 30;
  const offset = (page - 1) * limit;

  try {
    // 3. Fetch data with join using ADMIN client to bypass RLS
    // We already verified the user is an admin manually above
    const { data: generations, error, count } = await supabaseAdmin
      .from('image_generations')
      .select(`
        *,
        profiles (
          name,
          email
        )
      `, { count: 'exact' })
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: generations,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (err: any) {
    console.error('[API/Admin/ImageGenerations] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
