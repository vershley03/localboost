// Client-side persistence layer. Until real auth + API land, the dashboard
// persists to localStorage so every interaction survives a refresh.
//
// Multi-org: data is namespaced by org ID (e.g. "lb:org-abc:posts").
// A one-time migration moves legacy flat keys into the first org.

export type Platform = "instagram" | "facebook" | "google" | "x";

export type PostStatus = "draft" | "scheduled" | "published";

export interface ScheduledPost {
  id: string;
  date: string; // yyyy-mm-dd
  time?: string; // HH:mm
  platform: Platform;
  title: string;
  caption: string;
  status: PostStatus;
  imageUrl?: string; // small data URL thumbnail
}

export interface BrandProfile {
  businessName: string;
  category: string;
  tone: string;
  audience: string;
  keywords: string[];
}

export type Connections = Record<Platform, boolean>;

// ─── Org types ───────────────────────────────────────────────────────────────

export interface Org {
  id: string;
  businessName: string;
  category: string;
  createdAt: string; // ISO date
}

// ─── Low-level read/write ────────────────────────────────────────────────────

const GLOBAL_KEYS = {
  orgs: "lb:orgs",
  activeOrg: "lb:active-org",
} as const;

function orgKey(orgId: string, suffix: string): string {
  return `lb:${orgId}:${suffix}`;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked — the UI simply won't persist.
  }
}

function remove(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_BRAND: BrandProfile = {
  businessName: "The Daily Grind",
  category: "Coffee Shop",
  tone: "Friendly & Approachable",
  audience:
    "Local professionals, college students, and coffee enthusiasts in the downtown area.",
  keywords: ["specialty coffee", "cozy", "locally roasted"],
};

const DEFAULT_CONNECTIONS: Connections = {
  instagram: false,
  facebook: false,
  google: false,
  x: false,
};

// ─── Org management ──────────────────────────────────────────────────────────

export function getOrgs(): Org[] {
  return read<Org[]>(GLOBAL_KEYS.orgs, []);
}

export function saveOrgs(orgs: Org[]) {
  write(GLOBAL_KEYS.orgs, orgs);
}

export function getActiveOrgId(): string | null {
  return read<string | null>(GLOBAL_KEYS.activeOrg, null);
}

export function setActiveOrgId(orgId: string) {
  write(GLOBAL_KEYS.activeOrg, orgId);
}

export function newOrgId(): string {
  return `org-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createOrg(name: string, category: string): Org {
  const org: Org = {
    id: newOrgId(),
    businessName: name,
    category,
    createdAt: new Date().toISOString(),
  };

  const orgs = getOrgs();
  orgs.push(org);
  saveOrgs(orgs);

  // Initialize default data for the new org
  const brand: BrandProfile = {
    businessName: name,
    category,
    tone: "Friendly & Approachable",
    audience: "",
    keywords: [],
  };
  write(orgKey(org.id, "brand"), brand);
  write(orgKey(org.id, "posts"), []);
  write(orgKey(org.id, "connections"), DEFAULT_CONNECTIONS);
  write(orgKey(org.id, "generations"), 0);

  setActiveOrgId(org.id);
  return org;
}

export function deleteOrg(orgId: string) {
  const orgs = getOrgs().filter((o) => o.id !== orgId);
  saveOrgs(orgs);

  // Clean up namespaced data
  for (const suffix of ["posts", "brand", "connections", "generations"]) {
    remove(orgKey(orgId, suffix));
  }

  // If the deleted org was active, switch to the first remaining org
  if (getActiveOrgId() === orgId && orgs.length > 0) {
    setActiveOrgId(orgs[0].id);
  }
}

// ─── One-time migration from legacy flat keys ────────────────────────────────

const LEGACY_KEYS = {
  posts: "lb:posts",
  brand: "lb:brand",
  connections: "lb:connections",
  generations: "lb:generations",
};

export function ensureMigrated(): string {
  const orgs = getOrgs();

  // Already migrated — return the active org
  if (orgs.length > 0) {
    const activeId = getActiveOrgId();
    if (activeId && orgs.some((o) => o.id === activeId)) return activeId;
    setActiveOrgId(orgs[0].id);
    return orgs[0].id;
  }

  // First-time migration: create a default org from legacy data
  const legacyBrand = read<BrandProfile | null>(LEGACY_KEYS.brand, null);
  const legacyPosts = read<ScheduledPost[] | null>(LEGACY_KEYS.posts, null);
  const legacyConnections = read<Connections | null>(LEGACY_KEYS.connections, null);
  const legacyGenerations = read<number | null>(LEGACY_KEYS.generations, null);

  const orgId = newOrgId();
  const brand = legacyBrand ?? DEFAULT_BRAND;

  const org: Org = {
    id: orgId,
    businessName: brand.businessName,
    category: brand.category,
    createdAt: new Date().toISOString(),
  };

  saveOrgs([org]);
  setActiveOrgId(orgId);

  // Move legacy data into the org namespace
  write(orgKey(orgId, "brand"), brand);
  write(orgKey(orgId, "posts"), legacyPosts ?? seedPosts());
  write(orgKey(orgId, "connections"), legacyConnections ?? DEFAULT_CONNECTIONS);
  write(orgKey(orgId, "generations"), legacyGenerations ?? 0);

  // Clean up old flat keys
  for (const key of Object.values(LEGACY_KEYS)) {
    remove(key);
  }

  return orgId;
}

// ─── Org-scoped data access ──────────────────────────────────────────────────

// All data functions now require an orgId parameter for explicit scoping.

export function toDateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function seedPosts(): ScheduledPost[] {
  const today = new Date();
  const at = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return toDateKey(d);
  };
  return [
    {
      id: "seed-1",
      date: at(0),
      platform: "instagram",
      title: "Morning Coffee Special",
      caption: "Start your day right — 20% off all lattes before 10am. ☕",
      status: "scheduled",
    },
    {
      id: "seed-2",
      date: at(1),
      platform: "facebook",
      title: "Meet the Barista: James",
      caption: "Say hi to James, the friendly face behind your morning brew.",
      status: "scheduled",
    },
    {
      id: "seed-3",
      date: at(4),
      platform: "google",
      title: "Weekend Brunch Menu Drop",
      caption: "New brunch menu launches this weekend — see what's cooking.",
      status: "draft",
    },
  ];
}

export function getPosts(orgId: string): ScheduledPost[] {
  const existing = read<ScheduledPost[] | null>(orgKey(orgId, "posts"), null);
  if (existing) return existing;
  const seeded = seedPosts();
  write(orgKey(orgId, "posts"), seeded);
  return seeded;
}

export function savePosts(orgId: string, posts: ScheduledPost[]) {
  write(orgKey(orgId, "posts"), posts);
}

export function getBrand(orgId: string): BrandProfile {
  return read<BrandProfile>(orgKey(orgId, "brand"), DEFAULT_BRAND);
}

export function saveBrand(orgId: string, brand: BrandProfile) {
  write(orgKey(orgId, "brand"), brand);

  // Keep the org list name in sync
  const orgs = getOrgs();
  const idx = orgs.findIndex((o) => o.id === orgId);
  if (idx >= 0 && orgs[idx].businessName !== brand.businessName) {
    orgs[idx].businessName = brand.businessName;
    orgs[idx].category = brand.category;
    saveOrgs(orgs);
  }
}

export function getConnections(orgId: string): Connections {
  return read<Connections>(orgKey(orgId, "connections"), DEFAULT_CONNECTIONS);
}

export function saveConnections(orgId: string, connections: Connections) {
  write(orgKey(orgId, "connections"), connections);
}

export function getGenerationCount(orgId: string): number {
  return read<number>(orgKey(orgId, "generations"), 0);
}

export function bumpGenerationCount(orgId: string, by: number): number {
  const next = getGenerationCount(orgId) + by;
  write(orgKey(orgId, "generations"), next);
  return next;
}

export function newId(): string {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Reputation Mock ─────────────────────────────────────────────────────────

export interface MockReview {
  id: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  text: string;
  platform: 'google' | 'facebook';
  status: 'unanswered' | 'replied';
  replyText?: string;
  date: string;
}

const DEFAULT_MOCK_REVIEWS: MockReview[] = [
  {
    id: "rev-1",
    authorName: "Marcus Vance",
    rating: 5,
    text: "The vanilla latte at this place is out of this world! Incredible atmosphere, and the staff made me feel right at home.",
    platform: "google",
    status: "unanswered",
    date: "2026-07-19"
  },
  {
    id: "rev-2",
    authorName: "Jessica Lee",
    rating: 2,
    text: "I visited during the morning rush. The coffee was okay, but I waited 20 minutes for a single muffin and the server seemed annoyed.",
    platform: "facebook",
    status: "unanswered",
    date: "2026-07-18"
  },
  {
    id: "rev-3",
    authorName: "David Chen",
    rating: 5,
    text: "Best specialty coffee in the downtown area, hands down. The pour-over was perfection and the barista explained the whole process. Love the cozy vibe!",
    platform: "google",
    status: "replied",
    replyText: "Thank you so much, David! We're thrilled you enjoyed our pour-over. Our baristas are truly passionate about sharing the craft. We hope to see you again soon!",
    date: "2026-07-17"
  },
  {
    id: "rev-4",
    authorName: "Samantha Ortiz",
    rating: 4,
    text: "Great ambiance and the pastries are delicious. Only reason it's not 5 stars is because the WiFi was a bit spotty during my visit.",
    platform: "google",
    status: "unanswered",
    date: "2026-07-16"
  },
  {
    id: "rev-5",
    authorName: "Tyler Brooks",
    rating: 1,
    text: "Terrible experience. My order was wrong twice and nobody apologized. The place was dirty and the music was way too loud. Will not be coming back.",
    platform: "facebook",
    status: "unanswered",
    date: "2026-07-15"
  },
  {
    id: "rev-6",
    authorName: "Priya Sharma",
    rating: 5,
    text: "This is my go-to study spot! Quiet corners, amazing iced matcha, and the staff remembers my name. Feels like a second home.",
    platform: "google",
    status: "replied",
    replyText: "Priya, you've made our day! We love being part of your study routine. Your usual iced matcha will be waiting for you!",
    date: "2026-07-14"
  },
  {
    id: "rev-7",
    authorName: "Robert Kim",
    rating: 3,
    text: "Coffee is decent but nothing special. Prices are a bit high for the portion sizes. The location is convenient though.",
    platform: "facebook",
    status: "unanswered",
    date: "2026-07-13"
  },
  {
    id: "rev-8",
    authorName: "Aisha Johnson",
    rating: 4,
    text: "Loved the seasonal pumpkin spice blend! The locally roasted beans make all the difference. Would love to see more dairy-free milk options.",
    platform: "google",
    status: "unanswered",
    date: "2026-07-12"
  }
];

export function getMockReviews(orgId: string): MockReview[] {
  return read<MockReview[]>(orgKey(orgId, "reviews"), DEFAULT_MOCK_REVIEWS);
}

export function saveMockReviews(orgId: string, reviews: MockReview[]) {
  write(orgKey(orgId, "reviews"), reviews);
}
