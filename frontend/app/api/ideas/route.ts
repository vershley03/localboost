import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI();

export async function POST(request: Request) {
  try {
    const { brand } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OpenAI API Key" }, { status: 500 });
    }

    const systemPrompt = `You are a creative social media strategist for a ${brand.category} named ${brand.businessName}.
Tone: ${brand.tone}
Audience: ${brand.audience}
Keywords: ${brand.keywords.join(", ")}

Generate 4 highly engaging, high-converting social media post ideas for the upcoming week.
These should be short, actionable concepts that the business owner can just click and generate.
Output JSON with an array called 'ideas' containing strings.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Give me 4 post ideas for this week." }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{"ideas":[]}');
    return NextResponse.json(result);
  } catch (error) {
    console.error("OpenAI Ideas Error:", error);
    return NextResponse.json({ error: "Failed to generate ideas" }, { status: 500 });
  }
}
