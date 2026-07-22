"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/toast";
import { CompetitorInput } from "./competitor-input";
import { CompetitorCard } from "./competitor-card";
import { InsightCard } from "./insight-card";
import { ShareOfVoice } from "./share-of-voice";
import {
  addCompetitor,
  removeCompetitor,
  dismissInsight,
  actOnInsight,
  type TrackedCompetitor,
  type CompetitorInsight,
  type CompetitorPostLocal,
} from "@/lib/store";
import { MOCK_COMPETITORS, getMockCompetitorPosts } from "@/lib/mockCompetitors";
import { getMockInsights } from "@/lib/mockInsights";

type InsightFilter = "all" | "gaps" | "trending" | "timing";

interface CompetitorWatchProps {
  orgId: string;
  businessName: string;
  competitors: TrackedCompetitor[];
  insights: CompetitorInsight[];
  competitorPosts: CompetitorPostLocal[];
  onUpdateCompetitors: (competitors: TrackedCompetitor[]) => void;
  onUpdateInsights: (insights: CompetitorInsight[]) => void;
  onNavigateToCreator: (prompt: string) => void;
}

export function CompetitorWatch({
  orgId,
  businessName,
  competitors,
  insights,
  competitorPosts,
  onUpdateCompetitors,
  onUpdateInsights,
  onNavigateToCreator,
}: CompetitorWatchProps) {
  const [insightFilter, setInsightFilter] = useState<InsightFilter>("all");
  const toast = useToast();

  const handleAddCompetitor = (username: string) => {
    const newCompetitor = addCompetitor(orgId, username);
    onUpdateCompetitors([...competitors, newCompetitor]);
    toast(`Added @${username} to tracking`);
  };

  const handleRemoveCompetitor = (id: string) => {
    removeCompetitor(orgId, id);
    const updated = competitors.filter((c) => c.id !== id);
    onUpdateCompetitors(updated);
    toast("Competitor removed");
  };

  const handleLoadDemoData = () => {
    // Load mock competitors and generate insights
    const mockCompetitors = MOCK_COMPETITORS.map((c) => ({
      ...c,
      orgId,
    }));

    const mockPostsMap = getMockCompetitorPosts();
    const mockInsightsList = getMockInsights(mockPostsMap, businessName);

    onUpdateCompetitors(mockCompetitors);
    onUpdateInsights(mockInsightsList);
    toast("Demo data loaded — 3 competitors with insights");
  };

  const handleGenerateMine = (insight: CompetitorInsight) => {
    onNavigateToCreator(insight.suggestedPrompt);
    actOnInsight(orgId, insight.id);
    const updated = insights.map((i) =>
      i.id === insight.id ? { ...i, status: "acted" as const } : i
    );
    onUpdateInsights(updated);
  };

  const handleDismissInsight = (insightId: string) => {
    dismissInsight(orgId, insightId);
    const updated = insights.map((i) =>
      i.id === insightId ? { ...i, status: "dismissed" as const } : i
    );
    onUpdateInsights(updated);
  };

  // Filter insights
  const filteredInsights = insights.filter((i) => {
    if (insightFilter === "all") return true;
    if (insightFilter === "gaps") return i.type === "gap";
    if (insightFilter === "trending") return i.type === "spike";
    if (insightFilter === "timing") return i.type === "timing";
    return true;
  });

  const activeInsights = filteredInsights.filter((i) => i.status === "new");

  return (
    <div>
      {/* Header */}
      <header className="app-page-header">
        <div>
          <h1 className="app-page-title">Competitor Watch</h1>
          <p className="app-page-subtitle">
            Track up to 3 competitors and get AI-powered insights
          </p>
        </div>
        <button className="btn btn-accent" onClick={handleLoadDemoData}>
          Load Demo Data
        </button>
      </header>

      {/* Competitor Input */}
      <div style={{ marginBottom: "32px" }}>
        <CompetitorInput
          competitors={competitors}
          onAdd={handleAddCompetitor}
          onRemove={handleRemoveCompetitor}
          onLoadDemoData={() => {}} {/* handled in header */}
          maxCompetitors={3}
        />
      </div>

      {/* Empty state */}
      {competitors.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "64px 24px",
            color: "var(--text-secondary)",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
            No competitors yet
          </h2>
          <p>Add up to 3 Instagram handles to start tracking competitor activity.</p>
        </div>
      )}

      {competitors.length > 0 && (
        <>
          {/* Share of Voice */}
          <section className="card card-lg" style={{ marginBottom: 24 }}>
            <ShareOfVoice
              competitors={competitors}
              allPosts={competitorPosts}
              businessName={businessName}
              yourAvgLikes={45}
            />
          </section>

          {/* Competitor Cards */}
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>
              Tracked Competitors
            </h2>
            <div className="competitors-grid">
              {competitors.map((c) => (
                <CompetitorCard
                  key={c.id}
                  competitor={c}
                  posts={competitorPosts.filter((p) => p.competitorId === c.id)}
                  onExpand={() => {
                    /* TODO: expand detail view */
                  }}
                />
              ))}
            </div>
          </div>

          {/* Insights Section */}
          {insights.length > 0 && (
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>
                AI Insights ({activeInsights.length} new)
              </h2>

              {/* Filter pills */}
              <div className="insight-filters" style={{ marginBottom: "16px" }}>
                {(["all", "gaps", "trending", "timing"] as InsightFilter[]).map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => setInsightFilter(filter)}
                      className={`filter-pill ${insightFilter === filter ? "active" : ""}`}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        border: "1px solid var(--border)",
                        background:
                          insightFilter === filter
                            ? "var(--accent)"
                            : "transparent",
                        color:
                          insightFilter === filter
                            ? "white"
                            : "var(--text-primary)",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}
                    >
                      {filter === "all" && "All"}
                      {filter === "gaps" && "Gaps"}
                      {filter === "trending" && "Trending"}
                      {filter === "timing" && "Timing"}
                    </button>
                  )
                )}
              </div>

              {/* Insight cards */}
              <div className="insights-feed">
                {filteredInsights.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "32px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    No {insightFilter} insights yet
                  </div>
                ) : (
                  filteredInsights.map((insight) => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      onGenerateMine={() => handleGenerateMine(insight)}
                      onDismiss={() => handleDismissInsight(insight.id)}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
