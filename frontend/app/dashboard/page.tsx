"use client";

import { useEffect, useState } from "react";
import { ToastProvider, useToast } from "@/components/toast";
import { MobileNav, Sidebar, type TabId } from "@/components/dashboard/nav";
import { Overview } from "@/components/dashboard/overview";
import { MagicCreator } from "@/components/dashboard/magic-creator";
import { CalendarView } from "@/components/dashboard/calendar-view";
import { BrandProfileView } from "@/components/dashboard/brand-profile";
import { Integrations } from "@/components/dashboard/integrations";
import {
  DEFAULT_BRAND,
  getBrand,
  getConnections,
  getGenerationCount,
  getPosts,
  saveBrand,
  saveConnections,
  savePosts,
  type BrandProfile,
  type Connections,
  type ScheduledPost,
} from "@/lib/store";

function DashboardInner() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [ready, setReady] = useState(false);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [brand, setBrand] = useState<BrandProfile>(DEFAULT_BRAND);
  const [connections, setConnections] = useState<Connections>({
    instagram: false,
    facebook: false,
    google: false,
  });
  const [generationCount, setGenerationCount] = useState(0);
  const toast = useToast();

  // Hydrate persisted state on the client. localStorage is unavailable during
  // SSR/prerender, so this one-time sync from the external store must happen
  // post-mount; content stays hidden behind `ready` until then.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPosts(getPosts());
    setBrand(getBrand());
    setConnections(getConnections());
    setGenerationCount(getGenerationCount());
    setReady(true);

    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const error = params.get("error");
    if (connected === "facebook") {
      const next = { ...getConnections(), facebook: true };
      saveConnections(next);
      setConnections(next);
      setActiveTab("integrations");
      toast("Facebook Page connected");
    } else if (error) {
      setActiveTab("integrations");
      toast(
        error === "access_denied"
          ? "Connection cancelled"
          : "Connection failed — please try again",
        "error",
      );
    }
    if (connected || error) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const updatePosts = (next: ScheduledPost[]) => {
    setPosts(next);
    savePosts(next);
  };

  const updateBrand = (next: BrandProfile) => {
    setBrand(next);
    saveBrand(next);
  };

  const updateConnections = (next: Connections) => {
    setConnections(next);
    saveConnections(next);
  };

  return (
    <div className="app-shell">
      <Sidebar active={activeTab} onSelect={setActiveTab} businessName={brand.businessName} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <MobileNav active={activeTab} onSelect={setActiveTab} />
        <main className="app-main">
          {ready && (
            <div className="app-main-inner" key={activeTab}>
              {activeTab === "overview" && (
                <Overview
                  posts={posts}
                  generationCount={generationCount}
                  businessName={brand.businessName}
                  onNavigate={setActiveTab}
                />
              )}
              {activeTab === "creator" && (
                <MagicCreator
                  brand={brand}
                  onSchedule={(post) => updatePosts([...posts, post])}
                  onGenerated={setGenerationCount}
                />
              )}
              {activeTab === "calendar" && (
                <CalendarView
                  posts={posts}
                  onAdd={(post) => updatePosts([...posts, post])}
                  onRemove={(id) => updatePosts(posts.filter((p) => p.id !== id))}
                />
              )}
              {activeTab === "brand" && (
                <BrandProfileView brand={brand} onSave={updateBrand} />
              )}
              {activeTab === "integrations" && (
                <Integrations connections={connections} onChange={updateConnections} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ToastProvider>
      <DashboardInner />
    </ToastProvider>
  );
}
