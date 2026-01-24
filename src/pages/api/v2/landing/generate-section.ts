import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CreditService } from '../../../../lib/creditService';
import { CopywriterAgent } from '../../../../lib/agents/CopywriterAgent';
import { LandingServiceV2 } from '../../../../services/image-pro/landingServiceV2';
import { BaseImageProService } from '../../../../services/image-pro/baseService';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest, event: any) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const googleKey = process.env.GOOGLE_AI_KEY || '';

  try {
    const body = await req.json();
    const { productData, creativePath, sectionId, sectionTitle, referenceUrl, previousImageUrl, continuityImage, extraInstructions, isCorrection, aspectRatio, launchId } = body;

    // 1. Get User ID from headers
    const userId = get_user_id_from_auth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Credit Check (Pre-check)
    console.log(`[API/V2/GenerateSection] Checking credits for user: ${userId}`);
    const { can, balance } = await CreditService.canPerformAction(userId, 'IMAGE_GEN', supabaseAdmin);
    
    if (!can) {
      console.warn(`[API/V2/GenerateSection] Insufficient credits for user: ${userId}`);
      return NextResponse.json({ error: 'Insufficient credits', balance }, { status: 402 });
    }

    // 3. Generate ID and Init Pending Record
    const generationId = crypto.randomUUID();
    await supabaseAdmin.from('image_generations').insert({
      id: generationId,
      user_id: userId,
      status: 'pending',
      prompt: sectionTitle.substring(0, 500),
      mode: 'landing',
      sub_mode: sectionId,
      launch_id: launchId || null
    });

    // 4. Background Process
    const backgroundProcess = (async () => {
      try {
        console.log(`[BG/LandingV2] Starting generation ${generationId}`);

        // A. Generate Copy (Fast)
        const copy = await CopywriterAgent.generateSectionCopy(productData, creativePath, sectionId, sectionTitle, extraInstructions);

        // B. Build Strategic Prompt
        const sectionPrompt = `SECTION: ${sectionTitle}. GOAL: ${copy.headline}. ${copy.body}`;
        const promptConfig = await LandingServiceV2.buildPrompt({
          mode: 'landing',
          isCorrection: isCorrection || false,
          productData,
          prompt: sectionPrompt,
          aspectRatio: aspectRatio || '9:16',
          referenceImage: referenceUrl,
          referenceType: 'layout',
          previousImageUrl: previousImageUrl,
          continuityImage: continuityImage,
          extraInstructions: extraInstructions
        });

        // C. Call Google AI
        const modelId = "gemini-3-pro-image-preview";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${googleKey}`;
        
        let geminiRes;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
          attempts++;
          geminiRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ role: 'user', parts: promptConfig.parts }] })
          });

          if (geminiRes.status === 200) break;
          const errorData = await geminiRes.json().catch(() => ({}));
          if (attempts < maxAttempts) await new Promise(r => setTimeout(r, 2000 * attempts));
          else throw new Error(errorData.error?.message || `AI failed with status ${geminiRes.status}`);
        }

        const result = await geminiRes!.json();
        
        // Log clean token consumption metadata
        const usage = result.usageMetadata || {};
        console.log(`[BG/LandingV2] Tokens for ${generationId}:`, 
          usage.candidatesTokensDetails?.map((d: any) => `Modality: ${d.modality}, Count: ${d.tokenCount}`).join(' | ') || 'No candidate details'
        );

        const imagePart = result.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        if (!imagePart) throw new Error('AI failed to generate image');

        // D. Upload to Storage (Edge compatible)
        const fileName = `v2_landing/${userId}/${generationId}.png`;
        const binaryData = await fetch(`data:image/png;base64,${imagePart.inlineData.data}`).then(r => r.arrayBuffer());

        const { error: uploadError } = await supabaseAdmin.storage
          .from('temp-generations')
          .upload(fileName, binaryData, { contentType: 'image/png', upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('temp-generations')
          .getPublicUrl(fileName);

        // E. Consume Credits
        await CreditService.consumeCredits(userId, 'IMAGE_GEN', { 
          prompt: sectionPrompt.substring(0, 200), 
          generation_id: generationId, 
          image_url: publicUrl,
          is_correction: isCorrection || false
        }, supabaseAdmin);
        
        // F. Update Success (Using only existing columns)
        // We'll store the copy in the prompt column as JSON so it can be recovered by the status endpoint
        const finalData = {
          status: 'completed',
          image_url: publicUrl,
          prompt: JSON.stringify({ strategicPrompt: promptConfig.strategicPrompt, copy })
        };

        const { error: updateError } = await supabaseAdmin
          .from('image_generations')
          .update(finalData)
          .eq('id', generationId);

        if (updateError) throw updateError;

        console.log(`[BG/LandingV2] Generation ${generationId} completed successfully`);

      } catch (err: any) {
        console.error(`[BG/LandingV2] Error in generation ${generationId}:`, err.message);
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
    console.error('[API/V2/GenerateSection] Immediate Error:', error.message);
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
