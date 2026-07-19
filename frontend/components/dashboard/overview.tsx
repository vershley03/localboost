"use client";

import {
  CalendarIcon,
  FacebookIcon,
  GoogleIcon,
  InstagramIcon,
  PlusIcon,
  SparklesIcon,
  TrendingUpIcon,
  UsersIcon,
} from "@/components/icons";
import type { Platform, ScheduledPost } from "@/lib/store";
import type { TabId } from "./nav";

const PLATFORM_ICONS: Record<Platform, typeof InstagramIcon> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  google: GoogleIcon,
};

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  google: "Google Business",
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
        </div>
      </div>

      <section className="card card-lg">
        <h2 className="card-title">Upcoming Content</h2>
        {upcoming.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <CalendarIcon size={24} />
            </div>
            <div className="empty-state-title">Nothing scheduled yet</div>
            <p>Draft your first post with the Magic Creator.</p>
            <button
              className="btn btn-accent btn-sm"
              style={{ marginTop: 16 }}
              onClick={() => onNavigate("creator")}
            >
              <SparklesIcon size={14} />
              Create a post
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
