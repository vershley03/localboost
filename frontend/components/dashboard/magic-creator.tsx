"use client";

import { useRef, useState, useEffect } from "react";
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
  RefreshIcon
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

// Downscale an image file
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

// Minimal fallback if the real API fails
function templateGenerate(prompt: string, platforms: Platform[], brand: BrandProfile): Variant[] {
  return platforms.map((p) => ({
    id: newId(),
    platform: p,
    caption: `[Template Fallback] Check out what's new at ${brand.businessName}: ${prompt} ✨ #${p}`,
    source: "template",
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
  const [generatingImage, setGeneratingImage] = useState(false);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [image, setImage] = useState<string | null>(null);
  
  // Scheduling Modal State
  const [scheduleVariant, setScheduleVariant] = useState<Variant | null>(null);
  const [scheduleDate, setScheduleDate] = useState<string>("");
  const [scheduleTime, setScheduleTime] = useState<string>("17:00");
  
  const fileInput = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const togglePlatform = (p: Platform) => {
    setSelected((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast("That file isn't an image", "error");
    try {
      setImage(await fileToDataUrl(file));
    } catch {
      toast("Couldn't read that image", "error");
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt) return toast("Type a prompt first to generate an image", "error");
    setGeneratingImage(true);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, brand })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setImage(data.imageUrl);
        toast("AI Image generated successfully!");
      } else {
        toast("Missing API Key or failed to generate", "error");
      }
    } catch {
      toast("Error generating image", "error");
    }
    setGeneratingImage(false);
  };

  const generateIdeas = async () => {
    setLoadingIdeas(true);
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand })
      });
      const data = await res.json();
      if (data.ideas) {
        setIdeas(data.ideas);
      } else {
        toast("Missing API Key or failed to get ideas", "error");
      }
    } catch {
      toast("Failed to get ideas", "error");
    }
    setLoadingIdeas(false);
  };

  const generate = async () => {
    if (prompt.trim().length < 5 || selected.length === 0 || generating) return;
    setGenerating(true);
    setVariants([]);

    let results: Variant[] | null = null;
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, platforms: selected, brand, image: image ?? undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.posts) {
          results = data.posts.map((p: any) => ({
            id: newId(),
            platform: p.platform,
            caption: p.caption,
            source: "openai" as const,
          }));
        }
      }
    } catch {}

    if (!results || results.length === 0) {
      await new Promise((r) => setTimeout(r, 600));
      results = templateGenerate(prompt, selected, brand);
      toast("AI unavailable — using templates (Is OPENAI_API_KEY set?)", "error");
    }

    setVariants(results);
    setGenerating(false);
    onGenerated(bumpGenerationCount(results.length));
  };

  const regenerateVariant = async (index: number, platform: Platform) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, platforms: [platform], brand }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.posts && data.posts.length > 0) {
          const newVariants = [...variants];
          newVariants[index].caption = data.posts[0].caption;
          setVariants(newVariants);
          toast("Draft regenerated!");
        }
      }
    } catch {
      toast("Failed to regenerate", "error");
    }
    setGenerating(false);
  };

  const updateVariantCaption = (index: number, newCaption: string) => {
    const newVariants = [...variants];
    newVariants[index].caption = newCaption;
    setVariants(newVariants);
  };

  const copy = async (caption: string) => {
    try {
      await navigator.clipboard.writeText(caption);
      toast("Caption copied to clipboard");
    } catch {
      toast("Couldn't copy — select the text manually", "error");
    }
  };

  const finalizeSchedule = () => {
    if (!scheduleVariant || !scheduleDate) return;
    onSchedule({
      id: newId(),
      date: scheduleDate,
      time: scheduleTime,
      platform: scheduleVariant.platform,
      title: prompt.trim().slice(0, 48) || "New post",
      caption: scheduleVariant.caption,
      status: "scheduled",
      imageUrl: image ?? undefined,
    });
    toast(`Scheduled for ${scheduleDate} at ${scheduleTime}`);
    setScheduleVariant(null);
  };

  const suggestTime = (platform: Platform) => {
    // Mock best times per platform
    if (platform === 'instagram') setScheduleTime("18:00");
    else if (platform === 'facebook') setScheduleTime("12:00");
    else setScheduleTime("09:00");
    toast("Applied suggested best time");
  };

  return (
    <>
      <header className="app-page-header">
        <div>
          <h1 className="app-page-title">Magic Creator</h1>
          <p className="app-page-subtitle">
            Describe what&apos;s happening at {brand.businessName} — the AI drafts posts in your {brand.tone.toLowerCase()} voice.
          </p>
        </div>
      </header>

      <div className="composer">
        <textarea
          id="creator-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What's the topic? (e.g. New coffee beans arriving today!)"
          maxLength={500}
        />

        {image && (
          <div className="composer-attachment">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Attached to post" />
            <button className="composer-attachment-remove" onClick={() => setImage(null)}>
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
            <button className={`chip ${image ? "selected" : ""}`} onClick={() => fileInput.current?.click()}>
              <ImageIcon size={15} /> Upload Photo
            </button>
            <button className="chip" onClick={handleGenerateImage} disabled={generatingImage}>
              {generatingImage ? <LoaderIcon size={15} className="spin" /> : <SparklesIcon size={15} />} 
              Generate Image
            </button>
            
            <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 8px' }}></div>

            {PLATFORMS.map(({ id, label, icon: PlatformIcon }) => (
              <button
                key={id}
                className={`chip ${selected.includes(id) ? "selected" : ""}`}
                onClick={() => togglePlatform(id)}
              >
                <PlatformIcon size={15} />
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button className="btn btn-accent" onClick={generate} disabled={prompt.trim().length < 5 || generating}>
              {generating ? <LoaderIcon size={16} className="spin" /> : <SparklesIcon size={16} />}
              {generating ? "Drafting..." : "Generate Posts"}
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Content Ideas State (If empty prompt) */}
      {!prompt && variants.length === 0 && (
        <div style={{ marginTop: '32px', background: '#FFFFFF', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--accent-subtle)', color: 'var(--accent)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <SparklesIcon size={24} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Writer's Block?</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Let AI generate a week of content ideas tailored perfectly for {brand.businessName}.</p>
          
          {ideas.length === 0 ? (
            <button className="btn btn-primary" onClick={generateIdeas} disabled={loadingIdeas}>
              {loadingIdeas ? "Brainstorming..." : "Generate Weekly Ideas"}
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', marginTop: '24px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px' }}>Tap an idea to draft:</div>
              {ideas.map((idea, i) => (
                <button 
                  key={i} 
                  style={{ padding: '16px', background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'left', fontSize: '15px', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => setPrompt(idea)}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  {idea}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Generated Variants */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 28 }}>
        {variants.map((variant, index) => {
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
              
              {/* INLINE EDITING: Textarea instead of static paragraph */}
              <textarea 
                className="result-caption" 
                value={variant.caption}
                onChange={(e) => updateVariantCaption(index, e.target.value)}
                style={{ width: '100%', minHeight: '100px', border: '1px solid transparent', background: 'transparent', resize: 'none', padding: '8px', fontSize: '16px', lineHeight: '1.5', fontFamily: 'inherit', color: 'var(--text-primary)' }}
                onFocus={(e) => e.currentTarget.style.border = '1px dashed var(--border)'}
                onBlur={(e) => e.currentTarget.style.border = '1px solid transparent'}
              />

              <div className="result-actions">
                <button className="btn btn-outline btn-sm" onClick={() => regenerateVariant(index, variant.platform)}>
                  <RefreshIcon size={14} />
                  Regenerate
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => copy(variant.caption)}>
                  <CopyIcon size={14} />
                  Copy
                </button>
                <button className="btn btn-accent btn-sm" onClick={() => {
                  const tmrw = new Date(); tmrw.setDate(tmrw.getDate() + 1);
                  setScheduleDate(toDateKey(tmrw));
                  setScheduleVariant(variant);
                }}>
                  <SendIcon size={14} />
                  Schedule...
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Scheduling Modal */}
      {scheduleVariant && (
        <div className="modal-overlay" onClick={() => setScheduleVariant(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Schedule for {scheduleVariant.platform.charAt(0).toUpperCase() + scheduleVariant.platform.slice(1)}</h2>
              <button className="icon-btn" onClick={() => setScheduleVariant(null)}><XIcon size={18} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="field-label">Date</label>
                <input type="date" className="input" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
              </div>
              
              <div>
                <label className="field-label">Time</label>
                <input type="time" className="input" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <button className="btn btn-outline btn-sm" onClick={() => suggestTime(scheduleVariant.platform)}>
                  <SparklesIcon size={14} /> Auto-suggest best time
                </button>
                <button className="btn btn-accent" onClick={finalizeSchedule}>Confirm Schedule</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
