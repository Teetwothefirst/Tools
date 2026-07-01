import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    const { jobDescription, userProfile } = await req.json();

    if (!jobDescription || !userProfile) {
      return NextResponse.json({ error: 'Both Job description and User Profile are required' }, { status: 400 });
    }

    const prompt = `
      You are an expert executive recruiter and copywriter.
      Draft a professional, compelling cover letter for the candidate applying to the job described below.
      Use the candidate's profile to inform the experience mentioned in the letter.
      Keep it to 3-4 concise paragraphs. Focus on business value, enthusiasm, and direct alignment with the job requirements.
      Do not include placeholder brackets like [Company Name] if the company name is present in the job description. Infer it if possible.

      Return your response STRICTLY as a JSON object with this format (no markdown blocks):
      {
        "coverLetter": "The full text of the cover letter with proper line breaks..."
      }

      Job Description:
      ${jobDescription}

      Candidate Profile:
      ${userProfile}
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
