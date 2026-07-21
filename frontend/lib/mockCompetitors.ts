import { type TrackedCompetitor, type CompetitorPostLocal, newId } from "@/lib/store";

// Mock competitors for "Coffee Shop" category — realistic seed data

export const MOCK_COMPETITORS: TrackedCompetitor[] = [
  {
    id: newId(),
    orgId: "mock",
    username: "seattle_essential_bakery",
    displayName: "Seattle Essential Bakery",
    followers: 4200,
    postsPerWeek: 4,
    avgLikes: 156,
    avatarUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23D2691E'/%3E%3Ctext x='50' y='65' text-anchor='middle' font-size='50' fill='white' font-weight='bold'%3ES%3C/text%3E%3C/svg%3E",
    lastFetched: new Date().toISOString(),
  },
  {
    id: newId(),
    orgId: "mock",
    username: "tastybuns_pdx",
    displayName: "Tasty Buns PDX",
    followers: 6800,
    postsPerWeek: 5,
    avgLikes: 312,
    avatarUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23F4A460'/%3E%3Ctext x='50' y='65' text-anchor='middle' font-size='50' fill='white' font-weight='bold'%3ET%3C/text%3E%3C/svg%3E",
    lastFetched: new Date().toISOString(),
  },
  {
    id: newId(),
    orgId: "mock",
    username: "flourpower_sea",
    displayName: "Flour Power Seattle",
    followers: 3100,
    postsPerWeek: 2,
    avgLikes: 89,
    avatarUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%238B7355'/%3E%3Ctext x='50' y='65' text-anchor='middle' font-size='50' fill='white' font-weight='bold'%3EF%3C/text%3E%3C/svg%3E",
    lastFetched: new Date().toISOString(),
  },
];

// Generate mock posts for each competitor — last 14 days with varied engagement
function generateMockPosts(competitorId: string, competitorUsername: string): CompetitorPostLocal[] {
  const now = new Date();
  const posts: CompetitorPostLocal[] = [];

  const captions: Record<string, string[]> = {
    seattle_essential_bakery: [
      "☕ Fresh croissants just out of the oven — grab yours before they're gone! #seattlebakery #freshpastries",
      "Behind the scenes: 4am dough making at its finest. 🥐✨ #bakerlife #artisanpastries",
      "Our new single-origin espresso is here and it's 🔥 Bold, smooth, perfectly crafted. #specialtycoffee #espresso",
      "Summer specialty: iced lavender latte with locally-sourced honey. Limited time! 💜 #summermenu #localfirst",
      "Sourdough season is HERE. Our new starter is 3 weeks old and already legendary. #sourdoughbread #fermented",
      "Morning vibes ☀️ How do you take your coffee? #coffeecommunity #coffeelover",
      "New seating area is done! Come study, work, or just vibe with us. 🪴 #coffeeculture",
      "Pumpkin spice everything is coming... stay tuned 🎃 #fallMenu #pumpkinseason",
      "Local love 💛 Thanks for supporting small business! #seattlesmallbusiness #supportlocal",
      "Barista competition prep mode ON ☕️ Wish us luck at the regional championship! #baristachampionship",
    ],
    tastybuns_pdx: [
      "🎬 NEW: Check out our Reels for daily coffee art timelapse videos! 🎨☕ #coffeeArt #barista",
      "Croissant sandwich of the week: Prosciutto, fig jam & brie. Game changer. 🥐 #sandwichseason",
      "GIVEAWAY: Follow + like + tag a friend to win free coffee for a month! 🎁 #giveaway #freecoffee",
      "Our roaster is officially 1 year old! Celebrating with 25% off all beans this weekend. 🎉 #roastery #anniversary",
      "Wednesday ritual: pour-over brewing tutorial at 4pm. All skill levels welcome! ☕️📚 #coffeeEd",
      "New oat milk just landed and it's 😘👌 Smooth, creamy, no weird aftertaste. #plantbased #oatmilk",
      "Reel 3/5: Watch our espresso machine get a deep clean. ASMR content you didn't know you needed. #satisfying",
      "Menu hack: Add an extra shot + oat milk to your iced latte for a sweet vanilla bomb ✨ #menuHack #tasteTest",
      "Storefront glow-up almost complete! Sneak peek coming soon 👀 #renovations #newlook",
      "Local artist feature: These pieces are for sale — 20% proceeds go to a local nonprofit. #supportArt #community",
    ],
    flourpower_sea: [
      "Morning light hitting just right ☀️ Come sit with us. #morningvibes #coffeeshop",
      "Whole grain sourdough is now on the menu! Earthy, nutty, sustaining. #sourdough #bakery",
      "Our barista Emma just completed her SCA certification 🎓☕ Expect even more precision pulls! #baristadevelopment",
      "Seasonal: Cold brew concentrate now available for takeaway. DIY iced coffee at home! #coldbrew #diy",
      "Thank you to everyone who voted us 'Best Hidden Gem' in the local poll! 💚 #community #hiddenGem",
      "In the quiet corner, that's where the magic happens ✨ Where do you fit best in our space? #coffeeculture",
      "Espresso + cardamom + almond milk = our new secret menu item. Ask about it! #secretmenu #cardamom",
      "Farmers market pickup tomorrow morning 8-9am! Fresh pastries while supplies last 🥐 #farmermarket #fresh",
      "Our summer blend is officially roasting. Fruity, balanced, delicious. #specialty #roastery",
      "Meditation + coffee Thursdays at 7am. Free. First-come first-served. 🧘☕ #wellness #community",
    ],
  };

  const photoUrls = [
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%238B6F47' width='400' height='300'/%3E%3Ccircle cx='200' cy='150' r='50' fill='%23D2B48C'/%3E%3Crect x='50' y='200' width='300' height='80' fill='%23D2691E'/%3E%3C/svg%3E",
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23F5DEB3' width='400' height='300'/%3E%3Crect x='100' y='80' width='200' height='150' fill='%23DEB887' rx='10'/%3E%3C/svg%3E",
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%238B4513' width='400' height='300'/%3E%3Ccircle cx='80' cy='60' r='40' fill='%23CD853F'/%3E%3Crect x='200' y='150' width='150' height='120' fill='%23DAA520'/%3E%3C/svg%3E",
  ];

  const competitorCaptions = captions[competitorUsername] || captions.seattle_essential_bakery;

  for (let i = 0; i < 10; i++) {
    const daysAgo = Math.floor(Math.random() * 14);
    const postDate = new Date(now);
    postDate.setDate(postDate.getDate() - daysAgo);

    const caption = competitorCaptions[i];
    const baseEngagement = Math.floor(Math.random() * 100) + 50;
    const engagement = baseEngagement + (daysAgo < 3 ? Math.floor(Math.random() * 200) : 0); // Recent posts get higher engagement

    posts.push({
      id: newId(),
      competitorId,
      caption,
      imageUrl: photoUrls[i % photoUrls.length],
      likeCount: engagement,
      commentsCount: Math.floor(engagement * 0.15),
      timestamp: postDate.toISOString(),
      type: i % 3 === 0 ? "VIDEO" : i % 3 === 1 ? "CAROUSEL" : "IMAGE",
      hashtags: caption
        .split(" ")
        .filter((word) => word.startsWith("#"))
        .slice(0, 4),
    });
  }

  return posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Generate all mock posts keyed by competitor ID
export function getMockCompetitorPosts(): Record<string, CompetitorPostLocal[]> {
  const result: Record<string, CompetitorPostLocal[]> = {};

  MOCK_COMPETITORS.forEach((competitor) => {
    result[competitor.id] = generateMockPosts(competitor.id, competitor.username);
  });

  return result;
}
