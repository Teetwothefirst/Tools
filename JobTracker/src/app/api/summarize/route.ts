import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured' },
        { status: 500 }
      );
    }

    const { description } = await req.json();

    if (!description || description.trim() === '') {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    const prompt = `
      You are an expert technical recruiter and career coach.
      Analyze the following job description and provide:
      1. Convert the key responsibilities of this role into 3-4 professional, ATS-friendly resume bullet points written in the past-tense, starting with strong action verbs (e.g. "Spearheaded", "Developed", "Led", "Managed"), describing what a person successfully accomplished in this role.
      2. A list of the top 5 technical skills requested.
      
      Return your response STRICTLY as a JSON object with this format (do not include markdown codeblocks or any other text):
      {
        "summary": ["bullet 1", "bullet 2", "bullet 3"],
        "skills": ["skill 1", "skill 2", "skill 3", "skill 4", "skill 5"]
      }

      Job Description:
      ${description}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    if (!response.text) {
      throw new Error('No content received from Gemini');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response.text.trim());
    } catch (e) {
      console.error("Failed to parse Gemini JSON output", response.text);
      throw new Error('Failed to parse AI response');
    }

    return NextResponse.json(parsedResponse);
  } catch (error: any) {
    console.error('Summarize API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
