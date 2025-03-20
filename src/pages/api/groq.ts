import { Groq } from 'groq-sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { messages } = req.body;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{
        role: "user",
        content: messages[messages.length - 1].text
      }],
      model: process.env.NEXT_PUBLIC_GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 1024,
      stream: false
    });

    res.status(200).json({ 
      response: completion.choices[0].message.content 
    });
    
  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ error: 'Error procesando la solicitud' });
  }
}