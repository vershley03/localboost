"use client";

import { useEffect, useState } from "react";
import { ToastProvider, useToast } from "@/components/toast";
import { MobileNav, Sidebar, type TabId } from "@/components/dashboard/nav";
import { Overview } from "@/components/dashboard/overview";
import { MagicCreator } from "@/components/dashboard/magic-creator";
import { CalendarView } from "@/components/dashboard/calendar-view";
import { BrandProfileView } from "@/components/dashboard/brand-profile";
import { Reputation } from "@/components/dashboard/reputation";
import { CompetitorWatch } from "@/components/dashboard/competitor-watch";
import { Integrations } from "@/components/dashboard/integrations";
import { OrgModal } from "@/components/dashboard/org-switcher";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { LogOutIcon } from "@/components/icons";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  DEFAULT_BRAND,
  getBrand,
  getBrandKit,
  getAssets,
  getConnections,
  getGenerationCount,
  getPosts,
  saveBrand,
  saveBrandKit,
  saveAssets,
  saveConnections,
  savePosts,
  ensureMigrated,
  getOrgs,
  createOrg,
  getCompetitors,
  saveCompetitors,
  getInsights,
  saveInsights,
  actOnInsight,
  type BrandProfile,
  type BrandKit,
  type BrandAsset,
  type Connections,
  type ScheduledPost,
  type Org,
  type TrackedCompetitor,
  type CompetitorInsight,
  DEFAULT_BRAND_KIT,
} from "@/lib/store";

function DashboardInner() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [ready, setReady] = useState(false);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string>("");
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const { user } = useUser();

  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [brand, setBrand] = useState<BrandProfile>(DEFAULT_BRAND);
  const [brandKit, setBrandKit] = useState<BrandKit>(DEFAULT_BRAND_KIT);
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [connections, setConnections] = useState<Connections>({
    instagram: false,
    facebook: false,
    google: false,
    x: false,
  });
  const [generationCount, setGenerationCount] = useState(0);
  const [userName, setUserName] = useState<string>("Sarah");
  const [competitors, setCompetitors] = useState<TrackedCompetitor[]>([]);
  const [insights, setInsights] = useState<CompetitorInsight[]>([]);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("lb:username");
      if (stored) {
        try {
          setUserName(JSON.parse(stored));
        } catch {
          setUserName(stored);
        }
      }
    }
  }, []);

  const updateUserName = (name: string) => {
    setUserName(name);
    window.localStorage.setItem("lb:username", JSON.stringify(name));
  };

  const loadOrgData = (orgId: string) => {
    setPosts(getPosts(orgId));
    setBrand(getBrand(orgId));
    setBrandKit(getBrandKit(orgId));
    setAssets(getAssets(orgId));
    setConnections(getConnections(orgId));
    setGenerationCount(getGenerationCount(orgId));
    setCompetitors(getCompetitors(orgId));
    setInsights(getInsights(orgId));
  };

  useEffect(() => {
    const migratedId = ensureMigrated();
    setActiveOrgId(migratedId);
    setOrgs(getOrgs());
    loadOrgData(migratedId);
    setReady(true);

    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const error = params.get("error");
    if (connected === "facebook") {
      const next = { ...getConnections(migratedId), facebook: true };
      saveConnections(migratedId, next);
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
    savePosts(activeOrgId, next);
  };

  const updateBrand = (next: BrandProfile) => {
    setBrand(next);
    saveBrand(activeOrgId, next);
    setOrgs(getOrgs()); // Re-sync orgs list in case business name changed
  };

  const updateBrandKit = (next: BrandKit) => {
    setBrandKit(next);
    saveBrandKit(activeOrgId, next);
  };

  const updateAssets = (next: BrandAsset[]) => {
    setAssets(next);
    saveAssets(activeOrgId, next);
  };

  const updateConnections = (next: Connections) => {
    setConnections(next);
    saveConnections(activeOrgId, next);
  };

  const updateCompetitors = (next: TrackedCompetitor[]) => {
    setCompetitors(next);
    saveCompetitors(activeOrgId, next);
  };

  const updateInsights = (next: CompetitorInsight[]) => {
    setInsights(next);
    saveInsights(activeOrgId, next);
  };

  const handleNavigateToCreator = (prompt: string) => {
    setInitialPrompt(prompt);
    setActiveTab("creator");
  };

  const handleSwitchOrg = (id: string) => {
    setActiveOrgId(id);
    loadOrgData(id);
    setInitialPrompt(null); // Clear any pending prompt
    // Persist active org id implicitly handled in the store, but we might want to call setActiveOrgId there too.
    // Wait, the store handles saving it in createOrg/ensureMigrated, but we should probably expose setActiveOrgId from store.
    // Let's just rely on loadOrgData fetching the correct namespace, but for now let's also update localStorage
    window.localStorage.setItem("lb:active-org", JSON.stringify(id));
  };

  const handleCreateOrg = (name: string, category: string) => {
    const newOrg = createOrg(name, category);
    setOrgs(getOrgs());
    setActiveOrgId(newOrg.id);
    loadOrgData(newOrg.id);
    setIsOrgModalOpen(false);
    toast("Organization created successfully");
  };

  const displayName = user ? (user.firstName || user.username || "User") : userName;

  return (
    <div className="app-shell">
      <Sidebar 
        active={activeTab} 
        onSelect={setActiveTab} 
        orgs={orgs}
        activeOrgId={activeOrgId}
        onSwitchOrg={handleSwitchOrg}
        onCreateOrg={() => setIsOrgModalOpen(true)}
      />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {ready && (
          <header className="app-header-desktop">
            <div className="app-header-left">
              <span className="org-badge">{brand.businessName}</span>
            </div>
            <div className="app-header-right">
              <NotificationBell posts={posts} />
              <UserButton showName />
            </div>
          </header>
        )}
        <MobileNav
          active={activeTab}
          onSelect={setActiveTab}
          posts={posts}
          orgs={orgs}
          activeOrgId={activeOrgId}
          onSwitchOrg={handleSwitchOrg}
          onCreateOrg={() => setIsOrgModalOpen(true)}
        />
        <main className="app-main">
          {ready ? (
            <div className="app-main-inner" key={`${activeOrgId}-${activeTab}`}>
              {activeTab === "overview" && (
                <Overview
                  posts={posts}
                  generationCount={generationCount}
                  businessName={brand.businessName}
                  onNavigate={setActiveTab}
                  userName={displayName}
                />
              )}
              {activeTab === "creator" && (
                <MagicCreator
                  orgId={activeOrgId}
                  brand={brand}
                  brandKit={brandKit}
                  assets={assets}
                  initialPrompt={initialPrompt || undefined}
                  onSchedule={(post) => {
                    updatePosts([...posts, post]);
                    setInitialPrompt(null);
                  }}
                  onGenerated={setGenerationCount}
                />
              )}
              {activeTab === "calendar" && (
                <CalendarView
                  posts={posts}
                  onAdd={(post) => updatePosts([...posts, post])}
                  onRemove={(id) => updatePosts(posts.filter((p) => p.id !== id))}
                  onEdit={(id, updates) => updatePosts(posts.map(p => p.id === id ? { ...p, ...updates } : p))}
                />
              )}
              {activeTab === "brand" && (
                <BrandProfileView
                  brand={brand}
                  onSave={updateBrand}
                  brandKit={brandKit}
                  onSaveBrandKit={updateBrandKit}
                  orgId={activeOrgId}
                  assets={assets}
                  onAssetsChange={updateAssets}
                  onUseInCreator={(asset) => {
                    // Switch to creator tab with asset pre-loaded
                    setActiveTab("creator");
                  }}
                />
              )}
              {activeTab === "reputation" && (
                <Reputation brand={brand} orgId={activeOrgId} />
              )}
              {activeTab === "competitor-watch" && (
                <CompetitorWatch
                  orgId={activeOrgId}
                  businessName={brand.businessName}
                  competitors={competitors}
                  insights={insights}
                  competitorPosts={[]}
                  onUpdateCompetitors={updateCompetitors}
                  onUpdateInsights={updateInsights}
                  onNavigateToCreator={handleNavigateToCreator}
                />
              )}
              {activeTab === "integrations" && (
                <Integrations connections={connections} onChange={updateConnections} />
              )}
            </div>
          ) : (
            <div className="app-main-inner">
              <header className="app-page-header">
                <div>
                  <div className="skeleton-box" style={{ width: 240, height: 32, marginBottom: 8, borderRadius: 12 }}></div>
                  <div className="skeleton-box" style={{ width: 300, height: 20, borderRadius: 8 }}></div>
                </div>
              </header>
              <div className="stat-grid">
                {[1, 2, 3].map(i => (
                  <div key={i} className="stat-tile" style={{ height: 160, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.8)' }}>
                    <div className="skeleton-box" style={{ width: "40%", height: 20, marginBottom: 12 }}></div>
                    <div className="skeleton-box" style={{ width: "60%", height: 36, marginBottom: 12 }}></div>
                    <div className="skeleton-box" style={{ width: "30%", height: 16 }}></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <OrgModal 
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
        onSubmit={handleCreateOrg}
      />
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
