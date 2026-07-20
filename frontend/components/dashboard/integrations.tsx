"use client";

import { FacebookIcon, GoogleIcon, InstagramIcon, TwitterXIcon } from "@/components/icons";
import { useToast } from "@/components/toast";
import type { Connections, Platform } from "@/lib/store";

const PROVIDERS: {
  id: Platform;
  name: string;
  connectedAs: string;
  icon: typeof InstagramIcon;
  oauthUrl?: string;
}[] = [
  {
    id: "instagram",
    name: "Instagram Business",
    connectedAs: "@thedailygrind",
    icon: InstagramIcon,
    oauthUrl: "/api/integrations/facebook/auth?provider=instagram",
  },
  {
    id: "facebook",
    name: "Facebook Page",
    connectedAs: "The Daily Grind",
    icon: FacebookIcon,
    oauthUrl: "/api/integrations/facebook/auth?provider=facebook",
  },
  {
    id: "x",
    name: "X (Twitter)",
    connectedAs: "@thedailygrind",
    icon: TwitterXIcon,
    oauthUrl: "/api/integrations/facebook/auth?provider=x", // reusing mock for now
  },
  {
    id: "google",
    name: "Google Business Profile",
    connectedAs: "The Daily Grind — Downtown",
    icon: GoogleIcon,
  },
];

export function Integrations({
  connections,
  onChange,
}: {
  connections: Connections;
  onChange: (next: Connections) => void;
}) {
  const toast = useToast();

  const disconnect = (id: Platform, name: string) => {
    onChange({ ...connections, [id]: false });
    toast(`${name} disconnected`);
  };

  return (
    <>
      <header className="app-page-header">
        <div>
          <h1 className="app-page-title">Integrations</h1>
          <p className="app-page-subtitle">
            Connect your accounts to enable automated scheduling and publishing.
          </p>
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {PROVIDERS.map((provider) => {
          const connected = connections[provider.id];
          const ProviderIcon = provider.icon;
          return (
            <div key={provider.id} className="integration-card">
              <div className="integration-info">
                <div className={`integration-logo ${provider.id}`}>
                  <ProviderIcon size={26} />
                </div>
                <div>
                  <div className="integration-name">{provider.name}</div>
                  <div className="integration-status">
                    <span className={`status-dot ${connected ? "on" : ""}`} />
                    {connected ? (
                      <span>
                        Connected as{" "}
                        <strong style={{ color: "var(--text-primary)" }}>
                          {provider.connectedAs}
                        </strong>
                      </span>
                    ) : (
                      "Not connected"
                    )}
                  </div>
                </div>
              </div>

              {connected ? (
                <button
                  className="btn btn-outline"
                  style={{ minWidth: 130 }}
                  onClick={() => disconnect(provider.id, provider.name)}
                >
                  Disconnect
                </button>
              ) : provider.oauthUrl ? (
                <a
                  href={provider.oauthUrl}
                  className="btn btn-accent"
                  style={{ minWidth: 130 }}
                >
                  Connect
                </a>
              ) : (
                <button
                  className="btn btn-accent"
                  style={{ minWidth: 130 }}
                  onClick={() => {
                    onChange({ ...connections, [provider.id]: true });
                    toast(`${provider.name} connected`);
                  }}
                >
                  Connect
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: 24, fontSize: 14, color: "var(--text-faint)", fontWeight: 500 }}>
        Instagram and Facebook currently use a sandboxed mock OAuth flow — real Meta
        credentials will be wired in once the app is registered.
      </p>
    </>
  );
}
