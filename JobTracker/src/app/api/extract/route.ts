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
        { error: 'Job prompt or description is required' },
        { status: 400 }
      );
    }

    const prompt = `
      You are an expert recruitment assistant and AI data parser. Analyze the following prompt or job posting text (which may be freeform text, structured key-value pairs like "Company: ...", "Job Title: ...", "Job link: ...", or a raw email/job ad) and extract all relevant details:

      1. Company Name (e.g. "Stripe", "INEC", "Google")
      2. Job Title (e.g. "Professional Cadre / Administrative Officer II", "Senior Frontend Engineer")
      3. Status: Must be one of: "Saved", "Applied", "Interviewing", "Offer", "Rejected". (Default to "Saved" if not specified).
      4. Priority: Must be one of: "Low", "Medium", "High". (Default to "Medium" if not specified).
      5. Category: Classify into one of:
         - "Engineering" (software, QA, DevOps, IT, data)
         - "Design" (UX, UI, graphic)
         - "Product" (PM, product owner)
         - "Marketing" (content, SEO, growth)
         - "Sales" (BD, account exec)
         - "HR" (recruiter, talent)
         - "Government / Public Sector"
         - "Other"
      6. Salary / Compensation (e.g. "$140,000/yr", "Grade Level 08", or empty string if not found)
      7. Contacts / Recruiter Info (address, contact name, office details)
      8. Mail used to apply (email address used or mentioned)
      9. Job link (exact URL if mentioned, e.g. "https://recruitment.inecnigeria.org")
      10. Offer letter received (date or string if mentioned)
      11. Employment end date (or string if mentioned)
      12. Additional Notes (any extra context, deadlines, application rules)
      13. Job description / summary

      Return your response STRICTLY as a JSON object with this exact schema:
      {
        "company": "Company Name",
        "title": "Job Title",
        "status": "Saved" | "Applied" | "Interviewing" | "Offer" | "Rejected",
        "priority": "Low" | "Medium" | "High",
        "category": "Engineering" | "Design" | "Product" | "Marketing" | "Sales" | "HR" | "Government / Public Sector" | "Other",
        "payAmount": "Salary detail",
        "contacts": "Contact detail",
        "mailUsed": "Email detail",
        "jobLink": "https://...",
        "offerReceivedDate": "",
        "employmentEndDate": "",
        "notes": "Extra notes",
        "description": "Full job description summary",
        "summary": ["bullet 1", "bullet 2"],
        "skills": ["skill 1", "skill 2"]
      }

      Input Text / Prompt:
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
