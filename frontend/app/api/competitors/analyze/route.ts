import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      businessName,
      category,
      yourPosts,
      competitorPosts,
    } = await req.json();

    // If no API key, return mock insights
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback to mock insights
      const { getMockInsights } = await import("@/lib/mockInsights");
      const mockInsights = getMockInsights({}, businessName);
      return NextResponse.json({ insights: mockInsights });
    }

    // Prepare the analysis prompt for GPT-4
    const systemPrompt = `You are a local marketing strategist specializing in social media strategy for small businesses. You analyze competitor Instagram activity to identify gaps, opportunities, timing patterns, and engagement trends. Your goal is to provide actionable insights that help the business outperform competitors.

You always respond with valid JSON in this format:
{
  "insights": [
    {
      "type": "gap" | "timing" | "format" | "hashtag" | "spike",
      "title": "Short insight title",
      "body": "Detailed explanation of the insight",
      "suggestedPrompt": "A specific prompt for the business to use in their Magic Creator",
      "priority": "high" | "medium" | "low"
    }
  ]
}

Guidelines:
- Gap: Content themes competitors are posting but the business isn't
- Timing: Best times to post based on when competitors get high engagement
- Format: Video/Reels vs static posts — which performs better
- Hashtag: Most effective hashtags competitors use
- Spike: Recent high-engagement posts that created momentum
- Max 5 insights, sorted by priority
- Suggested prompts should be specific, actionable, and reference the competitor data`;

    const userPrompt = `
Analyze these competitors for ${businessName} (Category: ${category}):

${competitorPosts
  .map(
    (post: any) => `
- Username: ${post.username}
  Caption: ${post.caption}
  Likes: ${post.likeCount}
  Date: ${post.timestamp}
  Hashtags: ${post.hashtags.join(", ")}
`
  )
  .join("\n")}

Our recent posts:
${(yourPosts || [])
  .map(
    (post: any) => `
- Caption: ${post.caption}
  Average engagement: ${post.avgEngagement || "unknown"}
`
  )
  .join("\n")}

Provide 3-5 specific, actionable insights based on this data.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);

      // Fallback to mock on API error
      const { getMockInsights } = await import("@/lib/mockInsights");
      const mockInsights = getMockInsights({}, businessName);
      return NextResponse.json({ insights: mockInsights });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the JSON response
    let parsed;
    try {
      // Try to extract JSON from the response if it's wrapped in markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      console.error("Failed to parse GPT response:", e);
      // Fallback to mock
      const { getMockInsights } = await import("@/lib/mockInsights");
      const mockInsights = getMockInsights({}, businessName);
      return NextResponse.json({ insights: mockInsights });
    }

    // Enrich with IDs and timestamps
    const insights = (parsed.insights || []).map((insight: any, idx: number) => ({
      id: `insight-${Date.now()}-${idx}`,
      ...insight,
      createdAt: new Date().toISOString(),
      status: "new" as const,
    }));

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Error analyzing competitors:", error);

    // Fallback to mock on any error
    try {
      const { getMockInsights } = await import("@/lib/mockInsights");
      const mockInsights = getMockInsights({}, "Your Business");
      return NextResponse.json({ insights: mockInsights });
    } catch (fallbackError) {
      return NextResponse.json(
        { error: "Failed to generate insights" },
        { status: 500 }
      );
    }
  }
}
