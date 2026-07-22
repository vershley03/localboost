"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { useState } from "react";
import type { CompetitorInsight } from "@/lib/store";

interface InsightCardProps {
  insight: CompetitorInsight;
  onGenerateMine: () => void;
  onDismiss: () => void;
}

const INSIGHT_EMOJI: Record<CompetitorInsight["type"], string> = {
  gap: "🔥",
  timing: "⏰",
  format: "🎬",
  hashtag: "#️⃣",
  spike: "📈",
};

export function InsightCard({
  insight,
  onGenerateMine,
  onDismiss,
}: InsightCardProps) {
  const [currentEvidenceIdx, setCurrentEvidenceIdx] = useState(0);
  const currentEvidence = insight.evidence[currentEvidenceIdx];

  const handleNextEvidence = () => {
    setCurrentEvidenceIdx((prev) => (prev + 1) % insight.evidence.length);
  };

  const handlePrevEvidence = () => {
    setCurrentEvidenceIdx((prev) =>
      prev === 0 ? insight.evidence.length - 1 : prev - 1
    );
  };

  const priorityColor =
    insight.priority === "high"
      ? "var(--error, #EF4444)"
      : insight.priority === "medium"
        ? "var(--warning, #F59E0B)"
        : "var(--success, #10B981)";

  return (
    <div className="insight-card">
      {/* Priority bar */}
      <div
        className="insight-priority-bar"
        style={{ backgroundColor: priorityColor }}
        title={`${insight.priority} priority`}
      />

      {/* Header with emoji badge */}
      <div className="insight-card-header">
        <div className="insight-type-badge">
          {INSIGHT_EMOJI[insight.type]}
        </div>
        <div className="insight-title">{insight.title}</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "11px",
            color: "var(--text-faint)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            padding: "4px 10px",
            background: "var(--bg-base)",
            borderRadius: "8px",
          }}
        >
          <span>{insight.priority}</span>
        </div>
      </div>

      {/* Body text */}
      <div className="insight-body">{insight.body}</div>

      {/* Evidence carousel */}
      {insight.evidence.length > 0 && (
        <div className="insight-evidence">
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", marginBottom: "10px", letterSpacing: "0.06em" }}>
            EVIDENCE ({currentEvidenceIdx + 1}/{insight.evidence.length})
          </div>
          <div className="evidence-carousel">
            {insight.evidence.length > 1 && (
              <button
                onClick={handlePrevEvidence}
                className="carousel-nav carousel-prev"
                aria-label="Previous evidence"
              >
                <ChevronLeftIcon size={16} />
              </button>
            )}

            <div className="evidence-item">
              {currentEvidence.imageUrl && (
                <img
                  src={currentEvidence.imageUrl}
                  alt="post evidence"
                  style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "10px", marginBottom: "10px" }}
                />
              )}
              <div className="evidence-caption">
                <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                  {currentEvidence.caption.slice(0, 100)}...
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    marginTop: "4px",
                  }}
                >
                  ❤️ {currentEvidence.likeCount.toLocaleString()} likes
                </div>
              </div>
            </div>

            {insight.evidence.length > 1 && (
              <button
                onClick={handleNextEvidence}
                className="carousel-nav carousel-next"
                aria-label="Next evidence"
              >
                <ChevronRightIcon size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="insight-ctas">
        {insight.status === "new" && (
          <button
            onClick={onGenerateMine}
            className="btn-generate-mine"
          >
            Generate my version
          </button>
        )}

        {insight.status === "acted" && (
          <div
            style={{
              fontSize: "12px",
              color: "var(--success, #10B981)",
              fontWeight: "600",
            }}
          >
            ✓ Acting on this insight
          </div>
        )}

        {insight.status === "new" && (
          <button
            onClick={onDismiss}
            className="btn-dismiss"
          >
            Not now
          </button>
        )}

        {insight.status === "dismissed" && (
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
            }}
          >
            Dismissed
          </div>
        )}
      </div>
    </div>
  );
}
