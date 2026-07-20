"use client";

import { useState } from "react";
import { BellIcon, CalendarIcon } from "@/components/icons";
import type { ScheduledPost } from "@/lib/store";

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  google: "Google Business",
};

function friendlyTime(time?: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function NotificationBell({ posts }: { posts: ScheduledPost[] }) {
  const [open, setOpen] = useState(false);

  const todayKey = new Date().toISOString().split("T")[0];
  const todayPosts = posts.filter(
    (p) => p.date === todayKey && p.status === "scheduled"
  );
  const count = todayPosts.length;

  return (
    <div style={{ position: "relative" }}>
      <button
        className="notification-bell"
        onClick={() => setOpen(!open)}
        aria-label={`${count} notifications`}
        aria-expanded={open}
      >
        <BellIcon size={20} />
        {count > 0 && <span className="notification-badge">{count}</span>}
      </button>

      {open && (
        <>
          <div
            className="org-switcher-backdrop"
            onClick={() => setOpen(false)}
          />
          <div className="notification-panel">
            <div className="notification-panel-header">
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                Today&apos;s Posts
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--text-faint)",
                  fontWeight: 600,
                }}
              >
                {new Date().toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {todayPosts.length === 0 ? (
              <div className="notification-empty">
                <CalendarIcon size={20} />
                <span>No posts scheduled for today</span>
              </div>
            ) : (
              <div className="notification-list">
                {todayPosts.map((post) => (
                  <div key={post.id} className="notification-item">
                    <div
                      className={`notification-dot platform-dot-${post.platform}`}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="notification-item-title">
                        {post.title}
                      </div>
                      <div className="notification-item-meta">
                        {PLATFORM_LABELS[post.platform]}
                        {post.time ? ` · ${friendlyTime(post.time)}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
