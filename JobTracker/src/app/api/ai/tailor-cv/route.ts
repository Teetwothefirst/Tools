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
      You are an expert ATS optimizer and career coach.
      Below is a job description and the candidate's current profile/CV details.
      
      Compare the candidate's profile against the job description and generate:
      1. A customized, ATS-friendly professional summary (3-4 sentences) tailored for this specific role.
      2. 5-7 ATS-friendly bullet points (past-tense action verbs) combining the candidate's skills with the job's requirements to prove they are the perfect fit.
      
      Return your response STRICTLY as a JSON object with this format (no markdown blocks):
      {
        "tailoredSummary": "Your customized summary paragraph...",
        "tailoredBullets": ["bullet 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5"]
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
