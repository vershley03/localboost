"use client";

import { useState } from "react";
import { type TabId } from "@/components/dashboard/nav";
import {
  DEFAULT_BRAND,
  DEFAULT_BRAND_KIT,
  createOrg,
  ensureMigrated,
  getAssets,
  getBrand,
  getBrandKit,
  getCompetitors,
  getConnections,
  getGenerationCount,
  getInsights,
  getOrgs,
  getPosts,
  saveAssets,
  saveBrand,
  saveBrandKit,
  saveCompetitors,
  saveConnections,
  saveInsights,
  savePosts,
  setActiveOrgId as persistActiveOrgId,
  type BrandAsset,
  type BrandKit,
  type BrandProfile,
  type CompetitorInsight,
  type Connections,
  type Org,
  type ScheduledPost,
  type TrackedCompetitor,
} from "@/lib/store";

type ToastKind = "error" | undefined;

export interface StartupToast {
  message: string;
  kind: ToastKind;
}

interface InitialDashboardOrgState {
  activeTab: TabId;
  orgs: Org[];
  activeOrgId: string;
  posts: ScheduledPost[];
  brand: BrandProfile;
  brandKit: BrandKit;
  assets: BrandAsset[];
  connections: Connections;
  generationCount: number;
  competitors: TrackedCompetitor[];
  insights: CompetitorInsight[];
  cleanupQueryParams: boolean;
  startupToast?: StartupToast;
}

function getInitialDashboardOrgState(): InitialDashboardOrgState {
  if (typeof window === "undefined") {
    return {
      activeTab: "overview",
      orgs: [],
      activeOrgId: "",
      posts: [],
      brand: DEFAULT_BRAND,
      brandKit: DEFAULT_BRAND_KIT,
      assets: [],
      connections: {
        instagram: false,
        facebook: false,
        google: false,
        x: false,
      },
      generationCount: 0,
      competitors: [],
      insights: [],
      cleanupQueryParams: false,
    };
  }

  const migratedId = ensureMigrated();
  let activeTab: TabId = "overview";
  let startupToast: StartupToast | undefined;
  let cleanupQueryParams = false;
  let connections = getConnections(migratedId);

  const params = new URLSearchParams(window.location.search);
  const connected = params.get("connected");
  const error = params.get("error");

  if (connected === "facebook") {
    connections = { ...connections, facebook: true };
    saveConnections(migratedId, connections);
    activeTab = "integrations";
    startupToast = { message: "Facebook Page connected", kind: undefined };
    cleanupQueryParams = true;
  } else if (error) {
    activeTab = "integrations";
    startupToast = {
      message:
        error === "access_denied"
          ? "Connection cancelled"
          : "Connection failed — please try again",
      kind: "error",
    };
    cleanupQueryParams = true;
  }

  return {
    activeTab,
    orgs: getOrgs(),
    activeOrgId: migratedId,
    posts: getPosts(migratedId),
    brand: getBrand(migratedId),
    brandKit: getBrandKit(migratedId),
    assets: getAssets(migratedId),
    connections,
    generationCount: getGenerationCount(migratedId),
    competitors: getCompetitors(migratedId),
    insights: getInsights(migratedId),
    cleanupQueryParams,
    startupToast,
  };
}

export function useDashboardOrgState() {
  const [initial] = useState(getInitialDashboardOrgState);
  const [orgs, setOrgs] = useState<Org[]>(initial.orgs);
  const [activeOrgId, setActiveOrgId] = useState<string>(initial.activeOrgId);
  const [posts, setPosts] = useState<ScheduledPost[]>(initial.posts);
  const [brand, setBrand] = useState<BrandProfile>(initial.brand);
  const [brandKit, setBrandKit] = useState<BrandKit>(initial.brandKit);
  const [assets, setAssets] = useState<BrandAsset[]>(initial.assets);
  const [connections, setConnections] = useState<Connections>(initial.connections);
  const [generationCount, setGenerationCount] = useState(initial.generationCount);
  const [competitors, setCompetitors] = useState<TrackedCompetitor[]>(initial.competitors);
  const [insights, setInsights] = useState<CompetitorInsight[]>(initial.insights);

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

  const switchOrg = (orgId: string) => {
    setActiveOrgId(orgId);
    persistActiveOrgId(orgId);
    loadOrgData(orgId);
  };

  const createAndSelectOrg = (name: string, category: string) => {
    const newOrg = createOrg(name, category);
    setOrgs(getOrgs());
    setActiveOrgId(newOrg.id);
    loadOrgData(newOrg.id);
  };

  const updatePosts = (next: ScheduledPost[]) => {
    setPosts(next);
    savePosts(activeOrgId, next);
  };

  const updateBrand = (next: BrandProfile) => {
    setBrand(next);
    saveBrand(activeOrgId, next);
    setOrgs(getOrgs());
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

  return {
    activeTab: initial.activeTab,
    startupToast: initial.startupToast,
    cleanupQueryParams: initial.cleanupQueryParams,
    orgs,
    activeOrgId,
    posts,
    brand,
    brandKit,
    assets,
    connections,
    generationCount,
    setGenerationCount,
    competitors,
    insights,
    switchOrg,
    createAndSelectOrg,
    updatePosts,
    updateBrand,
    updateBrandKit,
    updateAssets,
    updateConnections,
    updateCompetitors,
    updateInsights,
  };
}
