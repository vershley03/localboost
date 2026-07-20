import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { prompt, platforms, brand, customTone, customAudience } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OpenAI API Key" }, { status: 500 });
    }

    const openai = new OpenAI();
    const finalTone = customTone || brand.tone;
    const finalAudience = customAudience || brand.audience;

    const charLimits: Record<string, number> = {
      x: 280,
      instagram: 2200,
      facebook: 63206,
      google: 1500,
    };

    const limitsNote = platforms
      .map((p: string) => `${p}: max ${charLimits[p] || 2200} characters`)
      .join(", ");

    const systemPrompt = `You are an expert social media manager for a local business.
Business: ${brand.businessName}
Category: ${brand.category}
Tone: ${finalTone}
Target Audience: ${finalAudience}
Keywords: ${brand.keywords.join(", ")}

Your task is to write high-converting, engaging social media posts based on the user's prompt. 
You must generate one specific, tailored caption for each requested platform.
IMPORTANT: Each platform has strict character limits. You MUST keep each caption under its limit: ${limitsNote}.
Format the output as a JSON object with a 'posts' array. Each item in the array must have 'platform' and 'caption'.`;

    const userMessage = `Write posts for the following platforms: ${platforms.join(", ")}\nTopic: ${prompt}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{"posts":[]}');
    return NextResponse.json(result);
  } catch (error) {
    console.error("OpenAI Error:", error);
    return NextResponse.json({ error: "Failed to generate posts" }, { status: 500 });
  }
}
