// Client-side persistence layer. Until real auth + API land, the dashboard
// persists to localStorage so every interaction survives a refresh.

export type Platform = "instagram" | "facebook" | "google";

export type PostStatus = "draft" | "scheduled" | "published";

export interface ScheduledPost {
  id: string;
  date: string; // yyyy-mm-dd
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

const KEYS = {
  posts: "lb:posts",
  brand: "lb:brand",
  connections: "lb:connections",
  generations: "lb:generations",
} as const;

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

export const DEFAULT_BRAND: BrandProfile = {
  businessName: "The Daily Grind",
  category: "Coffee Shop",
  tone: "Friendly & Approachable",
  audience:
    "Local professionals, college students, and coffee enthusiasts in the downtown area.",
  keywords: ["specialty coffee", "cozy", "locally roasted"],
};

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

export function getPosts(): ScheduledPost[] {
  const existing = read<ScheduledPost[] | null>(KEYS.posts, null);
  if (existing) return existing;
  const seeded = seedPosts();
  write(KEYS.posts, seeded);
  return seeded;
}

export function savePosts(posts: ScheduledPost[]) {
  write(KEYS.posts, posts);
}

export function getBrand(): BrandProfile {
  return read<BrandProfile>(KEYS.brand, DEFAULT_BRAND);
}

export function saveBrand(brand: BrandProfile) {
  write(KEYS.brand, brand);
}

export function getConnections(): Connections {
  return read<Connections>(KEYS.connections, {
    instagram: false,
    facebook: false,
    google: false,
  });
}

export function saveConnections(connections: Connections) {
  write(KEYS.connections, connections);
}

export function getGenerationCount(): number {
  return read<number>(KEYS.generations, 0);
}

export function bumpGenerationCount(by: number): number {
  const next = getGenerationCount() + by;
  write(KEYS.generations, next);
  return next;
}

export function newId(): string {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
