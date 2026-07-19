import { NextResponse } from "next/server";

// Generates social captions with OpenAI. Returns 503 when no key is
// configured or the upstream call fails — the client falls back to its
// built-in template generator so the flow never dead-ends.

interface GenerateRequest {
  prompt: string;
  platforms: string[];
  brand: {
    businessName: string;
    category: string;
    tone: string;
    audience: string;
    keywords: string[];
  };
  image?: string; // data URL, optional
}

const PLATFORM_GUIDANCE: Record<string, string> = {
  instagram:
    "Instagram: casual and visual, 1-3 fitting emoji, end with 3-5 relevant hashtags on their own line.",
  facebook:
    "Facebook: warm and community-minded, 2-3 short paragraphs, invite comments or visits. No hashtag spam.",
  google:
    "Google Business Profile update: concise and factual, max 2 sentences, include a clear call to action to visit. No hashtags, no emoji.",
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "no_api_key" }, { status: 503 });
  }

  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const prompt = (body.prompt ?? "").trim().slice(0, 500);
  const platforms = (body.platforms ?? []).filter((p) => p in PLATFORM_GUIDANCE);
  if (prompt.length < 4 || platforms.length === 0) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const brand = body.brand;
  const system = [
    `You are the social media manager for "${brand.businessName}", a local ${brand.category?.toLowerCase() || "business"}.`,
    `Brand voice: ${brand.tone}.`,
    `Target audience: ${brand.audience}`,
    brand.keywords?.length
      ? `Brand keywords to weave in naturally where relevant: ${brand.keywords.join(", ")}.`
      : "",
    "Write one post caption per requested platform. Keep it authentic and specific to the update — never generic filler.",
    'Respond with ONLY valid JSON: {"posts": [{"platform": "...", "caption": "..."}]}',
  ]
    .filter(Boolean)
    .join("\n");

  const userText = [
    `Update from the business: ${prompt}`,
    `Platforms: ${platforms.map((p) => PLATFORM_GUIDANCE[p]).join("\n")}`,
    body.image ? "A photo is attached — reference what's visible in it." : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const userContent: unknown[] = [{ type: "text", text: userText }];
  if (body.image?.startsWith("data:image/")) {
    userContent.push({ type: "image_url", image_url: { url: body.image, detail: "low" } });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        max_tokens: 700,
        temperature: 0.8,
      }),
    });

    if (!res.ok) {
      const detail = await res.json().catch(() => null);
      console.error("OpenAI error:", res.status, detail?.error?.code ?? "");
      return NextResponse.json(
        { error: "upstream_failed", code: detail?.error?.code ?? res.status },
        { status: 503 },
      );
    }

    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
    const posts = Array.isArray(parsed.posts)
      ? parsed.posts.filter(
          (p: { platform?: string; caption?: string }) =>
            typeof p.platform === "string" && typeof p.caption === "string",
        )
      : [];

    if (posts.length === 0) {
      return NextResponse.json({ error: "empty_response" }, { status: 503 });
    }

    return NextResponse.json({ posts, source: "openai" });
  } catch (err) {
    console.error("Generation failed:", err);
    return NextResponse.json({ error: "upstream_failed" }, { status: 503 });
  }
}
