import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI();

export async function POST(request: Request) {
  try {
    const { prompt, brand } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OpenAI API Key" }, { status: 500 });
    }

    // Enhance the prompt for DALL-E to make it fit the business better
    const optimizedPrompt = `A high-quality, professional, realistic photograph for a social media post for a ${brand.category} named ${brand.businessName}. The aesthetic should appeal to ${brand.audience}. Subject: ${prompt}. No text in the image.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: optimizedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return NextResponse.json({ imageUrl: response.data[0].url });
  } catch (error) {
    console.error("OpenAI Image Error:", error);
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
  }
}
