import { NextRequest, NextResponse } from 'next/server';
import { LaunchService } from '../../../../services/launches/launchService';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const launchId = searchParams.get('launchId');

  if (!launchId) {
    return NextResponse.json({ error: 'Missing launchId' }, { status: 400 });
  }

  const userId = get_user_id_from_auth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const launchService = LaunchService.createWithAdmin();

  try {
    let generations;
    
    // CASO ESPECIAL: Bóveda de archivos sin clasificar (Legacy V1 / Sueltos)
    if (launchId === 'unclassified-vault') {
      generations = await launchService.getOrphanGenerations(userId);
      return NextResponse.json({
        success: true,
        data: generations,
        is_virtual: true
      });
    }

    // 1. Verificar propiedad del lanzamiento antes de devolver las generaciones
    const launch = await launchService.getById(launchId);
    if (!launch) {
      return NextResponse.json({ error: 'Launch not found' }, { status: 404 });
    }
    if (launch.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Obtener las generaciones
    generations = await launchService.getGenerationsByLaunchId(launchId);

    return NextResponse.json({
      success: true,
      data: generations
    });
  } catch (error: any) {
    console.error(`[API/V2/Launches/Generations] Error:`, error.message);
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
