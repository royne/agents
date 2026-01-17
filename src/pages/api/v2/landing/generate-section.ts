import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { CreditService } from '../../../../lib/creditService';
import { CopywriterAgent } from '../../../../lib/agents/CopywriterAgent';
import { LandingService } from '../../../../services/image-pro/landingService';
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
    const { productData, creativePath, sectionId, sectionTitle, referenceUrl, previousImageUrl, continuityImage } = req.body;

    // 1. Get User ID from headers (simpler version for now, ideally use supabase.auth.getUser)
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    
    // Extract userId from JWT if possible or use a safer method
    // For now, let's assume we can get it or at least validate credits
    // In a real scenario, we'd use supabase.auth.getUser(token)
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) return res.status(401).json({ error: 'Invalid token' });
    
    const userId = user.id;

    // 2. Credit Check
    const { can, balance } = await CreditService.canPerformAction(userId, 'IMAGE_GEN', supabaseAdmin);
    if (!can) {
      return res.status(402).json({ error: 'Insufficient credits', balance });
    }

    // 3. Generate Copy (Fast)
    console.log('[API/V2/GenerateSection] Generating copy...');
    const copy = await CopywriterAgent.generateSectionCopy(productData, creativePath, sectionId, sectionTitle);

    // 4. Generate Image (Artist)
    console.log('[API/V2/GenerateSection] Building image prompt...');
    const sectionPrompt = `SECTION: ${sectionTitle}. GOAL: ${copy.headline}. ${copy.body}`;
    
    const promptConfig = await LandingService.buildPrompt({
      mode: 'landing',
      isCorrection: false,
      productData,
      prompt: sectionPrompt,
      aspectRatio: '9:16',
      referenceImage: referenceUrl,
      referenceType: 'layout',
      previousImageUrl: previousImageUrl,
      continuityImage: continuityImage
    });

    console.log('[API/V2/GenerateSection] Calling Google AI...');
    const modelId = "gemini-3-pro-image-preview";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${googleKey}`;
    
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: promptConfig.parts }] })
    });

    const result = await geminiRes.json();
    const imagePart = result.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

    if (!imagePart) {
      throw new Error(result.error?.message || 'Google AI failed to generate image');
    }

    // 5. Upload to Storage
    const generationId = crypto.randomUUID();
    const fileName = `${generationId}.png`;
    const buffer = Buffer.from(imagePart.inlineData.data, 'base64');

    const { error: uploadError } = await supabaseAdmin.storage
      .from('temp-generations')
      .upload(fileName, buffer, { contentType: 'image/png' });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('temp-generations')
      .getPublicUrl(fileName);

    // 6. Consume Credits
    await CreditService.consumeCredits(userId, 'IMAGE_GEN', { 
      prompt: sectionPrompt.substring(0, 200), 
      generation_id: generationId, 
      image_url: publicUrl 
    }, supabaseAdmin);

    // 7. Save generation record
    await supabaseAdmin.from('image_generations').insert({
      id: generationId,
      user_id: userId,
      status: 'completed',
      image_url: publicUrl,
      prompt: sectionPrompt,
      mode: 'landing',
      sub_mode: sectionId
    });

    return res.status(200).json({
      success: true,
      data: {
        copy,
        imageUrl: publicUrl
      }
    });

  } catch (error: any) {
    console.error('[API/V2/GenerateSection] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
