import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    const { jobDescription, userProfile } = await req.json();

    if (!jobDescription) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    const prompt = `
      You are an expert hiring manager preparing a candidate for an interview.
      Based on the following job description and the candidate's profile, generate a list of the top 5 most likely interview questions they will face.
      For each question, provide a brief tip or strategy on how the candidate should answer it using their specific background.

      Return your response STRICTLY as a JSON object with this format (no markdown blocks):
      {
        "questions": [
          { "question": "...", "tip": "..." },
          { "question": "...", "tip": "..." }
        ]
      }

      Job Description:
      ${jobDescription}

      Candidate Profile:
      ${userProfile || 'No specific profile provided. Provide general best-practice tips.'}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    if (!response.text) throw new Error('No content received from Gemini');
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response.text.trim());
    } catch (e) {
      throw new Error('Failed to parse AI response');
    }

    return NextResponse.json(parsedResponse);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
