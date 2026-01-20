import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { CreditService } from '../../../../lib/creditService';
import { AdsServiceV2 } from '../../../../services/image-pro/adsServiceV2';
import { BaseImageProService } from '../../../../services/image-pro/baseService';

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const googleKey = process.env.GOOGLE_AI_KEY || '';

  const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

  try {
    const { productData, conceptId, visualPrompt, adHook, adBody, adCta, referenceUrl, previousImageUrl, isCorrection, aspectRatio } = req.body;

    // 1. Auth check
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) return res.status(401).json({ error: 'Invalid token' });
    
    const userId = user.id;

    // 2. Credit Check
    const { can, balance } = await CreditService.canPerformAction(userId, 'IMAGE_GEN', supabaseAdmin);
    if (!can) {
      return res.status(402).json({ error: 'Insufficient credits', balance });
    }

    // 3. Build Strategic Prompt
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

    // 4. Call Google AI (with retries)
    console.log('[API/V2/Ads/GenerateImage] Calling Google AI...');
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
      const isOverloaded = aiRes.status === 503 || errorData.error?.message?.includes('overloaded');
      
      if (isOverloaded && attempts < maxAttempts) {
        console.warn(`[API/V2/Ads/GenerateImage] Google AI overloaded (Attempt ${attempts}/${maxAttempts}). Retrying in 2s...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
        continue;
      }
      
      throw new Error(errorData.error?.message || `Google AI failed with status ${aiRes.status}`);
    }

    const aiData = await aiRes!.json();
    const imagePart = aiData.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    
    if (!imagePart || !imagePart.inlineData?.data) {
      throw new Error('AI Response did not contain an image');
    }

    const b64Image = imagePart.inlineData.data;

    // 5. Upload to Storage
    const fileName = `v2_ads/${userId}/${Date.now()}.png`;
    const binaryData = await fetch(`data:image/png;base64,${b64Image}`).then(r => r.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from('temp-generations')
      .upload(fileName, binaryData, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('temp-generations')
      .getPublicUrl(fileName);

    // 6. Consume Credits
    await CreditService.consumeCredits(userId, 'IMAGE_GEN', { 
      prompt: visualPrompt.substring(0, 200), 
      generation_id: conceptId, 
      image_url: publicUrl,
      is_ad: true
    }, supabaseAdmin);

    // 7. Save generation record
    await supabaseAdmin.from('image_generations').insert({
      user_id: userId,
      prompt: promptConfig.strategicPrompt,
      image_url: publicUrl,
      model: modelId,
      metadata: { conceptId, type: 'facebook_ad', aspectRatio }
    });

    return res.status(200).json({
      success: true,
      data: { imageUrl: publicUrl, balance: balance - 10 }
    });

  } catch (error: any) {
    console.error('[API/V2/Ads/GenerateImage] Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
