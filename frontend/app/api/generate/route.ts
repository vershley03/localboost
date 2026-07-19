import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI();

export async function POST(request: Request) {
  try {
    const { prompt, platforms, brand } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OpenAI API Key" }, { status: 500 });
    }

    const systemPrompt = `You are an expert social media manager for a local business.
Business: ${brand.businessName}
Category: ${brand.category}
Tone: ${brand.tone}
Target Audience: ${brand.audience}
Keywords: ${brand.keywords.join(", ")}

Your task is to write high-converting, engaging social media posts based on the user's prompt. 
You must generate one specific, tailored caption for each requested platform.
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
