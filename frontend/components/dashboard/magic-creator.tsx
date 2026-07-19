"use client";

import { useRef, useState } from "react";
import {
  CopyIcon,
  FacebookIcon,
  GoogleIcon,
  ImageIcon,
  InstagramIcon,
  LoaderIcon,
  SendIcon,
  SparklesIcon,
  XIcon,
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
  source: "openai" | "template";
}

// Local fallback when the AI backend is unavailable (no key, no credits,
// offline). Output adapts to brand tone and platform so the flow still works.
function templateGenerate(
  prompt: string,
  platforms: Platform[],
  brand: BrandProfile,
): Variant[] {
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
    source: "template",
  }));
}

// Downscale an image file to a small JPEG data URL so it fits comfortably in
// localStorage and in the vision request.
function fileToDataUrl(file: File, maxDim = 768): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas unavailable"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("not an image"));
    };
    img.src = url;
  });
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
  const [image, setImage] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const togglePlatform = (p: Platform) => {
    setSelected((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  };

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("That file isn't an image", "error");
      return;
    }
    try {
      setImage(await fileToDataUrl(file));
    } catch {
      toast("Couldn't read that image", "error");
    }
  };

  const canGenerate = prompt.trim().length >= 8 && selected.length > 0 && !generating;

  const generate = async () => {
    if (!canGenerate) return;
    setGenerating(true);
    setVariants([]);

    let results: Variant[] | null = null;
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          platforms: selected,
          brand,
          image: image ?? undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        results = (data.posts as { platform: Platform; caption: string }[])
          .filter((p) => selected.includes(p.platform))
          .map((p) => ({
            id: newId(),
            platform: p.platform,
            caption: p.caption,
            source: "openai" as const,
          }));
      }
    } catch {
      // network failure — fall through to template generator
    }

    if (!results || results.length === 0) {
      // Brief pause so the skeleton doesn't flash jarringly on instant fallback.
      await new Promise((r) => setTimeout(r, 600));
      results = templateGenerate(prompt, selected, brand);
      toast("AI unavailable right now — using template drafts", "error");
    }

    setVariants(results);
    setGenerating(false);
    onGenerated(bumpGenerationCount(results.length));
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
      imageUrl: image ?? undefined,
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

        {image && (
          <div className="composer-attachment">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Attached to post" />
            <button
              className="composer-attachment-remove"
              onClick={() => setImage(null)}
              aria-label="Remove image"
            >
              <XIcon size={13} />
            </button>
          </div>
        )}

        <div className="composer-footer">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                pickImage(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              className={`chip ${image ? "selected" : ""}`}
              onClick={() => fileInput.current?.click()}
              aria-label={image ? "Replace image" : "Add image"}
            >
              <ImageIcon size={15} />
              {image ? "Replace image" : "Add image"}
            </button>
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
                {variant.source === "template" && (
                  <span className="badge badge-draft">Template</span>
                )}
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
