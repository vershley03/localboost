"use client";

import { useState, useRef } from "react";
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

function InteractiveSparkline({
  color,
  data,
  labels,
}: {
  color: string;
  data: number[];
  labels: string[];
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const width = 80;
  const height = 30;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - 4 - ((val - min) / range) * (height - 8);
    return { x, y, val };
  });

  const pathD = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ""
  );

  return (
    <div
      style={{
        position: "absolute",
        right: 24,
        bottom: 24,
        width: width,
        height: height,
        opacity: 0.8,
      }}
      onMouseLeave={() => setHoverIndex(null)}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: "visible" }}
      >
        <path
          d={pathD}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path d={`${pathD} L ${width} ${height} L 0 ${height} Z`} fill={color} fillOpacity="0.05" />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hoverIndex === i ? 4 : 2}
            fill={color}
            stroke="var(--bg-surface)"
            strokeWidth={1}
            onMouseEnter={() => setHoverIndex(i)}
            style={{ transition: "all 0.15s ease", cursor: "pointer" }}
          />
        ))}
      </svg>
      {hoverIndex !== null && (
        <div
          style={{
            position: "absolute",
            bottom: "120%",
            left: `${(hoverIndex / (data.length - 1)) * 100}%`,
            transform: "translateX(-50%)",
            background: "var(--text-primary)",
            color: "var(--bg-surface)",
            padding: "4px 8px",
            borderRadius: "6px",
            fontSize: "10px",
            fontWeight: 700,
            whiteSpace: "nowrap",
            zIndex: 50,
            boxShadow: "var(--shadow-sm)",
            pointerEvents: "none",
          }}
        >
          {labels[hoverIndex]}: {points[hoverIndex].val}
        </div>
      )}
    </div>
  );
}

// Data for Timeframes
const TIMEFRAME_DATA = {
  "7d": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    organic: [150, 220, 180, 280, 240, 310, 350],
    paid: [80, 120, 100, 150, 110, 180, 210],
  },
  "30d": {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    organic: [800, 1200, 1100, 1500],
    paid: [400, 600, 500, 750],
  },
  "90d": {
    labels: ["May", "June", "July"],
    organic: [3400, 4200, 4900],
    paid: [1800, 2100, 2400],
  },
};

export function Overview({
  posts,
  generationCount,
  businessName,
  onNavigate,
  userName = "Sarah",
}: {
  posts: ScheduledPost[];
  generationCount: number;
  businessName: string;
  onNavigate: (tab: TabId) => void;
  userName?: string;
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

  // State for Engagement Chart
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("7d");
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartHoverIndex, setChartHoverIndex] = useState<number | null>(null);
  const [chartTooltipPos, setChartTooltipPos] = useState({ x: 0, y: 0 });

  const currentData = TIMEFRAME_DATA[timeframe];

  // Helper to handle mouse tracking on engagement SVG
  const handleChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartContainerRef.current) return;
    const rect = chartContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const idx = Math.round(pct * (currentData.labels.length - 1));

    setChartHoverIndex(idx);
    setChartTooltipPos({
      x: (idx / (currentData.labels.length - 1)) * rect.width,
      y: e.clientY - rect.top - 80,
    });
  };

  // Convert data values to SVG coordinates (width=800, height=200)
  const getSvgPath = (values: number[]) => {
    const maxVal = Math.max(...values, 100);
    const points = values.map((val, i) => {
      const x = (i / (values.length - 1)) * 800;
      const y = 180 - (val / maxVal) * 140; // keep it within y=[40, 180]
      return { x, y };
    });
    return points.reduce(
      (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
      ""
    );
  };

  const organicPath = getSvgPath(currentData.organic);
  const paidPath = getSvgPath(currentData.paid);

  return (
    <>
      <header className="app-page-header">
        <div>
          <h1 className="app-page-title">
            {greeting}, {userName}
          </h1>
          <p className="app-page-subtitle">Here&apos;s how {businessName} is doing today.</p>
        </div>
        <button className="btn btn-accent" onClick={() => onNavigate("creator")}>
          <PlusIcon size={16} />
          New Campaign
        </button>
      </header>

      <div className="stat-grid">
        <div className="stat-tile" style={{ position: "relative" }}>
          <div className="stat-tile-header">
            <div className="stat-tile-icon blue">
              <SparklesIcon size={17} />
            </div>
            AI Generations
          </div>
          <div className="stat-tile-value">{124 + generationCount}</div>
          <div className="stat-tile-note positive">+12% this week</div>
          <InteractiveSparkline
            color="var(--accent)"
            data={[14, 19, 23, 22, 28, 32, 124 + generationCount]}
            labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
          />
        </div>

        <div className="stat-tile" style={{ position: "relative" }}>
          <div className="stat-tile-header">
            <div className="stat-tile-icon coral">
              <UsersIcon size={17} />
            </div>
            Audience Reached
          </div>
          <div className="stat-tile-value">4.2k</div>
          <div className="stat-tile-note positive">+800 new views</div>
          <InteractiveSparkline
            color="var(--coral)"
            data={[3100, 3300, 3500, 3400, 3800, 4000, 4200]}
            labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
          />
        </div>

        <div className="stat-tile" style={{ position: "relative" }}>
          <div className="stat-tile-header">
            <div className="stat-tile-icon violet">
              <TrendingUpIcon size={17} />
            </div>
            Scheduled Posts
          </div>
          <div className="stat-tile-value">{scheduledCount}</div>
          <div className="stat-tile-note">Across all platforms</div>
          <InteractiveSparkline
            color="var(--violet)"
            data={[1, 3, 2, 4, 3, 2, scheduledCount]}
            labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
          />
        </div>
      </div>

      <section className="card card-lg" style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <h2 className="card-title" style={{ margin: 0 }}>
            Audience Engagement
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Timeframe selector */}
            <div
              style={{
                display: "flex",
                background: "var(--bg-base)",
                padding: 4,
                borderRadius: 8,
                border: "1px solid var(--border)",
              }}
            >
              {(["7d", "30d", "90d"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTimeframe(t);
                    setChartHoverIndex(null);
                  }}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    border: "none",
                    background: timeframe === t ? "var(--bg-surface)" : "transparent",
                    color: timeframe === t ? "var(--text-primary)" : "var(--text-muted)",
                    cursor: "pointer",
                    boxShadow: timeframe === t ? "var(--shadow-sm)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {t === "7d" ? "7 Days" : t === "30d" ? "30 Days" : "90 Days"}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{ width: 8, height: 8, borderRadius: 4, background: "var(--accent)" }}
                ></span>
                Organic
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--violet)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{ width: 8, height: 8, borderRadius: 4, background: "var(--violet)" }}
                ></span>
                Paid
              </span>
            </div>
          </div>
        </div>

        <div
          ref={chartContainerRef}
          style={{ position: "relative", height: 200, width: "100%" }}
          onMouseLeave={() => setChartHoverIndex(null)}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
            onMouseMove={handleChartMouseMove}
            style={{ overflow: "visible", cursor: "pointer" }}
          >
            {/* Grid lines */}
            <line x1="0" y1="50" x2="800" y2="50" stroke="var(--border)" strokeDasharray="4 4" />
            <line x1="0" y1="100" x2="800" y2="100" stroke="var(--border)" strokeDasharray="4 4" />
            <line x1="0" y1="150" x2="800" y2="150" stroke="var(--border)" strokeDasharray="4 4" />

            {/* Paid Area */}
            <path
              d={`${paidPath} L 800 200 L 0 200 Z`}
              fill="var(--violet)"
              fillOpacity="0.08"
            />
            <path
              d={paidPath}
              stroke="var(--violet)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Organic Area */}
            <path
              d={`${organicPath} L 800 200 L 0 200 Z`}
              fill="url(#organicGrad)"
              fillOpacity="0.15"
            />
            <path
              d={organicPath}
              stroke="var(--accent)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Vertical Guide Line */}
            {chartHoverIndex !== null && (
              <line
                x1={(chartHoverIndex / (currentData.labels.length - 1)) * 800}
                y1="10"
                x2={(chartHoverIndex / (currentData.labels.length - 1)) * 800}
                y2="200"
                stroke="var(--text-muted)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            )}

            <defs>
              <linearGradient id="organicGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Interactive Tooltip */}
          {chartHoverIndex !== null && (
            <div
              style={{
                position: "absolute",
                left: `${chartTooltipPos.x}px`,
                top: `${chartTooltipPos.y}px`,
                transform: "translateX(-50%)",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-md)",
                borderRadius: 8,
                padding: "8px 12px",
                pointerEvents: "none",
                zIndex: 40,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)" }}>
                {currentData.labels[chartHoverIndex]}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--accent)",
                  }}
                />
                <span style={{ fontWeight: 600, color: "var(--text-muted)" }}>Organic:</span>
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                  {currentData.organic[chartHoverIndex].toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--violet)",
                  }}
                />
                <span style={{ fontWeight: 600, color: "var(--text-muted)" }}>Paid:</span>
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                  {currentData.paid[chartHoverIndex].toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 8,
              color: "var(--text-faint)",
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {currentData.labels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="card card-lg">
        <h2 className="card-title">Upcoming Content</h2>
        {upcoming.length === 0 ? (
          <div className="empty-state" style={{ padding: "64px 24px" }}>
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              style={{ marginBottom: 24 }}
            >
              <rect
                x="20"
                y="30"
                width="80"
                height="70"
                rx="12"
                fill="var(--bg-secondary)"
                stroke="var(--border)"
                strokeWidth="4"
              />
              <path
                d="M40 20 L40 40 M80 20 L80 40"
                stroke="var(--accent)"
                strokeWidth="6"
                strokeLinecap="round"
              />
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
