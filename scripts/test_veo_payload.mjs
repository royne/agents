import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testVeoPayload() {
  const apiKey = process.env.GOOGLE_AI_KEY;
  const modelId = "veo-3.1-fast-generate-preview";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predictLongRunning?key=${apiKey}`;

  const payload = {
    instances: [
      {
        prompt: "A futuristic city with flying cars, cinematic lighting"
      }
    ],
    parameters: {
      aspectRatio: "9:16"
    }
  };

  console.log('Testing minimal payload...');
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testVeoPayload();
