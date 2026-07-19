"use client";

import { useState } from "react";
import {
  CopyIcon,
  FacebookIcon,
  GoogleIcon,
  InstagramIcon,
  LoaderIcon,
  SendIcon,
  SparklesIcon,
} from "@/components/icons";
import { useToast } from "@/components/toast";
import {
  bumpGenerationCount,
  newId,
  toDateKey,
  type BrandProfile,
  type Platform,
  type ScheduledPost,
} from "@/lib/store";

const PLATFORMS: { id: Platform; label: string; icon: typeof InstagramIcon }[] = [
  { id: "instagram", label: "Instagram", icon: InstagramIcon },
  { id: "facebook", label: "Facebook", icon: FacebookIcon },
  { id: "google", label: "Google", icon: GoogleIcon },
];

interface Variant {
  id: string;
  platform: Platform;
  caption: string;
}

// Mock generator — will be replaced by a real AI backend call. Output adapts
// to the brand tone and selected platforms so the flow feels genuine.
function mockGenerate(prompt: string, platforms: Platform[], brand: BrandProfile): Variant[] {
  const topic = prompt.trim().replace(/\.+$/, "");
  const keywords = brand.keywords.length
    ? brand.keywords.map((k) => `#${k.replace(/\s+/g, "")}`).join(" ")
    : "#local #community";

  const toneOpeners: Record<string, string> = {
    "Friendly & Approachable": "Hey neighbors! 👋",
    "Professional & Corporate": `An update from ${brand.businessName}:`,
    "Witty & Humorous": "Stop scrolling — this is important. 🚨",
    "Energetic & Bold": "BIG NEWS. 🔥",
  };
  const opener = toneOpeners[brand.tone] ?? "Hello!";

  const byPlatform: Record<Platform, (t: string) => string> = {
    instagram: (t) =>
      `${opener} ${t.charAt(0).toUpperCase() + t.slice(1)} — and we couldn't be more excited to share it with you. Come see for yourself, we're saving you a spot. ✨\n\n${keywords} #${brand.businessName.replace(/\s+/g, "")}`,
    facebook: (t) =>
      `${opener}\n\n${t.charAt(0).toUpperCase() + t.slice(1)}. We built ${brand.businessName} for this community, and updates like this are why we love what we do.\n\nDrop by this week and tell us what you think — your feedback shapes what we do next.`,
    google: (t) =>
      `${t.charAt(0).toUpperCase() + t.slice(1)} at ${brand.businessName}. Visit us this week to check it out — find our hours and directions below.`,
  };

  return platforms.map((p) => ({
    id: newId(),
    platform: p,
    caption: byPlatform[p](topic),
  }));
}

export function MagicCreator({
  brand,
  onSchedule,
  onGenerated,
}: {
  brand: BrandProfile;
  onSchedule: (post: ScheduledPost) => void;
  onGenerated: (count: number) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [selected, setSelected] = useState<Platform[]>(["instagram", "facebook"]);
  const [generating, setGenerating] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const toast = useToast();

  const togglePlatform = (p: Platform) => {
    setSelected((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  };

  const canGenerate = prompt.trim().length >= 8 && selected.length > 0 && !generating;

  const generate = () => {
    if (!canGenerate) return;
    setGenerating(true);
    setVariants([]);
    // Simulated latency until the AI backend is wired up.
    setTimeout(() => {
      setVariants(mockGenerate(prompt, selected, brand));
      setGenerating(false);
      onGenerated(bumpGenerationCount(selected.length));
    }, 1400);
  };

  const copy = async (caption: string) => {
    try {
      await navigator.clipboard.writeText(caption);
      toast("Caption copied to clipboard");
    } catch {
      toast("Couldn't copy — select the text manually", "error");
    }
  };

  const schedule = (variant: Variant) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    onSchedule({
      id: newId(),
      date: toDateKey(tomorrow),
      platform: variant.platform,
      title: prompt.trim().slice(0, 48) || "New post",
      caption: variant.caption,
      status: "scheduled",
    });
    toast("Scheduled for tomorrow — see it in your Calendar");
  };

  return (
    <>
      <header className="app-page-header">
        <div>
          <h1 className="app-page-title">Magic Creator</h1>
          <p className="app-page-subtitle">
            Describe what&apos;s happening at {brand.businessName} — the AI drafts posts in your{" "}
            {brand.tone.toLowerCase()} voice.
          </p>
        </div>
      </header>

      <div className="composer">
        <label htmlFor="creator-prompt" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          What&apos;s happening at your business?
        </label>
        <textarea
          id="creator-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. We just got a new batch of Ethiopian coffee beans in..."
          maxLength={280}
        />
        <div className="composer-footer">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PLATFORMS.map(({ id, label, icon: PlatformIcon }) => (
              <button
                key={id}
                className={`chip ${selected.includes(id) ? "selected" : ""}`}
                onClick={() => togglePlatform(id)}
                aria-pressed={selected.includes(id)}
              >
                <PlatformIcon size={15} />
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span className="composer-count">{prompt.length}/280</span>
            <button className="btn btn-accent" onClick={generate} disabled={!canGenerate} style={{ opacity: canGenerate ? 1 : 0.5 }}>
              {generating ? <LoaderIcon size={16} className="spin" /> : <SparklesIcon size={16} />}
              {generating ? "Drafting..." : "Generate"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 28 }}>
        {generating &&
          selected.map((p) => (
            <div key={p} className="result-card" aria-hidden="true">
              <div className="skeleton" style={{ width: 120, height: 24, marginBottom: 16 }} />
              <div className="skeleton" style={{ width: "100%", height: 14, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: "92%", height: 14, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: "64%", height: 14 }} />
            </div>
          ))}

        {variants.map((variant) => {
          const meta = PLATFORMS.find((p) => p.id === variant.platform)!;
          const PlatformIcon = meta.icon;
          return (
            <article key={variant.id} className="result-card">
              <div className="result-card-header">
                <span className="chip chip-static">
                  <span className={`content-row-platform platform-${variant.platform}`} style={{ width: 24, height: 24, borderRadius: 6 }}>
                    <PlatformIcon size={13} />
                  </span>
                  {meta.label} draft
                </span>
              </div>
              <p className="result-caption">{variant.caption}</p>
              <div className="result-actions">
                <button className="btn btn-outline btn-sm" onClick={() => copy(variant.caption)}>
                  <CopyIcon size={14} />
                  Copy
                </button>
                <button className="btn btn-accent btn-sm" onClick={() => schedule(variant)}>
                  <SendIcon size={14} />
                  Schedule
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
