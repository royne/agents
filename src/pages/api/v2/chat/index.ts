import { NextRequest, NextResponse } from 'next/server';
import { ChatOrchestratorAgent } from '../../../../lib/agents/ChatOrchestratorAgent';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { messages, productData, creativePaths, landingState } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required and must be an array.' }, { status: 400 });
    }

    const response = await ChatOrchestratorAgent.chat(messages, productData, creativePaths, landingState);

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error: any) {
    console.error('[API/V2/Chat] Error:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
