import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/route-handler';
import { callAICascade } from '@/lib/ai/cascade';
// pdf-parse doesn't have official types that always work nicely, so we require it
const pdfParse = require('pdf-parse');

export async function POST(request: Request) {
  try {
    const supabase = await supabaseRoute();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    // Convert the uploaded file to a Buffer for pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from the PDF
    let pdfData;
    try {
      pdfData = await pdfParse(buffer);
    } catch (parseError: any) {
      console.error('PDF parsing error:', parseError);
      return NextResponse.json({ error: 'Failed to read text from the PDF file.' }, { status: 400 });
    }

    const rawText = pdfData.text;

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json({ error: 'The PDF appears to be empty or contains no extractable text (it might be an image-based PDF).' }, { status: 400 });
    }

    // Prepare prompt for AI Cascade to extract structured data
    const systemPrompt = `You are a highly accurate Resume Parsing API. Your job is to extract specific profile details from the provided unstructured resume text.
Extract the data and respond ONLY with a valid JSON object in the exact format shown below. Do not include markdown formatting or extra text.
If a field cannot be found, use an empty string or empty array.

{
  "skills": ["<skill1>", "<skill2>"],
  "courses": ["<course1>", "<course2>"],
  "honors_awards": ["<honor1>", "<honor2>"],
  "publications": ["<publication1>", "<publication2>"],
  "degree": "<latest degree, e.g. B.Tech>",
  "branch": "<major/branch, e.g. Computer Science>",
  "college": "<college or university name>",
  "graduation_year": <number or null>,
  "cgpa": <number or null>
}`;

    const prompt = `Please extract the profile details from the following resume text:\n\n${rawText}`;

    // Call the AI
    const res = await callAICascade({
      prompt,
      systemPrompt,
      jsonMode: true,
      feature: 'resume_parsing_extraction'
    });

    let parsedData;
    try {
      parsedData = JSON.parse(res.text);
    } catch (e) {
      console.error("Failed to parse AI output as JSON:", res.text);
      return NextResponse.json({ error: 'AI returned invalid JSON format' }, { status: 500 });
    }

    // Optional: Return raw text alongside parsed data in case the frontend wants to save it
    return NextResponse.json({
      success: true,
      data: parsedData,
      rawText: rawText
    });

  } catch (error: any) {
    console.error("Resume parse endpoint error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
