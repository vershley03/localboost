"use client";

import { useState } from "react";
import {
  CalendarIcon,
  FacebookIcon,
  GoogleIcon,
  InstagramIcon,
  PlugIcon,
  PlusIcon,
  SparklesIcon,
  StarIcon,
  TwitterXIcon,
} from "@/components/icons";
import { getMockReviews, type Connections, type Platform, type ScheduledPost } from "@/lib/store";
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

const COVERAGE_DAYS = 14;

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

function dateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * A stat that a marketer can act on, derived from data this workspace actually
 * holds. Every tile is a link into the workflow that changes the number.
 */
function StatTile({
  icon,
  tone,
  label,
  value,
  note,
  noteTone,
  onClick,
}: {
  icon: React.ReactNode;
  tone: "blue" | "coral" | "violet" | "sage";
  label: string;
  value: string | number;
  note: string;
  noteTone?: "warn" | "positive";
  onClick: () => void;
}) {
  return (
    <button className="stat-tile stat-tile-action" onClick={onClick}>
      <div className="stat-tile-header">
        <div className={`stat-tile-icon ${tone}`}>{icon}</div>
        {label}
      </div>
      <div className="stat-tile-value">{value}</div>
      <div className={`stat-tile-note ${noteTone ?? ""}`}>{note}</div>
    </button>
  );
}

export function Overview({
  posts,
  connections,
  orgId,
  businessName,
  onNavigate,
  userName,
}: {
  posts: ScheduledPost[];
  connections: Connections;
  orgId: string;
  businessName: string;
  onNavigate: (tab: TabId) => void;
  userName?: string;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = dateKey(today);

  // Reviews live in localStorage and only change on the Reputation tab, which
  // remounts this view on return — reading once at mount is enough.
  const [unansweredReviews] = useState(
    () => getMockReviews(orgId).filter((r) => r.status === "unanswered").length,
  );

  const upcoming = posts
    .filter((p) => p.date >= todayKey)
    .sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")))
    .slice(0, 5);

  // Coverage: how many of the next 14 days have something planned.
  const coverage = Array.from({ length: COVERAGE_DAYS }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const key = dateKey(d);
    return {
      key,
      count: posts.filter((p) => p.date === key).length,
      label: d.toLocaleDateString(undefined, { weekday: "narrow" }),
      isToday: i === 0,
    };
  });

  const coveredDays = coverage.filter((d) => d.count > 0).length;
  const emptyDays = COVERAGE_DAYS - coveredDays;
  const busiest = Math.max(1, ...coverage.map((d) => d.count));

  const draftCount = posts.filter((p) => p.status === "draft").length;
  const connectedCount = Object.values(connections).filter(Boolean).length;
  const totalChannels = Object.keys(connections).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <header className="app-page-header">
        <div>
          <h1 className="app-page-title">
            {greeting}
            {userName ? `, ${userName}` : ""}
          </h1>
          <p className="app-page-subtitle">
            {coveredDays > 0
              ? `${businessName} has content planned for ${coveredDays} of the next 14 days.`
              : `${businessName} has nothing planned yet — let's fix that.`}
          </p>
        </div>
        <button className="btn btn-accent" onClick={() => onNavigate("creator")}>
          <PlusIcon size={16} />
          New Post
        </button>
      </header>

      <div className="stat-grid cols-4">
        <StatTile
          icon={<CalendarIcon size={17} />}
          tone="blue"
          label="Days covered"
          value={`${coveredDays}/${COVERAGE_DAYS}`}
          note={
            emptyDays === 0
              ? "Next two weeks are fully planned"
              : `${emptyDays} ${emptyDays === 1 ? "day has" : "days have"} nothing planned`
          }
          noteTone={emptyDays === 0 ? "positive" : emptyDays > 7 ? "warn" : undefined}
          onClick={() => onNavigate("calendar")}
        />

        <StatTile
          icon={<SparklesIcon size={17} />}
          tone="violet"
          label="Drafts to review"
          value={draftCount}
          note={draftCount === 0 ? "Nothing waiting on you" : "Review and schedule them"}
          onClick={() => onNavigate(draftCount === 0 ? "creator" : "calendar")}
        />

        <StatTile
          icon={<StarIcon size={17} />}
          tone="coral"
          label="Reviews to answer"
          value={unansweredReviews}
          note={unansweredReviews === 0 ? "All caught up" : "Unanswered customer reviews"}
          noteTone={unansweredReviews === 0 ? "positive" : unansweredReviews > 3 ? "warn" : undefined}
          onClick={() => onNavigate("reputation")}
        />

        <StatTile
          icon={<PlugIcon size={17} />}
          tone="sage"
          label="Channels connected"
          value={`${connectedCount}/${totalChannels}`}
          note={connectedCount === 0 ? "Connect one to publish" : "Manage your connections"}
          noteTone={connectedCount === 0 ? "warn" : undefined}
          onClick={() => onNavigate("integrations")}
        />
      </div>

      <section className="card card-lg" style={{ marginBottom: 24 }}>
        <h2 className="card-title">Content coverage · next 14 days</h2>
        <p className="coverage-legend" style={{ marginBottom: 20 }}>
          {emptyDays === 0
            ? "Every day is covered. Nice work."
            : `${emptyDays} ${emptyDays === 1 ? "day has" : "days have"} nothing planned — click a gap to fill it.`}
        </p>

        <div className="coverage-chart">
          {coverage.map((day) => (
            <button
              key={day.key}
              className={`coverage-day ${day.count === 0 ? "empty" : ""} ${day.isToday ? "is-today" : ""}`}
              onClick={() => onNavigate("calendar")}
              title={`${friendlyDate(day.key)} — ${day.count} ${day.count === 1 ? "post" : "posts"}`}
            >
              <span className="coverage-track">
                {day.count > 0 && (
                  <span
                    className="coverage-bar"
                    style={{ height: `${Math.max((day.count / busiest) * 100, 12)}%` }}
                  />
                )}
              </span>
              <span className="coverage-day-label">{day.isToday ? "Today" : day.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card card-lg">
        <h2 className="card-title">Upcoming Content</h2>
        {upcoming.length === 0 ? (
          <div className="empty-state" style={{ padding: "64px 24px" }}>
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style={{ marginBottom: 24 }}>
              <rect x="20" y="30" width="80" height="70" rx="12" fill="var(--bg-secondary)" stroke="var(--border)" strokeWidth="4" />
              <path d="M40 20 L40 40 M80 20 L80 40" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" />
              <rect x="30" y="50" width="60" height="40" rx="6" fill="#FFFFFF" />
              <circle cx="45" cy="70" r="5" fill="var(--violet)" />
              <path d="M100 20 Q 110 10, 115 25 T 105 35 Z" fill="var(--coral)" opacity="0.8" />
              <path d="M10 60 L 15 50 L 25 55 Z" fill="var(--accent)" opacity="0.8" />
            </svg>
            <div className="empty-state-title" style={{ fontSize: 20 }}>
              Nothing scheduled yet
            </div>
            <p style={{ maxWidth: 300, margin: "0 auto 24px", color: "var(--text-muted)" }}>
              Get ahead of your marketing. Let AI draft and schedule a week of content in minutes.
            </p>
            <button className="btn btn-accent" onClick={() => onNavigate("creator")}>
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
