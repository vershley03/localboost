"use client";

import { useState } from "react";
import { XIcon, FingerprintIcon, PaletteIcon, FolderIcon } from "@/components/icons";
import { useToast } from "@/components/toast";
import {
  type BrandProfile,
  type BrandKit,
  type BrandAsset,
} from "@/lib/store";
import { BrandKitTab } from "./brand-kit";
import { AssetLibrary } from "./asset-library";

const TONES = [
  "Friendly & Approachable",
  "Professional & Corporate",
  "Witty & Humorous",
  "Energetic & Bold",
];

const CATEGORIES = [
  "Coffee Shop",
  "Restaurant",
  "Bakery",
  "Salon & Beauty",
  "Fitness Studio",
  "Retail Store",
  "Other",
];

type BrandSubTab = "identity" | "brand-kit" | "assets";

const SUB_TABS: { id: BrandSubTab; label: string; icon: typeof FingerprintIcon }[] = [
  { id: "identity", label: "Identity", icon: FingerprintIcon },
  { id: "brand-kit", label: "Brand Kit", icon: PaletteIcon },
  { id: "assets", label: "Assets", icon: FolderIcon },
];

// ── Identity Form (existing Brand DNA) ────────────────────────────────────

function IdentityTab({
  brand,
  onSave,
}: {
  brand: BrandProfile;
  onSave: (brand: BrandProfile) => void;
}) {
  const [draft, setDraft] = useState<BrandProfile>(brand);
  const [keywordInput, setKeywordInput] = useState("");
  const toast = useToast();

  const set = <K extends keyof BrandProfile>(key: K, value: BrandProfile[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const addKeyword = () => {
    const k = keywordInput.trim().toLowerCase();
    if (!k || draft.keywords.includes(k) || draft.keywords.length >= 8) return;
    set("keywords", [...draft.keywords, k]);
    setKeywordInput("");
  };

  const save = () => {
    if (!draft.businessName.trim()) {
      toast("Business name is required", "error");
      return;
    }
    onSave({ ...draft, businessName: draft.businessName.trim() });
    toast("Brand DNA saved — the AI now writes in this voice");
  };

  return (
    <div className="card card-lg" style={{ maxWidth: 640 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="field">
          <label className="field-label" htmlFor="brand-name">
            Business name
          </label>
          <input
            id="brand-name"
            className="input"
            value={draft.businessName}
            onChange={(e) => set("businessName", e.target.value)}
            placeholder="The Daily Grind"
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="brand-category">
            Category
          </label>
          <select
            id="brand-category"
            className="select"
            value={draft.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <span className="field-label">Brand voice</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TONES.map((tone) => (
              <button
                key={tone}
                className={`chip ${draft.tone === tone ? "selected" : ""}`}
                onClick={() => set("tone", tone)}
                aria-pressed={draft.tone === tone}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="brand-audience">
            Target audience
          </label>
          <textarea
            id="brand-audience"
            className="textarea"
            value={draft.audience}
            onChange={(e) => set("audience", e.target.value)}
            placeholder="Who are your customers?"
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="brand-keywords">
            Keywords &amp; hashtags
          </label>
          <span className="field-hint">
            Press Enter to add — used in generated captions (max 8).
          </span>
          <input
            id="brand-keywords"
            className="input"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addKeyword();
              }
            }}
            placeholder="e.g. specialty coffee"
          />
          {draft.keywords.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              {draft.keywords.map((k) => (
                <span key={k} className="chip chip-static">
                  {k}
                  <button
                    onClick={() =>
                      set("keywords", draft.keywords.filter((x) => x !== k))
                    }
                    aria-label={`Remove keyword ${k}`}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "inherit",
                      display: "inline-flex",
                      padding: 0,
                    }}
                  >
                    <XIcon size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button className="btn btn-primary btn-lg" onClick={save}>
          Save Brand DNA
        </button>
      </div>
    </div>
  );
}

// ── Main BrandProfileView with sub-tabs ──────────────────────────────────

export function BrandProfileView({
  brand,
  onSave,
  brandKit,
  onSaveBrandKit,
  orgId,
  assets,
  onAssetsChange,
  onUseInCreator,
}: {
  brand: BrandProfile;
  onSave: (brand: BrandProfile) => void;
  brandKit: BrandKit;
  onSaveBrandKit: (kit: BrandKit) => void;
  orgId: string;
  assets: BrandAsset[];
  onAssetsChange: (assets: BrandAsset[]) => void;
  onUseInCreator?: (asset: BrandAsset) => void;
}) {
  const [subTab, setSubTab] = useState<BrandSubTab>("identity");

  return (
    <>
      <header className="app-page-header">
        <div>
          <h1 className="app-page-title">Brand DNA</h1>
          <p className="app-page-subtitle">
            Configure your business identity, visual kit, and asset library.
          </p>
        </div>
      </header>

      {/* Sub-tab pills — same pattern as Calendar view toggle */}
      <div className="view-toggle" style={{ marginBottom: 28, alignSelf: "flex-start" }}>
        {SUB_TABS.map(({ id, label, icon: TabIcon }) => (
          <button
            key={id}
            className={`view-toggle-btn ${subTab === id ? "active" : ""}`}
            onClick={() => setSubTab(id)}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <TabIcon size={15} />
            {label}
          </button>
        ))}
      </div>

      {subTab === "identity" && <IdentityTab brand={brand} onSave={onSave} />}
      {subTab === "brand-kit" && <BrandKitTab kit={brandKit} onSave={onSaveBrandKit} />}
      {subTab === "assets" && (
        <AssetLibrary
          orgId={orgId}
          assets={assets}
          onAssetsChange={onAssetsChange}
          onUseInCreator={onUseInCreator}
        />
      )}
    </>
  );
}
