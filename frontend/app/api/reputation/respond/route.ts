import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { reviewText, rating, reviewerName, brand, toneModifier } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OpenAI API Key" }, { status: 500 });
    }

    const openai = new OpenAI();
    
    // Add the specific tone modifier if provided
    const toneString = toneModifier ? `${brand.tone} (Apply extra focus on: ${toneModifier})` : brand.tone;

    const reputationSystemPrompt = `
You are an expert Public Relations and Customer Success Manager for local businesses.
Your goal is to write perfectly crafted responses to customer reviews.

Business Details:
- Name: ${brand.businessName}
- Category: ${brand.category}
- Core Audience: ${brand.audience}
- Brand Voice/Tone Guidelines: ${toneString}

Instructions:
1. CUSTOMIZATION: Use the reviewer's name ("${reviewerName}") to personalize the message, but do not use placeholders or brackets in the output.
2. HANDLING POSITIVE REVIEWS (4-5 Stars): Be warm, appreciative, validate the specific highlights they mentioned (e.g., a specific food item or service), and invite them back.
3. HANDLING NEGATIVE REVIEWS (1-2 Stars): Be extremely professional, empathetic, and never defensive. Acknowledge and apologize for their poor experience, and offer a clear offline resolution pathway (e.g., "Please reach out to hello@${brand.businessName.toLowerCase().replace(/\s+/g, '')}.com so we can make this right").
4. KEYWORDS: Naturally weave in keywords: [${brand.keywords.join(", ")}] when appropriate, but avoid sounding robotic.
`;

    const userMessage = `Customer Review (${rating} Stars): "${reviewText}"\n\nPlease write a response. Output ONLY the response text, nothing else.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: reputationSystemPrompt },
        { role: "user", content: userMessage }
      ],
    });

    const response = completion.choices[0].message.content?.trim();
    return NextResponse.json({ response });
  } catch (error) {
    console.error("OpenAI Error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
