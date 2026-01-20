import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CreditService } from '../../../../lib/creditService';
import { AdsServiceV2 } from '../../../../services/image-pro/adsServiceV2';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest, event: any) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const googleKey = process.env.GOOGLE_AI_KEY || '';

  const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    const { productData, conceptId, visualPrompt, adHook, adBody, adCta, referenceUrl, previousImageUrl, isCorrection, aspectRatio } = body;

    // 1. Get User ID from headers
    const userId = get_user_id_from_auth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Credit Check (Pre-check)
    const { can, balance } = await CreditService.canPerformAction(userId, 'IMAGE_GEN', supabaseAdmin);
    if (!can) {
      return NextResponse.json({ error: 'Insufficient credits', balance }, { status: 402 });
    }

    // 3. Generate ID and Init Pending Record
    const generationId = crypto.randomUUID();
    await supabaseAdmin.from('image_generations').insert({
      id: generationId,
      user_id: userId,
      status: 'pending',
      prompt: visualPrompt.substring(0, 500),
      mode: 'ads',
      sub_mode: conceptId
    });

    // 4. Background Process
    const backgroundProcess = (async () => {
      try {
        console.log(`[BG/AdsV2] Starting generation ${generationId}`);

        // A. Build Strategic Prompt
        const promptConfig = await AdsServiceV2.buildPrompt({
          mode: 'ads',
          productData,
          prompt: visualPrompt,
          adHook,
          adBody,
          adCta,
          aspectRatio: aspectRatio || '1:1',
          referenceImage: referenceUrl,
          referenceType: referenceUrl ? 'layout' : undefined,
          previousImageUrl: previousImageUrl || productData.imageBase64 || productData.url,
          isCorrection: isCorrection || false
        });

        // B. Call Google AI
        const modelId = "gemini-3-pro-image-preview";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${googleKey}`;
        
        let aiRes;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
          attempts++;
          aiRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ role: 'user', parts: promptConfig.parts }] })
          });

          if (aiRes.status === 200) break;
          const errorData = await aiRes.json().catch(() => ({}));
          if (attempts < maxAttempts) await new Promise(r => setTimeout(r, 2000 * attempts));
          else throw new Error(errorData.error?.message || `AI failed with status ${aiRes.status}`);
        }

        const aiData = await aiRes!.json();
        const imagePart = aiData.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        if (!imagePart) throw new Error('AI failed to generate image');

        // C. Upload to Storage
        const fileName = `v2_ads/${userId}/${generationId}.png`;
        const binaryData = await fetch(`data:image/png;base64,${imagePart.inlineData.data}`).then(r => r.arrayBuffer());

        const { error: uploadError } = await supabaseAdmin.storage
          .from('temp-generations')
          .upload(fileName, binaryData, { contentType: 'image/png', upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('temp-generations')
          .getPublicUrl(fileName);

        // D. Consume Credits
        await CreditService.consumeCredits(userId, 'IMAGE_GEN', { 
          prompt: visualPrompt.substring(0, 200), 
          generation_id: generationId, 
          image_url: publicUrl,
          is_ad: true
        }, supabaseAdmin);

        // E. Update Success
        const { error: updateError } = await supabaseAdmin.from('image_generations').update({
          status: 'completed',
          image_url: publicUrl,
          prompt: promptConfig.strategicPrompt
        }).eq('id', generationId);

        if (updateError) throw updateError;

        console.log(`[BG/AdsV2] Generation ${generationId} completed successfully`);

      } catch (err: any) {
        console.error(`[BG/AdsV2] Error in generation ${generationId}:`, err.message);
        await supabaseAdmin.from('image_generations').update({
          status: 'failed',
          error_message: err.message
        }).eq('id', generationId);
      }
    })();

    if (event && event.waitUntil) {
      event.waitUntil(backgroundProcess);
    }

    return NextResponse.json({
      success: true,
      data: { generationId }
    });

  } catch (error: any) {
    console.error('[API/V2/Ads/GenerateImage] Immediate Error:', error.message);
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
