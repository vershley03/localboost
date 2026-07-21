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
  TwitterXIcon,
  RefreshIcon
} from "@/components/icons";
import { useToast } from "@/components/toast";
import {
  bumpGenerationCount,
  buildImagePrompt,
  newId,
  toDateKey,
  type BrandAsset,
  type BrandKit,
  type BrandProfile,
  type Platform,
  type ScheduledPost,
  bumpAssetUseCount,
} from "@/lib/store";

const PLATFORMS: { id: Platform; label: string; icon: typeof InstagramIcon }[] = [
  { id: "instagram", label: "Instagram", icon: InstagramIcon },
  { id: "facebook", label: "Facebook", icon: FacebookIcon },
  { id: "x", label: "X", icon: TwitterXIcon },
  { id: "google", label: "Google", icon: GoogleIcon },
];

interface Variant {
  id: string;
  platform: Platform;
  caption: string;
  source: "openai" | "template";
}

const CHAR_LIMITS: Record<Platform, number> = {
  x: 280,
  instagram: 2200,
  facebook: 63206,
  google: 1500,
};

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

function cropDataUrl(dataUrl: string, aspectRatio: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;
      
      const currentRatio = img.width / img.height;
      if (currentRatio > aspectRatio) {
        sourceWidth = img.height * aspectRatio;
        sourceX = (img.width - sourceWidth) / 2;
      } else {
        sourceHeight = img.width / aspectRatio;
        sourceY = (img.height - sourceHeight) / 2;
      }
      
      canvas.width = sourceWidth;
      canvas.height = sourceHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
      }
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = () => reject(new Error("Failed to load image for cropping"));
    img.src = dataUrl;
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
  orgId,
  brand,
  brandKit,
  assets,
  onSchedule,
  onGenerated,
}: {
  orgId: string;
  brand: BrandProfile;
  brandKit: BrandKit;
  assets: BrandAsset[];
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
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [showAssetDrawer, setShowAssetDrawer] = useState(false);
  const [previewVariant, setPreviewVariant] = useState<Variant | null>(null);
  
  // Custom Tone & Audience Overrides
  const [tone, setTone] = useState(brand.tone);
  const [audience, setAudience] = useState(brand.audience);
  
  // Scheduling Modal State
  const [scheduleVariant, setScheduleVariant] = useState<Variant | null>(null);
  const [scheduleDate, setScheduleDate] = useState<string>("");
  const [scheduleTime, setScheduleTime] = useState<string>("17:00");
  const [suggestReason, setSuggestReason] = useState<string | null>(null);
  
  const fileInput = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const applyCrop = async (aspectRatio: number) => {
    if (!originalImage) return;
    try {
      const cropped = await cropDataUrl(originalImage, aspectRatio);
      setImage(cropped);
      toast("Image cropped successfully!");
    } catch {
      toast("Failed to crop image", "error");
    }
  };

  const resetCrop = () => {
    if (originalImage) {
      setImage(originalImage);
      toast("Image reset to original");
    }
  };

  const togglePlatform = (p: Platform) => {
    setSelected((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast("That file isn't an image", "error");
    try {
      const dataUrl = await fileToDataUrl(file);
      setImage(dataUrl);
      setOriginalImage(dataUrl);
    } catch {
      toast("Couldn't read that image", "error");
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt) return toast("Type a prompt first to generate an image", "error");
    setGeneratingImage(true);
    try {
      const enhancedPrompt = buildImagePrompt(prompt, brand, brandKit);
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: enhancedPrompt, brand, brandKit })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setImage(data.imageUrl);
        setOriginalImage(data.imageUrl);
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
        body: JSON.stringify({ prompt, platforms: selected, brand, customTone: tone, customAudience: audience, image: image ?? undefined }),
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
    onGenerated(bumpGenerationCount(orgId, results.length));
  };

  const regenerateVariant = async (index: number, platform: Platform) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, platforms: [platform], brand, customTone: tone, customAudience: audience }),
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
    const suggestions: Record<Platform, { time: string; reason: string }> = {
      instagram: { time: "18:00", reason: "6:00 PM suggested — peak engagement for visual content; followers are most active after work hours" },
      facebook: { time: "12:00", reason: "12:00 PM suggested — lunchtime scroll window; highest organic reach for local business pages" },
      x: { time: "14:00", reason: "2:00 PM suggested — mid-afternoon peak; trending topics gain maximum impressions at this hour" },
      google: { time: "09:00", reason: "9:00 AM suggested — morning search surge; Google Business posts surface during peak local intent queries" },
    };
    const s = suggestions[platform];
    setScheduleTime(s.time);
    setSuggestReason(s.reason);
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

        {generatingImage && !image && (
          <div className="composer-attachment">
            <div className="image-gen-shimmer">
              <div className="shimmer-icon"><SparklesIcon size={24} /></div>
              <div className="shimmer-text">Generating AI image…</div>
            </div>
          </div>
        )}

        {image && (
          <div className="composer-attachment">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Attached to post" />
            <button className="composer-attachment-remove" onClick={() => { setImage(null); setOriginalImage(null); }}>
              <XIcon size={13} />
            </button>
            {originalImage && (
              <div className="crop-controls">
                <button className="chip" onClick={() => applyCrop(1)}>1:1</button>
                <button className="chip" onClick={() => applyCrop(4/5)}>4:5</button>
                <button className="chip" onClick={() => applyCrop(16/9)}>16:9</button>
                <button className="chip" onClick={resetCrop}>Reset</button>
              </div>
            )}
          </div>
        )}

        <div className="composer-toolbar" style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginRight: 8 }}>Platforms:</span>
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

            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginRight: 8 }}>Media:</span>
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
                <ImageIcon size={15} /> Upload
              </button>
              <button className="chip" onClick={handleGenerateImage} disabled={generatingImage}>
                {generatingImage ? <LoaderIcon size={15} className="spin" /> : <SparklesIcon size={15} />} 
                AI Image
              </button>
              {assets.length > 0 && (
                <button className="chip" onClick={() => setShowAssetDrawer(true)}>
                  <ImageIcon size={15} /> Library ({assets.length})
                </button>
              )}
            </div>
          </div>

          {/* AI Steering Controls */}
          <div style={{ background: "var(--bg-base)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" }}>
             <div>
                <label style={{ display: "block", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, color: "var(--text-faint)", marginBottom: 8 }}>
                  Brand Tone
                </label>
                <select className="form-select" style={{ width: "100%", fontSize: 14 }} value={tone} onChange={e => setTone(e.target.value)}>
                  <option value="Professional">Professional</option>
                  <option value="Casual & Friendly">Casual & Friendly</option>
                  <option value="Witty & Humorous">Witty & Humorous</option>
                  <option value="Urgent & Exciting">Urgent & Exciting</option>
                  <option value={brand.tone}>Brand Default ({brand.tone})</option>
                </select>
             </div>
             <div>
                <label style={{ display: "block", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, color: "var(--text-faint)", marginBottom: 8 }}>
                  Target Audience
                </label>
                <textarea 
                  className="form-input" 
                  style={{ width: "100%", fontSize: 14, resize: "none", height: "42px", paddingTop: "10px" }} 
                  value={audience} 
                  onChange={e => setAudience(e.target.value)} 
                  placeholder="e.g. Local professionals, college students, and coffee enthusiasts in the downtown area" 
                />
             </div>
          </div>
        </div>

        <div style={{ padding: "16px 20px", background: "var(--bg-surface)", borderTop: "1px solid var(--border)", borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
          <button 
            className="btn btn-accent btn-lg" 
            style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }} 
            onClick={generate} 
            disabled={generating || prompt.trim().length < 5 || selected.length === 0}
          >
            {generating ? <LoaderIcon size={18} className="spin" /> : <SparklesIcon size={18} />}
            Generate Drafts
          </button>
        </div>
      </div>

      {/* Weekly Content Ideas State (If empty prompt) */}
      {!prompt && variants.length === 0 && (
        <div style={{ marginTop: '32px', background: 'var(--bg-surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ margin: '0 auto 24px', display: 'flex', justifyContent: 'center' }}>
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="40" fill="var(--bg-secondary)" />
              <path d="M40 70 L 60 70 M 50 20 L 50 30 M 25 45 L 35 45 M 65 45 L 75 45 M 32 28 L 39 35 M 68 28 L 61 35" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
              <path d="M40 70 C 40 60, 30 55, 30 45 C 30 30, 70 30, 70 45 C 70 55, 60 60, 60 70 Z" fill="#FFF" stroke="var(--violet)" strokeWidth="4" strokeLinejoin="round" />
              <circle cx="50" cy="85" r="3" fill="var(--coral)" />
              <circle cx="30" cy="20" r="4" fill="var(--accent)" />
              <circle cx="75" cy="75" r="5" fill="var(--violet)" />
            </svg>
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
                  style={{ padding: '16px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'left', fontSize: '15px', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s' }}
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
            <article key={variant.id} className="result-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)', borderRadius: '16px' }}>
              {/* Mockup Header */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border)' }}>
                <div className="org-avatar small" style={{ marginRight: '12px' }}>{brand.businessName.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{brand.businessName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Sponsored</div>
                </div>
                <span className={`content-row-platform platform-${variant.platform}`} style={{ width: 24, height: 24, borderRadius: 6 }}>
                  <PlatformIcon size={13} />
                </span>
              </div>
              
              {/* Mockup Image */}
              {image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="Post image" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '400px', objectFit: 'cover' }} />
              )}
              
              {/* Mockup Actions Bar */}
              <div style={{ display: 'flex', gap: '16px', padding: '12px 16px', color: 'var(--text-primary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </div>

              {/* Caption Editor */}
              {(() => {
                const limit = CHAR_LIMITS[variant.platform];
                const len = variant.caption.length;
                const pct = len / limit;
                const counterColor = pct > 1 ? "#EA4335" : pct > 0.9 ? "#F59E0B" : "var(--text-faint)";
                const overLimit = len > limit;
                return (
                  <div style={{ padding: '0 16px 16px 16px' }}>
                    <textarea 
                      className="result-caption" 
                      value={variant.caption}
                      onChange={(e) => updateVariantCaption(index, e.target.value)}
                      style={{ width: '100%', minHeight: '100px', border: '1px dashed transparent', background: 'transparent', resize: 'vertical', padding: '8px', fontSize: '15px', lineHeight: '1.5', fontFamily: 'inherit', color: 'var(--text-primary)', borderRadius: '8px', transition: 'border 0.2s' }}
                      onFocus={(e) => e.currentTarget.style.border = '1px dashed var(--border)'}
                      onBlur={(e) => e.currentTarget.style.border = '1px dashed transparent'}
                    />
                    <div className="char-counter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 4, padding: '0 8px' }}>
                      {overLimit && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#EA4335', background: 'rgba(234, 67, 53, 0.1)', padding: '2px 8px', borderRadius: 4 }}>
                          Over limit!
                        </span>
                      )}
                      <div style={{ height: 3, flex: 1, maxWidth: 80, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(pct * 100, 100)}%`, background: counterColor, borderRadius: 3, transition: 'width 0.2s, background 0.2s' }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: counterColor, fontVariantNumeric: 'tabular-nums', transition: 'color 0.2s' }}>
                        {len}/{limit}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="result-actions" style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderTop: '1px solid var(--border)', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => regenerateVariant(index, variant.platform)}>
                    <RefreshIcon size={14} />
                    Rewrite
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => copy(variant.caption)}>
                    <CopyIcon size={14} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => {
                    onSchedule({
                      id: variant.id,
                      date: new Date().toISOString().split('T')[0],
                      platform: variant.platform,
                      title: prompt.substring(0, 30) + '...',
                      caption: variant.caption,
                      status: "draft",
                      imageUrl: image ?? undefined,
                    });
                    setVariants(v => v.filter(x => x.id !== variant.id));
                    toast("Saved to Drafts");
                  }}>
                    Save Draft
                  </button>
                  {(() => {
                    const isOverLimit = variant.caption.length > CHAR_LIMITS[variant.platform];
                    return (
                      <div style={{ position: 'relative' }} className="schedule-btn-wrapper">
                        <button
                          className="btn btn-accent btn-sm"
                          disabled={isOverLimit}
                          onClick={() => {
                            const tmrw = new Date(); tmrw.setDate(tmrw.getDate() + 1);
                            setScheduleDate(toDateKey(tmrw));
                            setSuggestReason(null);
                            setScheduleVariant(variant);
                          }}
                          title={isOverLimit ? `Caption exceeds ${CHAR_LIMITS[variant.platform]} character limit for ${meta.label}` : undefined}
                        >
                          <SendIcon size={14} />
                          Schedule...
                        </button>
                        {isOverLimit && (
                          <div className="over-limit-banner">
                            ⚠️ Exceeds {meta.label} limit — trim {variant.caption.length - CHAR_LIMITS[variant.platform]} chars to schedule
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
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
                <input type="time" className="input" value={scheduleTime} onChange={(e) => { setScheduleTime(e.target.value); setSuggestReason(null); }} />
              </div>

              <button className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => suggestTime(scheduleVariant.platform)}>
                <SparklesIcon size={14} /> Auto-suggest best time
              </button>

              {suggestReason && (
                <div className="suggest-reason-tooltip">
                  <SparklesIcon size={14} />
                  <span>{suggestReason}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '10px' }}>
                <button className="btn btn-accent" onClick={finalizeSchedule}>Confirm Schedule</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asset Library Drawer */}
      {showAssetDrawer && (
        <div
          className="modal-overlay"
          onClick={() => setShowAssetDrawer(false)}
        >
          <div
            className="modal"
            style={{ maxWidth: 600, maxHeight: "80vh", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Asset Library</h2>
              <button className="icon-btn" onClick={() => setShowAssetDrawer(false)}>
                <XIcon size={18} />
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: 12,
                padding: "16px 0",
              }}
            >
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  style={{
                    background: "var(--bg-base)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    overflow: "hidden",
                    cursor: "pointer",
                    padding: 0,
                    transition: "border-color 0.2s",
                  }}
                  onClick={() => {
                    setImage(asset.url);
                    setOriginalImage(asset.url);
                    bumpAssetUseCount(orgId, asset.id);
                    setShowAssetDrawer(false);
                    toast(`Using "${asset.name}" from library`);
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.url}
                    alt={asset.name}
                    style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }}
                  />
                  <div style={{ padding: "6px 8px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {asset.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
