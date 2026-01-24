import { NextRequest, NextResponse } from 'next/server';
import { LaunchService } from '../../../../services/launches/launchService';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing launch ID' }, { status: 400 });
  }

  const userId = get_user_id_from_auth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const launchService = LaunchService.createWithAdmin();

  try {
    // 1. Verificar propiedad
    const existing = await launchService.getById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Launch not found' }, { status: 404 });
    }
    if (existing.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (req.method === 'GET') {
      return NextResponse.json({ success: true, data: existing });
    }

    if (req.method === 'PATCH') {
      const body = await req.json();
      const updated = await launchService.update(id, body);
      return NextResponse.json({ success: true, data: updated });
    }

    if (req.method === 'DELETE') {
      await launchService.delete(id);
      return NextResponse.json({ success: true, message: 'Launch deleted' });
    }

    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error: any) {
    console.error(`[API/V2/Launches/${id}] Error:`, error.message);
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
