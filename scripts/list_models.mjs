import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function listModels() {
  const apiKey = process.env.GOOGLE_AI_KEY;
  if (!apiKey) {
    console.error('GOOGLE_AI_KEY not found');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const models = await genAI.getGenerativeModel({ model: 'gemini-pro' }); // Placeholder to access the API
    // The SDK might not have a direct listModels, but we can try to fetch from the API directly if needed
    // Actually, let's try a direct fetch to the REST API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log('Available Models:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();
