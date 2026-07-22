"use client";

import type { TrackedCompetitor, CompetitorPostLocal } from "@/lib/store";

interface ShareOfVoiceProps {
  competitors: TrackedCompetitor[];
  allPosts: CompetitorPostLocal[];
  businessName?: string;
  yourAvgLikes?: number;
}

export function ShareOfVoice({
  competitors,
  allPosts,
  businessName = "Your Business",
  yourAvgLikes = 45,
}: ShareOfVoiceProps) {
  // Calculate engagement share for visualization
  const competitorAvgEngagement = competitors.reduce((acc, c) => acc + c.avgLikes, 0) / Math.max(competitors.length, 1);
  
  const total = yourAvgLikes + competitorAvgEngagement;
  const yourShare = (yourAvgLikes / total) * 100;
  const competitorShare = (competitorAvgEngagement / total) * 100;

  const topCompetitor = competitors.reduce((max, c) =>
    c.avgLikes > max.avgLikes ? c : max
  );

  return (
    <div className="share-of-voice">
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px", color: "var(--text-primary)" }}>
          Share of Voice (Avg Engagement)
        </h3>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Based on recent competitor posts
        </p>
      </div>

      {/* Horizontal bar chart */}
      <div className="sov-chart">
        <div className="sov-bar-container">
          <div
            className="sov-bar-segment sov-your-business"
            style={{ width: `${yourShare}%` }}
            title={`${businessName}: ${yourAvgLikes} avg likes`}
          >
            {yourShare > 15 && (
              <span className="sov-bar-label">{Math.round(yourShare)}%</span>
            )}
          </div>
          <div
            className="sov-bar-segment sov-competitors"
            style={{ width: `${competitorShare}%` }}
            title={`Competitors: ${Math.round(competitorAvgEngagement)} avg likes`}
          >
            {competitorShare > 15 && (
              <span className="sov-bar-label">{Math.round(competitorShare)}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="sov-legend">
        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: "var(--accent)" }}
          />
          <span>{businessName}</span>
          <span style={{ marginLeft: "auto", fontWeight: "600" }}>
            {yourAvgLikes} likes
          </span>
        </div>
        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: "var(--border)" }}
          />
          <span>Competitor Avg</span>
          <span style={{ marginLeft: "auto", fontWeight: "600" }}>
            {Math.round(competitorAvgEngagement)} likes
          </span>
        </div>
      </div>

      {/* Insight callout */}
      {topCompetitor && topCompetitor.avgLikes > yourAvgLikes * 1.2 && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            background: "var(--accent-subtle)",
            borderRadius: "12px",
            fontSize: "13px",
            lineHeight: "1.6",
            color: "var(--text-muted)",
            border: "1px solid var(--border)",
          }}
        >
          <strong>💡 Insight:</strong> @{topCompetitor.username} is getting{" "}
          <strong>{Math.round((topCompetitor.avgLikes / yourAvgLikes - 1) * 100)}%</strong> more
          engagement than you. Review their insights for strategies you can adapt.
        </div>
      )}
    </div>
  );
}
