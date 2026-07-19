"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
} from "@/components/icons";
import { useToast } from "@/components/toast";
import {
  newId,
  toDateKey,
  type Platform,
  type ScheduledPost,
} from "@/lib/store";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DayCell {
  key: string;
  dayNum: number;
  inMonth: boolean;
  isToday: boolean;
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
    });
  }
  // Drop a trailing all-outside week to keep the grid tight.
  return cells.slice(35).every((c) => !c.inMonth) ? cells.slice(0, 35) : cells;
}

export function CalendarView({
  posts,
  onAdd,
  onRemove,
}: {
  posts: ScheduledPost[];
  onAdd: (post: ScheduledPost) => void;
  onRemove: (id: string) => void;
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [composing, setComposing] = useState<string | null>(null); // date key
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const toast = useToast();

  const cells = useMemo(() => buildMonth(year, month), [year, month]);

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
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const goToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  };

  const submit = () => {
    if (!composing || title.trim().length < 3) return;
    onAdd({
      id: newId(),
      date: composing,
      platform,
      title: title.trim(),
      caption: "",
      status: "draft",
    });
    toast("Draft added to your calendar");
    setComposing(null);
    setTitle("");
  };

  const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <header className="app-page-header">
        <div>
          <h1 className="app-page-title">Content Calendar</h1>
          <p className="app-page-subtitle">{monthLabel} · click any day to add a draft</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="icon-btn" onClick={() => move(-1)} aria-label="Previous month">
            <ChevronLeftIcon size={18} />
          </button>
          <button className="btn btn-outline" onClick={goToday}>
            Today
          </button>
          <button className="icon-btn" onClick={() => move(1)} aria-label="Next month">
            <ChevronRightIcon size={18} />
          </button>
        </div>
      </header>

      <div className="calendar-card">
        <div className="calendar-weekdays">
          {WEEKDAYS.map((d) => (
            <div key={d} className="calendar-weekday">
              {d}
            </div>
          ))}
        </div>
        <div className="calendar-grid">
          {cells.map((cell) => (
            <button
              key={cell.key}
              className={`calendar-day ${cell.inMonth ? "" : "outside"} ${cell.isToday ? "today" : ""}`}
              onClick={() => setComposing(cell.key)}
              aria-label={`Add post on ${cell.key}`}
            >
              <span className="calendar-day-num">{cell.dayNum}</span>
              {(byDate.get(cell.key) ?? []).slice(0, 3).map((post) => (
                <span
                  key={post.id}
                  className={`calendar-event ${post.platform} ${post.status === "draft" ? "draft" : ""}`}
                  title={`${post.title}${post.status === "draft" ? " (draft)" : ""}`}
                >
                  {post.title}
                </span>
              ))}
            </button>
          ))}
        </div>
      </div>

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
                <span className="field-label">Platform</span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(["instagram", "facebook", "google"] as Platform[]).map((p) => (
                    <button
                      key={p}
                      className={`chip ${platform === p ? "selected" : ""}`}
                      onClick={() => setPlatform(p)}
                      aria-pressed={platform === p}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {(byDate.get(composing) ?? []).length > 0 && (
                <div className="field">
                  <span className="field-label">Already planned this day</span>
                  {(byDate.get(composing) ?? []).map((post) => (
                    <div key={post.id} className="content-row" style={{ padding: "10px 14px" }}>
                      <div className="content-row-body">
                        <div className="content-row-title" style={{ fontSize: 14 }}>
                          {post.title}
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
                  ))}
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
    </>
  );
}
