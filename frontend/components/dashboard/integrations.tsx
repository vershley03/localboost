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
  isSandbox?: boolean;
  permissions?: string[];
}[] = [
  {
    id: "instagram",
    name: "Instagram Business",
    connectedAs: "@thedailygrind",
    icon: InstagramIcon,
    oauthUrl: "/api/integrations/facebook/auth?provider=instagram",
    capabilities: ["Post scheduling", "Story drafts", "Carousel support", "Hashtag suggestions"],
    description: "Publish and schedule visual content to your Instagram Business profile.",
    isSandbox: true,
    permissions: ["Publish posts to Instagram Business Account @thedailygrind", "Access account insights"],
  },
  {
    id: "facebook",
    name: "Facebook Page",
    connectedAs: "The Daily Grind",
    icon: FacebookIcon,
    oauthUrl: "/api/integrations/facebook/auth?provider=facebook",
    capabilities: ["Post scheduling", "Page insights", "Event promotion", "Auto-replies"],
    description: "Manage your Facebook Page posts, events, and audience engagement.",
    isSandbox: true,
    permissions: ["Publish posts to Facebook Page 'The Daily Grind'", "Read page insights", "Manage page messages"],
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
              {/* Sandbox Badge */}
              {provider.isSandbox && (
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    backgroundColor: "#FFF3CD",
                    color: "#856404",
                    padding: "4px 10px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    border: "1px solid #FFEAA7",
                  }}
                  title="This uses a sandboxed mock OAuth flow. Real credentials will be enabled after app approval."
                >
                  SANDBOX / MOCK
                </div>
              )}

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

                {/* Permissions */}
                {provider.permissions && (connected || !provider.isSandbox) && (
                  <div style={{ marginTop: 12, marginBottom: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Permissions:</p>
                    <ul style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, paddingLeft: 16 }}>
                      {provider.permissions.map((perm) => (
                        <li key={perm}>{perm}</li>
                      ))}
                    </ul>
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
                    title={provider.isSandbox ? "Connect via sandboxed mock OAuth (for testing)" : undefined}
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

      <div style={{ marginTop: 28, padding: 16, backgroundColor: "rgba(255, 243, 205, 0.5)", borderLeft: "3px solid #FFEAA7", borderRadius: 4 }}>
        <p style={{ fontSize: 13, color: "var(--text-faint)", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
          <strong>Sandbox Mode:</strong> Instagram and Facebook connections use a sandboxed mock OAuth flow for testing. Once your app is registered with Meta, real credentials will be enabled automatically. Google Business Profile uses a local mock toggle for development.
        </p>
      </div>
    </>
  );
}
