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
import { Onboarding } from "@/components/dashboard/onboarding";
import { useUser, UserButton } from "@clerk/nextjs";
import { useDashboardOrgState } from "@/lib/useDashboardOrgState";

// Returns "" when we don't know the user's name — the greeting drops the name
// rather than inventing one.
function parseStoredUserName(): string {
  if (typeof window === "undefined") return "";

  const stored = window.localStorage.getItem("lb:username");
  if (!stored) return "";

  try {
    const parsed = JSON.parse(stored);
    return typeof parsed === "string" ? parsed : "";
  } catch {
    return stored;
  }
}

function DashboardInner() {
  const orgState = useDashboardOrgState();
  const [activeTab, setActiveTab] = useState<TabId>(orgState.activeTab);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const { user } = useUser();

  const {
    orgs,
    activeOrgId,
    posts,
    brand,
    brandKit,
    assets,
    connections,
    setGenerationCount,
    competitors,
    insights,
    onboarded,
    completeOnboarding,
    switchOrg,
    createAndSelectOrg,
    updatePosts,
    updateBrand,
    updateBrandKit,
    updateAssets,
    updateConnections,
    updateCompetitors,
    updateInsights,
  } = orgState;

  const [userName] = useState<string>(parseStoredUserName);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (orgState.startupToast) {
      toast(orgState.startupToast.message, orgState.startupToast.kind);
    }
    if (orgState.cleanupQueryParams) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [orgState.cleanupQueryParams, orgState.startupToast, toast]);

  // Scroll to top when tab changes
  useEffect(() => {
    const mainElement = document.querySelector(".app-main");
    if (mainElement) {
      mainElement.scrollTop = 0;
    }
  }, [activeTab]);

  const handleNavigateToCreator = (prompt: string) => {
    setInitialPrompt(prompt);
    setActiveTab("creator");
  };

  const handleSwitchOrg = (id: string) => {
    switchOrg(id);
    setInitialPrompt(null); // Clear any pending prompt
  };

  const handleCreateOrg = (name: string, category: string) => {
    createAndSelectOrg(name, category);
    setIsOrgModalOpen(false);
    toast("Organization created successfully");
  };

  const displayName = (user ? user.firstName || user.username : userName) || "";

  // A workspace that hasn't been set up yet gets the first-run wizard instead
  // of a dashboard full of numbers about a business we know nothing about.
  if (activeOrgId && !onboarded) {
    return (
      <Onboarding
        brand={brand}
        onComplete={(nextBrand, starterPosts) => {
          completeOnboarding(nextBrand, starterPosts);
          setActiveTab(starterPosts.length > 0 ? "calendar" : "overview");
          toast(
            starterPosts.length > 0
              ? `${starterPosts.length} drafts added to your calendar`
              : "You can finish setting up in Brand DNA any time",
          );
        }}
      />
    );
  }

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
        {activeOrgId && (
          <header className="app-header-desktop">
            <div className="app-header-left">
              <span className="org-badge">{brand.businessName || "Your workspace"}</span>
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
          {activeOrgId ? (
            <div className="app-main-inner" key={`${activeOrgId}-${activeTab}`}>
              {activeTab === "overview" && (
                <Overview
                  posts={posts}
                  connections={connections}
                  orgId={activeOrgId}
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
                  onUseInCreator={() => {
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
