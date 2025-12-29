import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoUrl = searchParams.get('url');

  if (!videoUrl) {
    return new Response('Missing URL', { status: 400 });
  }

  const apiKey = process.env.GOOGLE_AI_KEY;
  if (!apiKey) {
    return new Response('Server configuration error', { status: 500 });
  }

  // Asegurarnos de que el URL tiene la llave para la descarga
  const finalUrl = `${videoUrl}${videoUrl.includes('?') ? '&' : '?'}key=${apiKey}`;

  try {
    const response = await fetch(finalUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Proxy download error:', errorText);
      return new Response(`Error downloading video: ${response.statusText}`, { status: response.status });
    }

    // Stream the video back to the client
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') || 'video/mp4');
    headers.set('Cache-Control', 'public, max-age=3600');
    
    return new Response(response.body, {
      status: 200,
      headers
    });

  } catch (error: any) {
    console.error('Proxy internal error:', error);
    return new Response(error.message, { status: 500 });
  }
}
