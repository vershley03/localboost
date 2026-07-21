import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { prompt, brand, brandKit } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OpenAI API Key" }, { status: 500 });
    }

    const openai = new OpenAI();

    // If the client already built the enhanced prompt via buildImagePrompt, use it directly.
    // Otherwise fall back to basic prompt construction for backwards compat.
    let optimizedPrompt: string;
    if (prompt.startsWith("Subject:")) {
      // Enhanced prompt from buildImagePrompt — use as-is
      optimizedPrompt = prompt;
    } else {
      // Legacy fallback
      const colors = brandKit?.colors;
      const colorHint = colors
        ? ` Color palette: ${colors.primary}, ${colors.secondary}, ${colors.accent}.`
        : "";
      optimizedPrompt = `A high-quality, professional, realistic photograph for a social media post for a ${brand.category} named ${brand.businessName}. The aesthetic should appeal to ${brand.audience}. Subject: ${prompt}.${colorHint} No text in the image.`;
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: optimizedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    if (!response.data || response.data.length === 0 || !response.data[0]?.url) {
      return NextResponse.json({ error: "Image generation failed or returned no data" }, { status: 500 });
    }

    return NextResponse.json({ imageUrl: response.data[0].url });
  } catch (error) {
    console.error("OpenAI Image Error:", error);
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
  }
}
