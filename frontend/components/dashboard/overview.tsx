"use client";

import {
  CalendarIcon,
  FacebookIcon,
  GoogleIcon,
  InstagramIcon,
  PlusIcon,
  SparklesIcon,
  TwitterXIcon,
  TrendingUpIcon,
  UsersIcon,
} from "@/components/icons";
import type { Platform, ScheduledPost } from "@/lib/store";
import type { TabId } from "./nav";

const PLATFORM_ICONS: Record<Platform, typeof InstagramIcon> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  google: GoogleIcon,
  x: TwitterXIcon,
};

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  google: "Google Business",
  x: "X (Twitter)",
};

function friendlyDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function Sparkline({ color, points }: { color: string, points: string }) {
  return (
    <svg width="80" height="30" viewBox="0 0 80 30" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", right: 24, bottom: 24, opacity: 0.6 }}>
      <path d={points} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={`${points} L 80 30 L 0 30 Z`} fill={color} fillOpacity="0.1" />
    </svg>
  );
}

export function Overview({
  posts,
  generationCount,
  businessName,
  onNavigate,
}: {
  posts: ScheduledPost[];
  generationCount: number;
  businessName: string;
  onNavigate: (tab: TabId) => void;
}) {
  const todayKey = new Date();
  todayKey.setHours(0, 0, 0, 0);

  const upcoming = posts
    .filter((p) => {
      const [y, m, d] = p.date.split("-").map(Number);
      return new Date(y, m - 1, d).getTime() >= todayKey.getTime();
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <header className="app-page-header">
        <div>
          <h1 className="app-page-title">{greeting}, Sarah</h1>
          <p className="app-page-subtitle">Here&apos;s how {businessName} is doing today.</p>
        </div>
        <button className="btn btn-accent" onClick={() => onNavigate("creator")}>
          <PlusIcon size={16} />
          New Campaign
        </button>
      </header>

      <div className="stat-grid">
        <div className="stat-tile">
          <div className="stat-tile-header">
            <div className="stat-tile-icon blue">
              <SparklesIcon size={17} />
            </div>
            AI Generations
          </div>
          <div className="stat-tile-value">{124 + generationCount}</div>
          <div className="stat-tile-note positive">+12% this week</div>
          <Sparkline color="var(--accent)" points="M0 25 Q 15 20, 30 25 T 55 15 T 80 5" />
        </div>

        <div className="stat-tile">
          <div className="stat-tile-header">
            <div className="stat-tile-icon coral">
              <UsersIcon size={17} />
            </div>
            Audience Reached
          </div>
          <div className="stat-tile-value">4.2k</div>
          <div className="stat-tile-note positive">+800 new views</div>
          <Sparkline color="var(--coral)" points="M0 28 Q 20 20, 40 22 T 65 10 T 80 2" />
        </div>

        <div className="stat-tile">
          <div className="stat-tile-header">
            <div className="stat-tile-icon violet">
              <TrendingUpIcon size={17} />
            </div>
            Scheduled Posts
          </div>
          <div className="stat-tile-value">{scheduledCount}</div>
          <div className="stat-tile-note">Across all platforms</div>
          <Sparkline color="var(--violet)" points="M0 20 Q 25 25, 45 15 T 60 18 T 80 8" />
        </div>
      </div>

      <section className="card card-lg" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 className="card-title" style={{ margin: 0 }}>Audience Engagement</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--accent)' }}></span>
              Organic
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--violet)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--violet)' }}></span>
              Paid
            </span>
          </div>
        </div>
        <div style={{ position: 'relative', height: 200, width: '100%' }}>
          <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="50" x2="800" y2="50" stroke="var(--border)" strokeDasharray="4 4" />
            <line x1="0" y1="100" x2="800" y2="100" stroke="var(--border)" strokeDasharray="4 4" />
            <line x1="0" y1="150" x2="800" y2="150" stroke="var(--border)" strokeDasharray="4 4" />
            
            {/* Paid Area */}
            <path d="M0 180 Q 100 170, 200 140 T 400 150 T 600 120 T 800 130 L 800 200 L 0 200 Z" fill="var(--violet)" fillOpacity="0.1" />
            <path d="M0 180 Q 100 170, 200 140 T 400 150 T 600 120 T 800 130" stroke="var(--violet)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Organic Area */}
            <path d="M0 150 Q 150 120, 300 100 T 500 80 T 700 40 L 800 20 L 800 200 L 0 200 Z" fill="url(#organicGrad)" fillOpacity="0.2" />
            <path d="M0 150 Q 150 120, 300 100 T 500 80 T 700 40 L 800 20" stroke="var(--accent)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            
            <defs>
              <linearGradient id="organicGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, color: 'var(--text-faint)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
      </section>

      <section className="card card-lg">
        <h2 className="card-title">Upcoming Content</h2>
        {upcoming.length === 0 ? (
          <div className="empty-state" style={{ padding: '64px 24px' }}>
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style={{ marginBottom: 24 }}>
              <rect x="20" y="30" width="80" height="70" rx="12" fill="var(--bg-secondary)" stroke="var(--border)" strokeWidth="4" />
              <path d="M40 20 L40 40 M80 20 L80 40" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" />
              <rect x="30" y="50" width="60" height="40" rx="6" fill="#FFFFFF" />
              <circle cx="45" cy="70" r="5" fill="var(--violet)" />
              <path d="M100 20 Q 110 10, 115 25 T 105 35 Z" fill="var(--coral)" opacity="0.8" />
              <path d="M10 60 L 15 50 L 25 55 Z" fill="var(--accent)" opacity="0.8" />
            </svg>
            <div className="empty-state-title" style={{ fontSize: 20 }}>Nothing scheduled yet</div>
            <p style={{ maxWidth: 300, margin: '0 auto 24px', color: 'var(--text-muted)' }}>Get ahead of your marketing. Let AI draft and schedule a week of content in minutes.</p>
            <button
              className="btn btn-accent"
              onClick={() => onNavigate("creator")}
            >
              <SparklesIcon size={16} />
              Open Magic Creator
            </button>
          </div>
        ) : (
          <div>
            {upcoming.map((post) => {
              const PlatformIcon = PLATFORM_ICONS[post.platform];
              return (
                <div key={post.id} className="content-row">
                  {post.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.imageUrl} alt="" className="content-row-thumb" />
                  ) : (
                    <div className={`content-row-platform platform-${post.platform}`}>
                      <PlatformIcon size={18} />
                    </div>
                  )}
                  <div className="content-row-body">
                    <div className="content-row-title">{post.title}</div>
                    <div className="content-row-meta">
                      {friendlyDate(post.date)} · {PLATFORM_LABELS[post.platform]}
                    </div>
                  </div>
                  <span className={`badge badge-${post.status}`}>
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
