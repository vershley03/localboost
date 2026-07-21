import { type CompetitorInsight, type CompetitorPostLocal, newId } from "@/lib/store";

// Fallback insights for mock mode or when OPENAI_API_KEY is missing
export function getMockInsights(
  competitorPostsMap: Record<string, CompetitorPostLocal[]>,
  businessName: string
): CompetitorInsight[] {
  const insights: CompetitorInsight[] = [];

  // Collect all posts for analysis
  const allPosts = Object.values(competitorPostsMap).flat();
  const recentPosts = allPosts.filter(
    (p) => new Date(p.timestamp).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  );

  // 1. Gap Insight: Missing seasonal content (high priority if it's trending)
  const summerKeywords = ["iced", "cold", "summer", "refreshing", "lemonade"];
  const summerPosts = recentPosts.filter((p) =>
    summerKeywords.some((kw) => p.caption.toLowerCase().includes(kw))
  );

  if (summerPosts.length >= 2) {
    insights.push({
      id: newId(),
      type: "gap",
      title: "Summer content missing — all competitors posting iced drinks",
      body: `@${summerPosts[0].competitorId} and @${summerPosts[1].competitorId} posted cold brew & iced latte content last week with ${Math.round((summerPosts[0].likeCount + summerPosts[1].likeCount) / 2)} avg likes. You haven't posted summer drinks in 10 days. Opportunity: Launch your iced version tomorrow morning to catch the rush.`,
      competitors: ["tastybuns_pdx", "seattle_essential_bakery"],
      evidence: summerPosts.slice(0, 2),
      suggestedPrompt: "Refreshing iced coffee beverage, condensation glistening in summer sunlight, cold aesthetic, professional food photography",
      priority: "high",
      status: "new",
      createdAt: new Date().toISOString(),
    });
  }

  // 2. Timing Insight: Best posting time analysis
  const highEngagementPosts = recentPosts.sort((a, b) => b.likeCount - a.likeCount).slice(0, 3);
  if (highEngagementPosts.length > 0) {
    const avgTime = Math.round(
      highEngagementPosts.reduce((acc, p) => {
        const hour = new Date(p.timestamp).getHours();
        return acc + hour;
      }, 0) / highEngagementPosts.length
    );

    insights.push({
      id: newId(),
      type: "timing",
      title: `Peak time insight: ${avgTime}am drives 2x engagement`,
      body: `Their top-performing posts (@tastybuns_pdx & @seattle_essential_bakery) were posted around ${avgTime}am—${avgTime + 1}am, averaging ${Math.round(highEngagementPosts[0].likeCount)} likes. You typically post at noon. Try shifting to morning posts this week to test.`,
      competitors: ["tastybuns_pdx", "seattle_essential_bakery"],
      evidence: highEngagementPosts,
      suggestedPrompt: "Morning coffee ritual, sunrise light, steaming espresso cup, cozy cafe environment",
      priority: "medium",
      status: "new",
      createdAt: new Date().toISOString(),
    });
  }

  // 3. Format Insight: Video/Reels outperforming static images
  const videoPosts = recentPosts.filter((p) => p.type === "VIDEO");
  const imagePosts = recentPosts.filter((p) => p.type === "IMAGE");
  const videoAvgLikes = videoPosts.length > 0 ? Math.round(videoPosts.reduce((a, p) => a + p.likeCount, 0) / videoPosts.length) : 0;
  const imageAvgLikes = imagePosts.length > 0 ? Math.round(imagePosts.reduce((a, p) => a + p.likeCount, 0) / imagePosts.length) : 0;

  if (videoAvgLikes > imageAvgLikes * 1.5 && videoPosts.length >= 2) {
    insights.push({
      id: newId(),
      type: "format",
      title: "Reels getting 2x more engagement than static posts",
      body: `Competitor Reels average ${videoAvgLikes} likes vs static posts at ${imageAvgLikes} likes. @tastybuns_pdx is winning with behind-the-scenes Reel content. Your last video was 8 days ago. Idea: Film your barista making a latte—short, snappy, authentic.`,
      competitors: ["tastybuns_pdx"],
      evidence: videoPosts.slice(0, 2),
      suggestedPrompt: "Barista crafting espresso, hands pulling shots, coffee pouring, dynamic motion, short-form video aesthetic",
      priority: "high",
      status: "new",
      createdAt: new Date().toISOString(),
    });
  }

  // 4. Spike Insight: Recent high-engagement post
  const topPost = recentPosts.reduce((max, p) => (p.likeCount > max.likeCount ? p : max));
  if (topPost && topPost.likeCount > 250) {
    insights.push({
      id: newId(),
      type: "spike",
      title: `📈 @${topPost.competitorId} just hit ${topPost.likeCount} likes — viral moment`,
      body: `Their post "${topPost.caption.slice(0, 60)}..." got ${topPost.likeCount} likes in 2 days (3x their average). The hook: behind-the-scenes + community call-to-action. Try similar authenticity in your next post.`,
      competitors: [topPost.competitorId as any],
      evidence: [topPost],
      suggestedPrompt: "Behind-the-scenes coffee shop moment, authentic team interaction, community-focused storytelling",
      priority: "medium",
      status: "new",
      createdAt: new Date().toISOString(),
    });
  }

  // 5. Hashtag Insight: Most used successful hashtags
  const hashtagFreq: Record<string, number> = {};
  recentPosts.forEach((p) => {
    p.hashtags.forEach((tag) => {
      hashtagFreq[tag] = (hashtagFreq[tag] || 0) + 1;
    });
  });

  const topHashtags = Object.entries(hashtagFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([tag]) => tag);

  if (topHashtags.length > 0) {
    insights.push({
      id: newId(),
      type: "hashtag",
      title: `Top performing hashtags: ${topHashtags.join(", ")}`,
      body: `Competitors use ${topHashtags.join(", ")} consistently. These appear in posts averaging 150+ likes. Add these to your posts to increase discoverability in the local coffee community.`,
      competitors: ["seattle_essential_bakery", "tastybuns_pdx", "flourpower_sea"],
      evidence: recentPosts.filter((p) => p.hashtags.some((h) => topHashtags.includes(h))).slice(0, 2),
      suggestedPrompt: "Coffee shop moment, include trending hashtags: specialty coffee, local cafe, artisan craft",
      priority: "low",
      status: "new",
      createdAt: new Date().toISOString(),
    });
  }

  return insights;
}
