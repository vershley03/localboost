"use client";

import { TrendingUpIcon } from "@/components/icons";
import type { TrackedCompetitor, CompetitorPostLocal } from "@/lib/store";

interface CompetitorCardProps {
  competitor: TrackedCompetitor;
  posts: CompetitorPostLocal[];
  onExpand?: () => void;
}

export function CompetitorCard({ competitor, posts, onExpand }: CompetitorCardProps) {
  const recentPosts = posts.slice(0, 6);
  const topPost = posts.reduce((max, p) => (p.likeCount > max.likeCount ? p : max), posts[0]);
  const isSpike =
    topPost && topPost.likeCount > competitor.avgLikes * 1.5;

  return (
    <div className="competitor-card" onClick={onExpand}>
      {/* Header */}
      <div className="competitor-card-header">
        <div className="competitor-card-avatar">
          {competitor.avatarUrl ? (
            <img
              src={competitor.avatarUrl}
              alt={competitor.username}
              style={{ width: "48px", height: "48px", borderRadius: "50%" }}
            />
          ) : (
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: "white",
                fontSize: "20px",
              }}
            >
              {competitor.username[0].toUpperCase()}
            </div>
          )}
        </div>

        <div className="competitor-card-info">
          <div className="competitor-username">
            @{competitor.username}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            {competitor.followers.toLocaleString()} followers
          </div>
        </div>

        {isSpike && (
          <div
            className="competitor-spike-badge"
            title="Recent engagement spike detected"
          >
            📈 Spike
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="competitor-card-stats">
        <div className="stat-item">
          <span className="stat-label">Posts/week</span>
          <span className="stat-value">{competitor.postsPerWeek}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Avg likes</span>
          <span className="stat-value">{competitor.avgLikes.toLocaleString()}</span>
        </div>
      </div>

      {/* Recent posts grid */}
      {recentPosts.length > 0 && (
        <div className="competitor-card-posts">
          <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-faint)", marginBottom: "8px" }}>
            RECENT POSTS
          </div>
          <div className="competitor-posts-grid">
            {recentPosts.map((post) => (
              <div key={post.id} className="competitor-post-thumb">
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="post"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
                <div className="post-thumb-overlay">
                  <span className="post-likes">{post.likeCount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <div className="competitor-card-footer">
        <button className="btn-view-details">View Details →</button>
      </div>
    </div>
  );
}
