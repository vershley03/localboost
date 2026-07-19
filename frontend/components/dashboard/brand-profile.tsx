"use client";

import { useState } from "react";
import { XIcon } from "@/components/icons";
import { useToast } from "@/components/toast";
import { type BrandProfile } from "@/lib/store";

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

export function BrandProfileView({
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
    <>
      <header className="app-page-header">
        <div>
          <h1 className="app-page-title">Brand DNA</h1>
          <p className="app-page-subtitle">
            Configure your business once — every AI draft uses this voice.
          </p>
        </div>
      </header>

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
    </>
  );
}
