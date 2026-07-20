"use client";

import { useState, useMemo } from "react";
import {
  StarIcon,
  MessageSquareIcon,
  SparklesIcon,
  GoogleIcon,
  FacebookIcon,
  LoaderIcon,
  RefreshIcon,
} from "@/components/icons";
import { useToast } from "@/components/toast";
import {
  type BrandProfile,
  type MockReview,
  getMockReviews,
  saveMockReviews,
} from "@/lib/store";

type StatusFilter = "all" | "unanswered" | "replied";
type PlatformFilter = "all" | "google" | "facebook";

const TONE_MODIFIERS = [
  { id: "standard", label: "😊 Standard", value: "Standard Brand Voice" },
  { id: "empathic", label: "🤝 Empathic", value: "Empathic / Apologetic" },
  { id: "promo", label: "🎁 Promo", value: "Promo-driven" },
  { id: "concise", label: "⚡ Concise", value: "Concise & Short" },
];

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="rep-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <StarIcon
          key={s}
          size={size}
          color={s <= rating ? "#FBBC05" : "var(--border)"}
          style={{ fill: s <= rating ? "#FBBC05" : "transparent" }}
        />
      ))}
    </div>
  );
}

export function Reputation({
  brand,
  orgId,
}: {
  brand: BrandProfile;
  orgId: string;
}) {
  const [reviews, setReviews] = useState<MockReview[]>(() => getMockReviews(orgId));
  const [selectedReview, setSelectedReview] = useState<MockReview | null>(null);
  const [draftResponse, setDraftResponse] = useState("");
  const [generating, setGenerating] = useState(false);
  const [activeTone, setActiveTone] = useState("standard");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const toast = useToast();

  // ─── Computed stats ───
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0)
      return {
        avgRating: "0.0",
        responseRate: 0,
        avgResponseTime: "—",
        positive: 0,
        neutral: 0,
        negative: 0,
      };

    const avg = reviews.reduce((a, r) => a + r.rating, 0) / total;
    const replied = reviews.filter((r) => r.status === "replied").length;
    const positive = reviews.filter((r) => r.rating >= 4).length;
    const neutral = reviews.filter((r) => r.rating === 3).length;
    const negative = reviews.filter((r) => r.rating <= 2).length;

    return {
      avgRating: avg.toFixed(1),
      responseRate: Math.round((replied / total) * 100),
      avgResponseTime: "1.8h",
      positive,
      neutral,
      negative,
    };
  }, [reviews]);

  // ─── Filtered reviews ───
  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (platformFilter !== "all" && r.platform !== platformFilter)
        return false;
      if (ratingFilter !== null && r.rating !== ratingFilter) return false;
      return true;
    });
  }, [reviews, statusFilter, platformFilter, ratingFilter]);

  // ─── AI generation ───
  const handleGenerateResponse = async (toneModifier: string = "") => {
    if (!selectedReview) return;

    setGenerating(true);
    try {
      const res = await fetch("/api/reputation/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewText: selectedReview.text,
          rating: selectedReview.rating,
          reviewerName: selectedReview.authorName,
          brand,
          toneModifier,
        }),
      });
      const data = await res.json();
      if (data.response) {
        setDraftResponse(data.response);
      } else {
        toast("Failed to generate response", "error");
      }
    } catch {
      toast("Failed to generate response", "error");
    }
    setGenerating(false);
  };

  const handleSubmitResponse = () => {
    if (!selectedReview || !draftResponse) return;

    const updatedReviews = reviews.map((r) =>
      r.id === selectedReview.id
        ? { ...r, status: "replied" as const, replyText: draftResponse }
        : r
    );

    setReviews(updatedReviews);
    saveMockReviews(orgId, updatedReviews);

    toast("Response submitted successfully!");
    setSelectedReview(null);
    setDraftResponse("");
  };

  const openReviewDrawer = (review: MockReview) => {
    setSelectedReview(review);
    setDraftResponse(review.replyText || "");
    setActiveTone("standard");
    if (!review.replyText) {
      setTimeout(() => handleGenerateResponse("Standard Brand Voice"), 0);
    }
  };

  const handleToneClick = (tone: (typeof TONE_MODIFIERS)[number]) => {
    setActiveTone(tone.id);
    handleGenerateResponse(tone.value);
  };

  const sentimentTotal = stats.positive + stats.neutral + stats.negative;
  const pctPositive = sentimentTotal > 0 ? (stats.positive / sentimentTotal) * 100 : 0;
  const pctNeutral = sentimentTotal > 0 ? (stats.neutral / sentimentTotal) * 100 : 0;
  const pctNegative = sentimentTotal > 0 ? (stats.negative / sentimentTotal) * 100 : 0;

  return (
    <>
      <header className="app-page-header">
        <div>
          <h1 className="app-page-title">Reputation Hub</h1>
          <p className="app-page-subtitle">
            Monitor reviews, engage with customers, and let AI craft the perfect
            responses.
          </p>
        </div>
      </header>

      {/* ─── Metrics Banner ─── */}
      <div className="rep-metrics">
        <div className="rep-metric-card">
          <div className="rep-metric-label">Average Rating</div>
          <div className="rep-metric-value">
            {stats.avgRating}
            <StarIcon
              size={20}
              color="#FBBC05"
              style={{ fill: "#FBBC05" }}
            />
          </div>
        </div>

        <div className="rep-metric-card">
          <div className="rep-metric-label">Response Rate</div>
          <div className="rep-metric-value">{stats.responseRate}%</div>
        </div>

        <div className="rep-metric-card">
          <div className="rep-metric-label">Avg Response Time</div>
          <div className="rep-metric-value">{stats.avgResponseTime}</div>
        </div>

        <div className="rep-metric-card">
          <div className="rep-metric-label">Sentiment Trend</div>
          <div className="rep-sentiment-bar">
            <div
              className="rep-sentiment-seg positive"
              style={{ width: `${pctPositive}%` }}
            />
            <div
              className="rep-sentiment-seg neutral"
              style={{ width: `${pctNeutral}%` }}
            />
            <div
              className="rep-sentiment-seg negative"
              style={{ width: `${pctNegative}%` }}
            />
          </div>
          <div className="rep-sentiment-legend">
            <span>
              <i className="rep-sentiment-dot positive" /> {stats.positive}
            </span>
            <span>
              <i className="rep-sentiment-dot neutral" /> {stats.neutral}
            </span>
            <span>
              <i className="rep-sentiment-dot negative" /> {stats.negative}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Review Feed ─── */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Filter Bar */}
        <div className="rep-filter-bar">
          <button
            className={`chip ${statusFilter === "all" ? "selected" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All
          </button>
          <button
            className={`chip ${statusFilter === "unanswered" ? "selected" : ""}`}
            onClick={() => setStatusFilter("unanswered")}
          >
            Unanswered
          </button>
          <button
            className={`chip ${statusFilter === "replied" ? "selected" : ""}`}
            onClick={() => setStatusFilter("replied")}
          >
            Replied
          </button>

          <div className="rep-filter-divider" />

          <button
            className={`chip ${platformFilter === "all" ? "selected" : ""}`}
            onClick={() => setPlatformFilter("all")}
          >
            All Platforms
          </button>
          <button
            className={`chip ${platformFilter === "google" ? "selected" : ""}`}
            onClick={() => setPlatformFilter("google")}
          >
            <GoogleIcon size={14} /> Google
          </button>
          <button
            className={`chip ${platformFilter === "facebook" ? "selected" : ""}`}
            onClick={() => setPlatformFilter("facebook")}
          >
            <FacebookIcon size={14} /> Facebook
          </button>

          <div className="rep-filter-divider" />

          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              className={`chip ${ratingFilter === star ? "selected" : ""}`}
              onClick={() =>
                setRatingFilter(ratingFilter === star ? null : star)
              }
            >
              {star}★
            </button>
          ))}
        </div>

        {/* Table */}
        <table className="rep-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    textAlign: "center",
                    padding: "48px 24px",
                    color: "var(--text-muted)",
                  }}
                >
                  No reviews match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((review) => (
                <tr
                  key={review.id}
                  onClick={() => openReviewDrawer(review)}
                >
                  <td data-label="Customer">
                    <div className="rep-author">
                      <div className="rep-avatar">
                        {review.authorName.charAt(0)}
                      </div>
                      <div>
                        <div className="rep-author-name">
                          {review.authorName}
                        </div>
                        <div className="rep-author-meta">
                          {review.platform === "google" ? (
                            <GoogleIcon size={12} />
                          ) : (
                            <FacebookIcon size={12} />
                          )}
                          {review.date}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Rating">
                    <Stars rating={review.rating} />
                  </td>
                  <td data-label="Review">
                    <div className="rep-review-text">{review.text}</div>
                  </td>
                  <td data-label="Status">
                    <span className={`rep-badge ${review.status}`}>
                      {review.status === "unanswered"
                        ? "Unanswered"
                        : "Replied"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── AI Response Drawer ─── */}
      {selectedReview && (
        <>
          <div
            className="rep-drawer-overlay"
            onClick={() => setSelectedReview(null)}
          />
          <div className="rep-drawer">
            <div className="rep-drawer-header">
              <h2>Review Response</h2>
              <button
                className="btn btn-secondary"
                style={{ padding: "6px 14px" }}
                onClick={() => setSelectedReview(null)}
              >
                Close
              </button>
            </div>

            <div className="rep-drawer-body">
              {/* Original review */}
              <div className="rep-original-review">
                <div className="rep-original-header">
                  <div className="rep-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                    {selectedReview.authorName.charAt(0)}
                  </div>
                  <div className="rep-author-name">
                    {selectedReview.authorName}
                  </div>
                  <Stars rating={selectedReview.rating} />
                  <span className="rep-author-meta" style={{ marginTop: 0, marginLeft: "auto" }}>
                    {selectedReview.platform === "google" ? (
                      <GoogleIcon size={12} />
                    ) : (
                      <FacebookIcon size={12} />
                    )}
                    {selectedReview.date}
                  </span>
                </div>
                <p className="rep-original-text">{selectedReview.text}</p>
              </div>

              {/* AI draft section (unanswered only) */}
              {selectedReview.status === "unanswered" && (
                <div className="rep-ai-section">
                  <div className="rep-ai-header">
                    <div className="rep-ai-title">
                      <SparklesIcon size={16} /> AI Draft
                    </div>
                    <div className="rep-tone-chips">
                      {TONE_MODIFIERS.map((tone) => (
                        <button
                          key={tone.id}
                          className={`rep-tone-chip ${activeTone === tone.id ? "active" : ""}`}
                          onClick={() => handleToneClick(tone)}
                          disabled={generating}
                        >
                          {tone.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rep-draft-wrapper">
                    <textarea
                      className={`rep-draft-textarea ${generating ? "loading" : ""}`}
                      value={draftResponse}
                      onChange={(e) => setDraftResponse(e.target.value)}
                      placeholder="AI is drafting your response..."
                    />
                    {generating && (
                      <div className="rep-draft-loader">
                        <LoaderIcon size={16} className="spin" /> AI Drafting
                        Response…
                      </div>
                    )}
                  </div>

                  <button
                    className="btn btn-secondary"
                    style={{ alignSelf: "flex-start", gap: 6, display: "flex", alignItems: "center" }}
                    onClick={() => handleGenerateResponse(TONE_MODIFIERS.find(t => t.id === activeTone)?.value || "")}
                    disabled={generating}
                  >
                    <RefreshIcon size={14} /> Regenerate
                  </button>
                </div>
              )}

              {/* Already replied */}
              {selectedReview.status === "replied" && (
                <div>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      marginBottom: 12,
                    }}
                  >
                    Your Reply
                  </h3>
                  <div className="rep-reply-display">
                    <p>{selectedReview.replyText}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer footer */}
            {selectedReview.status === "unanswered" && (
              <div className="rep-drawer-footer">
                <button
                  className="btn btn-accent btn-lg rep-submit-btn"
                  onClick={handleSubmitResponse}
                  disabled={!draftResponse || generating}
                >
                  <MessageSquareIcon size={18} /> Approve & Submit
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
