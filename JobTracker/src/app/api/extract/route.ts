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
      You are an expert technical recruiter. Analyze the following job description and extract key details:
      1. Company Name (extract the name of the hiring company)
      2. Job Title (extract the exact job title)
      3. Priority: Determine if the role level/urgency suggests priority 'High', 'Medium', or 'Low' (default to 'Medium' if unclear)
      4. Salary/Compensation (e.g. "$120,000/yr", "£80k - £100k", or empty string if not found)
      5. Contacts/Recruiter info (name, email, or details if mentioned, otherwise empty string)
      6. Category: Classify the job into one of these standard categories:
         - "Engineering" (for software engineers, QA, architects, developers, etc.)
         - "Design" (for UX, UI, product designers, etc.)
         - "Product" (for product managers, program managers, etc.)
         - "Marketing" (for content creators, SEO, growth, etc.)
         - "Sales" (for sales, BD, accounts, etc.)
         - "HR" (for recruiter, people ops, talent, etc.)
         - "Other" (for roles not fitting the above)
      7. Convert the key responsibilities of this role into 3-4 professional, ATS-friendly resume bullet points written in the past-tense, starting with strong action verbs (e.g. "Spearheaded", "Developed", "Led", "Managed"), describing what a person successfully accomplished in this role.
      8. Top 5 technical/soft skills required.

      Return your response STRICTLY as a JSON object with this format:
      {
        "company": "Company Name",
        "title": "Job Title",
        "priority": "Low" | "Medium" | "High",
        "payAmount": "Salary detail",
        "contacts": "Contact detail",
        "category": "Engineering" | "Design" | "Product" | "Marketing" | "Sales" | "HR" | "Other",
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
    console.error('Extract API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
