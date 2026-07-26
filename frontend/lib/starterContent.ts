// Category presets for the first-run wizard.
//
// Two jobs:
//   1. Prefill the audience/keyword fields so step 2 is a confirmation rather
//      than a blank-page writing exercise.
//   2. Provide starter post copy when the AI is unavailable (no OPENAI_API_KEY,
//      network failure, rate limit). The wizard must always end with three real
//      posts on the calendar — that first payoff is the whole point of it.

export interface StarterIdea {
  /** Short label used as the post title on the calendar. */
  title: string;
  /** Prompt handed to the AI when it's available. */
  prompt: string;
  /** Ready-to-use caption when the AI isn't. `{name}` is the business name. */
  caption: string;
}

export interface CategoryPreset {
  audience: string;
  keywords: string[];
  ideas: StarterIdea[];
}

const GENERIC: CategoryPreset = {
  audience: "Local customers in the surrounding neighbourhood.",
  keywords: ["local", "small business"],
  ideas: [
    {
      title: "Introduce your business",
      prompt:
        "A warm introduction post for people in the neighbourhood who haven't visited yet — who we are, what we do, and why we love doing it here.",
      caption:
        "New around here? 👋 We're {name}, and we've been looking after this neighbourhood for a while now.\n\nIf you haven't stopped by yet, consider this your invitation. Come say hello — we'd love to meet you.",
    },
    {
      title: "Show off what you're known for",
      prompt:
        "A post highlighting our most popular product or service and what makes customers keep coming back for it.",
      caption:
        "Everyone has a favourite — and at {name}, we think we know what yours will be. ⭐\n\nOur regulars keep coming back for it, and we'd love to know what you think.\n\nWhat should we feature next?",
    },
    {
      title: "Invite locals to visit this week",
      prompt:
        "A friendly post inviting local customers to stop by this week, with a clear reason to come in now.",
      caption:
        "This week is a good one to stop by {name}. ✨\n\nWe're open and ready for you — bring a friend, take your time, and let us take care of the rest.\n\nSee you soon! 📍",
    },
  ],
};

export const CATEGORY_PRESETS: Record<string, CategoryPreset> = {
  "Coffee Shop": {
    audience:
      "Local professionals, students, and remote workers looking for good coffee nearby.",
    keywords: ["specialty coffee", "locally roasted", "cozy"],
    ideas: [
      {
        title: "Introduce your coffee shop",
        prompt:
          "A warm introduction post for neighbours who haven't visited yet — the atmosphere, the coffee, and what makes the shop worth a detour.",
        caption:
          "New around here? ☕️ We're {name}, your neighbourhood coffee stop.\n\nGood beans, no rush, and a seat by the window if you get here early. Whether you're grabbing one to go or settling in for a couple of hours, we've got you.\n\nCome say hello — first cup's on us to talk you through the menu.",
      },
      {
        title: "Feature your signature drink",
        prompt:
          "A post highlighting our most popular drink — how it's made and why regulars order it every time.",
        caption:
          "Ask our regulars what to order and you'll hear the same answer every time. ☕️✨\n\nWe make it the slow way, every single cup, because it's worth the extra thirty seconds.\n\nCome find out what the fuss is about at {name}.",
      },
      {
        title: "Invite locals in for a slow morning",
        prompt:
          "A cosy post inviting people to spend a slow morning at the shop this week.",
        caption:
          "A slow morning is an underrated luxury. 🌤️\n\nGrab a table at {name}, order something warm, and let the to-do list wait twenty minutes.\n\nWe're open early — who are you bringing?",
      },
    ],
  },

  Restaurant: {
    audience: "Local diners, families, and groups looking for a nearby place to eat.",
    keywords: ["local restaurant", "fresh ingredients", "dine in"],
    ideas: [
      {
        title: "Introduce your restaurant",
        prompt:
          "A warm introduction post for locals who haven't eaten with us yet — the food, the room, and the people behind it.",
        caption:
          "Haven't eaten with us yet? Let's fix that. 🍽️\n\nWe're {name} — a local kitchen that cares a lot about what lands on your table and how you feel while you're eating it.\n\nBook a table or just walk in. We'll find you a seat.",
      },
      {
        title: "Feature a dish everyone orders",
        prompt:
          "A mouth-watering post about our most-ordered dish and what goes into making it.",
        caption:
          "There's one dish our regulars won't let us take off the menu. 👀\n\nMade fresh, made properly, and worth every minute it takes.\n\nCome and see what all the fuss is about at {name}.",
      },
      {
        title: "Invite locals in this week",
        prompt:
          "A friendly post inviting people to book a table this week, aimed at locals looking for a midweek plan.",
        caption:
          "Midweek plans sorted. 🍷\n\nGood food, no fuss, and a table with your name on it at {name}.\n\nBring the family, bring a friend, or bring nobody at all — the bar seats are the best ones anyway.",
      },
    ],
  },

  Bakery: {
    audience: "Local families, morning commuters, and anyone with a weekend sweet tooth.",
    keywords: ["fresh baked", "local bakery", "made daily"],
    ideas: [
      {
        title: "Introduce your bakery",
        prompt:
          "A warm introduction post about the bakery — what we bake, when it comes out of the oven, and why it's worth an early start.",
        caption:
          "We're up before you are. 🥐\n\n{name} bakes fresh every morning, which means the good stuff goes fast and the early crowd knows it.\n\nHaven't been in yet? Come find out what the queue is about.",
      },
      {
        title: "Feature your best seller",
        prompt:
          "A post about the item that sells out first every day and what makes it special.",
        caption:
          "Sells out first. Every single day. 🥧\n\nWe'd make more, but then it wouldn't be as good — and that's not a trade we're willing to make.\n\nGet to {name} early if you want one.",
      },
      {
        title: "Invite locals in for the weekend",
        prompt:
          "A friendly post inviting people to pick something up for the weekend.",
        caption:
          "Weekend rule: someone has to bring the pastries. 🥐☕️\n\nMight as well be you — and might as well be from {name}.\n\nWe'll have a fresh batch ready. See you Saturday?",
      },
    ],
  },

  "Salon & Beauty": {
    audience: "Local clients looking for a salon they can trust and return to.",
    keywords: ["local salon", "self care", "book now"],
    ideas: [
      {
        title: "Introduce your salon",
        prompt:
          "A welcoming introduction post about the salon, the team, and the experience clients can expect on their first visit.",
        caption:
          "Looking for a new place? 💫\n\nWe're {name} — and we take the time to actually listen before we pick up the scissors.\n\nFirst visit with us? Tell us what you're after and we'll talk it through properly. Book in whenever you're ready.",
      },
      {
        title: "Show a transformation",
        prompt:
          "A post showcasing a recent client transformation and the service behind it.",
        caption:
          "This is why we love this job. ✂️✨\n\nA proper consultation, the right approach, and a result our client actually feels good walking out with.\n\nWant one of your own? {name} has appointments open.",
      },
      {
        title: "Invite clients to book this week",
        prompt:
          "A friendly post inviting local clients to book an appointment this week.",
        caption:
          "Consider this your reminder to book something just for you. 🌸\n\nWe've got space this week at {name}, and you've been meaning to for a while now.\n\nDrop us a message — we'll find a time that works.",
      },
    ],
  },

  "Fitness Studio": {
    audience: "Local members and beginners looking for a supportive place to train.",
    keywords: ["local gym", "community", "train together"],
    ideas: [
      {
        title: "Introduce your studio",
        prompt:
          "A welcoming introduction post about the studio, the community, and what a first class is actually like for a nervous beginner.",
        caption:
          "Thinking about starting? Start here. 💪\n\n{name} isn't the kind of place where anyone's watching you. Everyone in that room was a first-timer once, and most of them remember exactly how it felt.\n\nCome try a class. No pressure, no judgement.",
      },
      {
        title: "Spotlight a member's progress",
        prompt:
          "A post celebrating a member's progress and the consistency behind it.",
        caption:
          "Progress isn't loud. It's just showing up, again, on the days you didn't feel like it. 👏\n\nProud of the people training at {name} — you know exactly who you are.\n\nWho's in this week?",
      },
      {
        title: "Invite locals to a class this week",
        prompt:
          "A motivating post inviting locals to book into a class this week.",
        caption:
          "Spots open this week. 🔥\n\nBook one, show up, and let us handle the rest — that's genuinely the whole plan.\n\nSee the timetable and grab your place at {name}.",
      },
    ],
  },

  "Retail Store": {
    audience: "Local shoppers who'd rather buy from a real shop than a warehouse.",
    keywords: ["shop local", "independent", "in store now"],
    ideas: [
      {
        title: "Introduce your shop",
        prompt:
          "A warm introduction post about the shop, what we stock, and why we choose it carefully.",
        caption:
          "Every single thing in here, we picked ourselves. 🛍️\n\nThat's the difference between {name} and scrolling through a warehouse listing — and it's why our customers keep coming back.\n\nCome have a browse. No pressure to buy anything.",
      },
      {
        title: "Show what just landed",
        prompt:
          "A post about new stock that just arrived and why we're excited about it.",
        caption:
          "Just landed, and we're a little too excited about it. ✨\n\nWe've been waiting on this one for weeks — and it's already moving.\n\nCome see it in person at {name} before it's gone.",
      },
      {
        title: "Invite locals to shop small",
        prompt:
          "A friendly post reminding locals what shopping small actually means for the shop.",
        caption:
          "Every order from a small shop is somebody's actual day being made. 💛\n\nThanks for choosing {name} over the easy option — genuinely, it matters more than you'd think.\n\nWe're open all week. Come say hello.",
      },
    ],
  },

  Other: GENERIC,
};

export function getPreset(category: string): CategoryPreset {
  return CATEGORY_PRESETS[category] ?? GENERIC;
}

/** Fill a fallback caption template with the business name. */
export function renderStarterCaption(idea: StarterIdea, businessName: string): string {
  return idea.caption.replaceAll("{name}", businessName.trim() || "us");
}
