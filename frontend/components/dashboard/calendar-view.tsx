"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  InstagramIcon,
  FacebookIcon,
  GoogleIcon,
  TwitterXIcon,
  SendIcon,
  CopyIcon,
  SparklesIcon,
} from "@/components/icons";
import { useToast } from "@/components/toast";
import {
  newId,
  toDateKey,
  type Platform,
  type ScheduledPost,
} from "@/lib/store";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PLATFORM_META: Record<Platform, { icon: typeof InstagramIcon; label: string }> = {
  instagram: { icon: InstagramIcon, label: "Instagram" },
  facebook: { icon: FacebookIcon, label: "Facebook" },
  x: { icon: TwitterXIcon, label: "X" },
  google: { icon: GoogleIcon, label: "Google" },
};

type ViewMode = "month" | "week" | "list";

interface DayCell {
  key: string;
  dayNum: number;
  inMonth: boolean;
  isToday: boolean;
  date: Date;
}

function buildMonth(year: number, month: number): DayCell[] {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  const todayKey = toDateKey(new Date());

  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({
      key: toDateKey(d),
      dayNum: d.getDate(),
      inMonth: d.getMonth() === month,
      isToday: toDateKey(d) === todayKey,
      date: d,
    });
  }
  return cells.slice(35).every((c) => !c.inMonth) ? cells.slice(0, 35) : cells;
}

function buildWeek(year: number, month: number, day: number): DayCell[] {
  const current = new Date(year, month, day);
  const start = new Date(current);
  start.setDate(current.getDate() - current.getDay());
  const todayKey = toDateKey(new Date());

  const cells: DayCell[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({
      key: toDateKey(d),
      dayNum: d.getDate(),
      inMonth: d.getMonth() === month,
      isToday: toDateKey(d) === todayKey,
      date: d,
    });
  }
  return cells;
}

function PostDetailDrawer({
  post,
  onClose,
  onRemove,
  onEdit,
}: {
  post: ScheduledPost;
  onClose: () => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, updates: Partial<ScheduledPost>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption || "");
  const [editTime, setEditTime] = useState(post.time || "");
  const toast = useToast();
  const PlatformIcon = PLATFORM_META[post.platform]?.icon;
  const platformLabel = PLATFORM_META[post.platform]?.label || post.platform;

  const displayDate = (() => {
    try {
      return new Date(post.date + "T00:00:00").toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return post.date;
    }
  })();

  const handleSave = () => {
    onEdit(post.id, { caption: editCaption, time: editTime || undefined });
    setEditing(false);
    toast("Post updated");
  };

  const handleSchedule = () => {
    const scheduledTime = editTime || post.time || "17:00";
    onEdit(post.id, { status: "scheduled", time: scheduledTime });
    setEditTime(scheduledTime);
    toast("Post scheduled");
  };

  return (
    <>
      <div className="rep-drawer-overlay" onClick={onClose} />
      <div className="rep-drawer" style={{ width: 480 }}>
        <div className="rep-drawer-header">
          <h2>Post Details</h2>
          <button
            className="btn btn-secondary"
            style={{ padding: "6px 14px" }}
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="rep-drawer-body">
          {/* Platform & Status Banner */}
          <div className="cal-detail-banner">
            <div className="cal-detail-platform">
              {PlatformIcon && (
                <span className={`content-row-platform platform-${post.platform}`} style={{ width: 36, height: 36, borderRadius: 10 }}>
                  <PlatformIcon size={18} />
                </span>
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{platformLabel}</div>
                <div style={{ fontSize: 12, color: "var(--text-faint)" }}>{displayDate}{post.time ? ` at ${post.time}` : ""}</div>
              </div>
            </div>
            <span className={`cal-status-badge ${post.status}`}>
              {post.status === "draft" ? "Draft" : post.status === "scheduled" ? "Scheduled" : post.status}
            </span>
          </div>

          {/* Post Image */}
          {post.imageUrl && (
            <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.imageUrl} alt="Post media" style={{ width: "100%", height: "auto", display: "block", maxHeight: 300, objectFit: "cover" }} />
            </div>
          )}

          {/* Title */}
          <div className="cal-detail-section">
            <div className="cal-detail-label">Title</div>
            <div className="cal-detail-value">{post.title}</div>
          </div>

          {/* Caption */}
          <div className="cal-detail-section">
            <div className="cal-detail-label">Caption</div>
            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <textarea
                  className="rep-draft-textarea"
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  style={{ minHeight: 120 }}
                />
                <div>
                  <label className="field-label" style={{ marginBottom: 6 }}>Time</label>
                  <input
                    type="time"
                    className="input"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-accent btn-sm" onClick={handleSave}>Save Changes</button>
                  <button className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="cal-detail-value" style={{ whiteSpace: "pre-wrap" }}>
                {post.caption || <span style={{ color: "var(--text-faint)", fontStyle: "italic" }}>No caption yet — click Edit to add one</span>}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="rep-drawer-footer" style={{ display: "flex", gap: 10 }}>
          {post.status === "draft" && !editing && (
            <button className="btn btn-accent" style={{ flex: 1 }} onClick={handleSchedule}>
              <SendIcon size={14} /> Schedule post
            </button>
          )}
          {!editing && (
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditing(true)}>
              Edit Post
            </button>
          )}
          {post.caption && (
            <button
              className="btn btn-outline"
              style={{ flex: editing ? 1 : 0 }}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(post.caption);
                  toast("Caption copied");
                } catch { toast("Couldn't copy", "error"); }
              }}
            >
              <CopyIcon size={16} /> Copy
            </button>
          )}
          <button
            className="btn btn-outline"
            style={{ flex: 1, color: "#EA4335", borderColor: "rgba(234, 67, 53, 0.3)" }}
            onClick={() => { onRemove(post.id); onClose(); }}
          >
            <XIcon size={14} /> Remove
          </button>
        </div>
      </div>
    </>
  );
}

export function CalendarView({
  posts,
  onAdd,
  onRemove,
  onEdit,
}: {
  posts: ScheduledPost[];
  onAdd: (post: ScheduledPost) => void;
  onRemove: (id: string) => void;
  onEdit?: (id: string, updates: Partial<ScheduledPost>) => void;
}) {
  const now = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [day, setDay] = useState(now.getDate());
  
  const [composing, setComposing] = useState<string | null>(null); // date key
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [time, setTime] = useState("17:00");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [dailyModalDate, setDailyModalDate] = useState<string | null>(null);
  
  const toast = useToast();

  const cells = useMemo(() => {
    if (viewMode === "month") {
      return buildMonth(year, month);
    } else if (viewMode === "week") {
      return buildWeek(year, month, day);
    }
    return [];
  }, [viewMode, year, month, day]);

  const byDate = useMemo(() => {
    const map = new Map<string, ScheduledPost[]>();
    for (const p of posts) {
      const list = map.get(p.date) ?? [];
      list.push(p);
      map.set(p.date, list);
    }
    return map;
  }, [posts]);

  const move = (delta: number) => {
    if (viewMode === "month") {
      const d = new Date(year, month + delta, 1);
      setYear(d.getFullYear());
      setMonth(d.getMonth());
    } else if (viewMode === "week") {
      const d = new Date(year, month, day + (delta * 7));
      setYear(d.getFullYear());
      setMonth(d.getMonth());
      setDay(d.getDate());
    }
  };

  const goToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setDay(now.getDate());
  };

  const submit = () => {
    if (!composing || title.trim().length < 3) return;
    onAdd({
      id: newId(),
      date: composing,
      time,
      platform,
      title: title.trim(),
      caption: caption.trim(),
      status: "draft",
    });
    toast("Draft added to your calendar");
    setComposing(null);
    setTitle("");
    setCaption("");
    setTime("17:00");
  };

  const handleEditPost = (id: string, updates: Partial<ScheduledPost>) => {
    if (onEdit) {
      onEdit(id, updates);
    }
    if (selectedPost && selectedPost.id === id) {
      setSelectedPost({ ...selectedPost, ...updates });
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, postId: string) => {
    e.dataTransfer.setData("postId", postId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetDateKey: string) => {
    e.preventDefault();
    const postId = e.dataTransfer.getData("postId");
    if (postId && onEdit) {
      onEdit(postId, { date: targetDateKey });
      toast("Post rescheduled");
    }
  };

  // Stats
  const totalPosts = posts.length;
  const scheduledCount = posts.filter(p => p.status === "scheduled").length;
  const draftCount = posts.filter(p => p.status === "draft").length;

  const currentLabel = useMemo(() => {
    if (viewMode === "month" || viewMode === "list") {
      return new Date(year, month, 1).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      });
    } else {
      const weekStart = new Date(year, month, day);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const startStr = weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      const endStr = weekEnd.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
      return `${startStr} – ${endStr}`;
    }
  }, [viewMode, year, month, day]);

  return (
    <>
      <header className="app-page-header">
        <div>
          <h1 className="app-page-title">Content Calendar</h1>
          <p className="app-page-subtitle">{currentLabel} · click any day to add a draft</p>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          
          <div className="view-toggle">
            <button className={`view-toggle-btn ${viewMode === "month" ? "active" : ""}`} onClick={() => setViewMode("month")}>Month</button>
            <button className={`view-toggle-btn ${viewMode === "week" ? "active" : ""}`} onClick={() => setViewMode("week")}>Week</button>
            <button className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>List</button>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="icon-btn" onClick={() => move(-1)} aria-label="Previous">
              <ChevronLeftIcon size={18} />
            </button>
            <button className="btn btn-outline" onClick={goToday}>
              Today
            </button>
            <button className="icon-btn" onClick={() => move(1)} aria-label="Next">
              <ChevronRightIcon size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Calendar Stats */}
      <div className="cal-stats-row">
        <div className="cal-stat-pill">
          <span className="cal-stat-num">{totalPosts}</span>
          <span className="cal-stat-label">Total Posts</span>
        </div>
        <div className="cal-stat-pill">
          <SendIcon size={14} />
          <span className="cal-stat-num">{scheduledCount}</span>
          <span className="cal-stat-label">Scheduled</span>
        </div>
        <div className="cal-stat-pill draft">
          <SparklesIcon size={14} />
          <span className="cal-stat-num">{draftCount}</span>
          <span className="cal-stat-label">Drafts</span>
        </div>
      </div>

      {(viewMode === "month" || viewMode === "week") && (
        <div className="calendar-card">
          <div className="calendar-weekdays" style={viewMode === "week" ? { display: 'flex' } : {}}>
            {WEEKDAYS.map((d) => (
              <div key={d} className="calendar-weekday" style={viewMode === "week" ? { flex: 1 } : {}}>
                {d}
              </div>
            ))}
          </div>
          <div className="calendar-grid" style={viewMode === "week" ? { display: 'flex', minHeight: 600 } : {}}>
            {cells.map((cell) => {
              const dayPosts = byDate.get(cell.key) ?? [];
              // In week view, we show all. In month view, we truncate.
              const maxDisplay = viewMode === "week" ? 99 : 2;
              const displayPosts = dayPosts.slice(0, maxDisplay);
              const overflowCount = dayPosts.length - maxDisplay;

              return (
                <div
                  key={cell.key}
                  className={`calendar-day ${cell.inMonth ? "" : "outside"} ${cell.isToday ? "today" : ""} ${dayPosts.length > 0 ? "has-posts" : ""}`}
                  style={viewMode === "week" ? { flex: 1, minHeight: 600 } : {}}
                  onClick={() => setComposing(cell.key)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, cell.key)}
                  aria-label={`Add post on ${cell.key}`}
                >
                  <span className="calendar-day-num">
                    {cell.dayNum}
                    {dayPosts.length > 0 && viewMode === "month" && (
                      <span className="cal-day-count">{dayPosts.length}</span>
                    )}
                  </span>
                  {displayPosts.map((post) => {
                    const PIcon = PLATFORM_META[post.platform]?.icon;
                    return (
                      <div
                        key={post.id}
                        className={`calendar-event platform-pill-${post.platform} ${post.status === "draft" ? "draft" : ""}`}
                        title={`${post.title}${post.status === "draft" ? " (draft)" : ""}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, post.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPost(post);
                        }}
                      >
                        {PIcon && <PIcon size={10} />}
                        {post.title}
                      </div>
                    );
                  })}
                  {overflowCount > 0 && (
                    <div 
                      className="calendar-event-more"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDailyModalDate(cell.key);
                      }}
                    >
                      +{overflowCount} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === "list" && (
        <div className="calendar-list-view">
          {posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No posts scheduled yet.</div>
          ) : (
            [...posts].sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || "")).map((post) => {
              const PIcon = PLATFORM_META[post.platform]?.icon;
              return (
                <div 
                  key={post.id} 
                  className="cal-list-item"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="cal-list-date">
                    {new Date(post.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <div className="cal-list-time">{post.time}</div>
                  <div className={`cal-list-platform platform-color-${post.platform}`}>
                    {PIcon && <PIcon size={14} />} {PLATFORM_META[post.platform]?.label}
                  </div>
                  <div className="cal-list-title">{post.title}</div>
                  <div className={`cal-list-status ${post.status}`}>
                    {post.status}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Compose Modal */}
      {composing && (
        <div className="modal-overlay" onClick={() => setComposing(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="compose-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title" id="compose-title">
                New post ·{" "}
                {new Date(composing + "T00:00:00").toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </h2>
              <button className="icon-btn" onClick={() => setComposing(null)} aria-label="Close">
                <XIcon size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="field">
                <label className="field-label" htmlFor="compose-input">
                  What&apos;s the post about?
                </label>
                <input
                  id="compose-input"
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="e.g. Weekend brunch menu drop"
                  autoFocus
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="compose-caption">
                  Caption (optional)
                </label>
                <textarea
                  id="compose-caption"
                  className="textarea"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption or leave blank to AI-generate later..."
                  style={{ minHeight: 80 }}
                />
              </div>

              <div style={{ display: "flex", gap: 20 }}>
                <div className="field" style={{ flex: 1 }}>
                  <span className="field-label">Platform</span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(["instagram", "facebook", "x", "google"] as Platform[]).map((p) => {
                      const PIcon = PLATFORM_META[p].icon;
                      return (
                        <button
                          key={p}
                          className={`chip ${platform === p ? "selected" : ""}`}
                          onClick={() => setPlatform(p)}
                          aria-pressed={platform === p}
                        >
                          <PIcon size={14} />
                          {PLATFORM_META[p].label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="compose-time">
                  Time
                </label>
                <input
                  id="compose-time"
                  type="time"
                  className="input"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  style={{ maxWidth: 160 }}
                />
              </div>

              {(byDate.get(composing) ?? []).length > 0 && (
                <div className="field">
                  <span className="field-label">Already planned this day</span>
                  {(byDate.get(composing) ?? []).map((post) => {
                    const PIcon = PLATFORM_META[post.platform]?.icon;
                    return (
                      <div key={post.id} className="content-row" style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                          {PIcon && (
                            <span className={`content-row-platform platform-${post.platform}`} style={{ width: 24, height: 24, borderRadius: 6 }}>
                              <PIcon size={12} />
                            </span>
                          )}
                          <div className="content-row-body">
                            <div className="content-row-title" style={{ fontSize: 14 }}>
                              {post.title}
                            </div>
                            {post.time && (
                              <div style={{ fontSize: 11, color: "var(--text-faint)" }}>at {post.time}</div>
                            )}
                          </div>
                        </div>
                        <button
                          className="icon-btn"
                          style={{ width: 32, height: 32 }}
                          onClick={() => onRemove(post.id)}
                          aria-label={`Remove ${post.title}`}
                        >
                          <XIcon size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                className="btn btn-accent"
                onClick={submit}
                disabled={title.trim().length < 3}
                style={{ opacity: title.trim().length < 3 ? 0.5 : 1 }}
              >
                Add draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Overflow Modal */}
      {dailyModalDate && (
        <div className="modal-overlay" onClick={() => setDailyModalDate(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                Posts for {new Date(dailyModalDate + "T00:00:00").toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </h2>
              <button className="icon-btn" onClick={() => setDailyModalDate(null)} aria-label="Close">
                <XIcon size={18} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(byDate.get(dailyModalDate) ?? []).map((post) => {
                const PIcon = PLATFORM_META[post.platform]?.icon;
                return (
                  <div 
                    key={post.id} 
                    className="content-row" 
                    style={{ padding: "16px", cursor: "pointer" }}
                    onClick={() => {
                      setDailyModalDate(null);
                      setSelectedPost(post);
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
                      {PIcon && (
                        <span className={`content-row-platform platform-${post.platform}`} style={{ width: 36, height: 36, borderRadius: 10 }}>
                          <PIcon size={18} />
                        </span>
                      )}
                      <div className="content-row-body">
                        <div className="content-row-title" style={{ fontSize: 15 }}>
                          {post.title}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                          <span>{PLATFORM_META[post.platform]?.label}</span>
                          {post.time && <span>• {post.time}</span>}
                          <span className={`cal-status-badge ${post.status}`} style={{ padding: "2px 8px", fontSize: 10 }}>
                            {post.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRightIcon size={18} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Drawer */}
      {selectedPost && (
        <PostDetailDrawer
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onRemove={onRemove}
          onEdit={handleEditPost}
        />
      )}
    </>
  );
}
