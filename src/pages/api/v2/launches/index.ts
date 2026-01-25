import { NextRequest, NextResponse } from 'next/server';
import { LaunchService } from '../../../../services/launches/launchService';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const userId = get_user_id_from_auth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const launchService = LaunchService.createWithAdmin();

  try {
    if (req.method === 'GET') {
      const launches = await launchService.getByUser(userId);
      
      // Detección de activos huérfanos (Legacy V1 / Sueltos)
      const orphanCount = await launchService.getOrphanGenerationsCount(userId);
      
      if (orphanCount > 0) {
        const lastOrphans = await launchService.getOrphanGenerations(userId, 1);
        const virtualLaunch = {
          id: 'unclassified-vault',
          name: 'Sin Clasificar (V1 / Sueltos)',
          status: 'archived',
          thumbnail_url: lastOrphans[0]?.image_url || null,
          created_at: lastOrphans[0]?.created_at || new Date().toISOString(),
          updated_at: lastOrphans[0]?.created_at || new Date().toISOString(),
          is_virtual: true,
          orphan_count: orphanCount
        };
        
        // Lo añadimos al final de la lista
        launches.push(virtualLaunch as any);
      }

      return NextResponse.json({ success: true, data: launches });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const launch = await launchService.create(userId, body);
      return NextResponse.json({ success: true, data: launch });
    }

    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error: any) {
    console.error('[API/V2/Launches] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function get_user_id_from_auth(req: NextRequest): string | null {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson);
      return payload.sub;
    }
    return null;
  } catch (err) {
    return null;
  }
}
