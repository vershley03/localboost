"use client";

import { FacebookIcon, GoogleIcon, InstagramIcon, TwitterXIcon, SparklesIcon } from "@/components/icons";
import { useToast } from "@/components/toast";
import type { Connections, Platform } from "@/lib/store";

const PROVIDERS: {
  id: Platform;
  name: string;
  connectedAs: string;
  icon: typeof InstagramIcon;
  oauthUrl?: string;
  capabilities: string[];
  description: string;
}[] = [
  {
    id: "instagram",
    name: "Instagram Business",
    connectedAs: "@thedailygrind",
    icon: InstagramIcon,
    oauthUrl: "/api/integrations/facebook/auth?provider=instagram",
    capabilities: ["Post scheduling", "Story drafts", "Carousel support", "Hashtag suggestions"],
    description: "Publish and schedule visual content to your Instagram Business profile.",
  },
  {
    id: "facebook",
    name: "Facebook Page",
    connectedAs: "The Daily Grind",
    icon: FacebookIcon,
    oauthUrl: "/api/integrations/facebook/auth?provider=facebook",
    capabilities: ["Post scheduling", "Page insights", "Event promotion", "Auto-replies"],
    description: "Manage your Facebook Page posts, events, and audience engagement.",
  },
  {
    id: "x",
    name: "X (Twitter)",
    connectedAs: "@thedailygrind",
    icon: TwitterXIcon,
    oauthUrl: "/api/integrations/facebook/auth?provider=x", // reusing mock for now
    capabilities: ["Tweet scheduling", "Thread support", "Analytics", "Trending topics"],
    description: "Schedule tweets, build threads, and track trending conversations.",
  },
  {
    id: "google",
    name: "Google Business Profile",
    connectedAs: "The Daily Grind — Downtown",
    icon: GoogleIcon,
    capabilities: ["Post updates", "Review monitoring", "Q&A management", "Photo uploads"],
    description: "Boost local SEO with Google Business posts, photos, and review responses.",
  },
];

function ConnectionHealthDot({ connected, lastSync }: { connected: boolean; lastSync?: string }) {
  return (
    <div className="integ-health">
      <span className={`integ-health-dot ${connected ? "live" : ""}`} />
      {connected ? (
        <span className="integ-health-text">{lastSync || "Synced just now"}</span>
      ) : (
        <span className="integ-health-text off">Not connected</span>
      )}
    </div>
  );
}

export function Integrations({
  connections,
  onChange,
}: {
  connections: Connections;
  onChange: (next: Connections) => void;
}) {
  const toast = useToast();

  // Mock last sync times
  const syncTimes: Record<Platform, string> = {
    instagram: "Last synced 12 min ago",
    facebook: "Last synced 3 min ago",
    x: "Last synced 1 hour ago",
    google: "Last synced 28 min ago",
  };

  const disconnect = (id: Platform, name: string) => {
    onChange({ ...connections, [id]: false });
    toast(`${name} disconnected`);
  };

  const connectedCount = Object.values(connections).filter(Boolean).length;

  return (
    <>
      <header className="app-page-header">
        <div>
          <h1 className="app-page-title">Integrations</h1>
          <p className="app-page-subtitle">
            Connect your accounts to enable automated scheduling and publishing.
          </p>
        </div>
        <div className="integ-connected-badge">
          <SparklesIcon size={14} />
          {connectedCount}/{PROVIDERS.length} Connected
        </div>
      </header>

      <div className="integ-grid">
        {PROVIDERS.map((provider) => {
          const connected = connections[provider.id];
          const ProviderIcon = provider.icon;
          return (
            <div key={provider.id} className={`integ-card ${connected ? "connected" : ""}`}>
              {/* Card Header */}
              <div className="integ-card-header">
                <div className={`integ-logo platform-${provider.id}`}>
                  <ProviderIcon size={28} />
                </div>
                <ConnectionHealthDot
                  connected={connected}
                  lastSync={connected ? syncTimes[provider.id] : undefined}
                />
              </div>

              {/* Card Body */}
              <div className="integ-card-body">
                <h3 className="integ-name">{provider.name}</h3>
                <p className="integ-desc">{provider.description}</p>

                {connected && (
                  <div className="integ-connected-as">
                    Connected as <strong>{provider.connectedAs}</strong>
                  </div>
                )}

                {/* Capabilities */}
                <div className="integ-capabilities">
                  {provider.capabilities.map((cap) => (
                    <span key={cap} className="integ-cap-chip">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="integ-card-footer">
                {connected ? (
                  <button
                    className="btn btn-outline"
                    style={{ width: "100%" }}
                    onClick={() => disconnect(provider.id, provider.name)}
                  >
                    Disconnect
                  </button>
                ) : provider.oauthUrl ? (
                  <a
                    href={provider.oauthUrl}
                    className="btn btn-accent"
                    style={{ width: "100%", textAlign: "center" }}
                  >
                    Connect {provider.name}
                  </a>
                ) : (
                  <button
                    className="btn btn-accent"
                    style={{ width: "100%" }}
                    onClick={() => {
                      onChange({ ...connections, [provider.id]: true });
                      toast(`${provider.name} connected`);
                    }}
                  >
                    Connect {provider.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: 28, fontSize: 13, color: "var(--text-faint)", fontWeight: 500, lineHeight: 1.6 }}>
        Instagram and Facebook currently use a sandboxed mock OAuth flow — real Meta
        credentials will be wired in once the app is registered. Google Business Profile
        uses a local mock toggle for now.
      </p>
    </>
  );
}
