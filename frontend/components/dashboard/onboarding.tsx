"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckIcon,
  FacebookIcon,
  GoogleIcon,
  InstagramIcon,
  LoaderIcon,
  SparklesIcon,
  TwitterXIcon,
} from "@/components/icons";
import { PinSparkLogo } from "@/components/logo";
import {
  CATEGORIES,
  PLATFORM_BEST_TIME,
  TONES,
  newId,
  toDateKey,
  type BrandProfile,
  type Platform,
  type ScheduledPost,
} from "@/lib/store";
import { getPreset, renderStarterCaption, type StarterIdea } from "@/lib/starterContent";

const PLATFORMS: { id: Platform; label: string; icon: typeof InstagramIcon }[] = [
  { id: "instagram", label: "Instagram", icon: InstagramIcon },
  { id: "facebook", label: "Facebook", icon: FacebookIcon },
  { id: "x", label: "X", icon: TwitterXIcon },
  { id: "google", label: "Google", icon: GoogleIcon },
];

const STEP_LABELS = ["Your business", "Your voice", "Your channels"];

interface GenerateResponse {
  posts?: Array<{ platform: Platform; caption: string }>;
}

/**
 * Ask the AI for a caption, falling back to the category's starter copy.
 * The wizard must always produce a post — a first run that ends with an error
 * toast and an empty calendar is worse than one that ends with decent copy.
 */
async function draftCaption(
  idea: StarterIdea,
  brand: BrandProfile,
  platform: Platform,
): Promise<string> {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: idea.prompt, platforms: [platform], brand }),
    });
    if (res.ok) {
      const data = (await res.json()) as GenerateResponse;
      const caption = data.posts?.[0]?.caption;
      if (caption && caption.trim()) return caption.trim();
    }
  } catch {
    // fall through to the preset copy
  }
  return renderStarterCaption(idea, brand.businessName);
}

export function Onboarding({
  brand,
  onComplete,
}: {
  brand: BrandProfile;
  /** Persists the brand and the starter posts, then closes the wizard. */
  onComplete: (brand: BrandProfile, posts: ScheduledPost[]) => void;
}) {
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState(brand.businessName);
  const [category, setCategory] = useState(brand.category || CATEGORIES[0]);
  const [tone, setTone] = useState(brand.tone || TONES[0]);
  const [audience, setAudience] = useState(brand.audience);
  const [keywords, setKeywords] = useState<string[]>(brand.keywords);
  const [platforms, setPlatforms] = useState<Platform[]>(["instagram", "facebook"]);
  const [building, setBuilding] = useState(false);
  const [usedAi, setUsedAi] = useState(true);
  const [created, setCreated] = useState<ScheduledPost[] | null>(null);
  const nameInput = useRef<HTMLInputElement>(null);

  // `preventScroll` matters here: the overlay scrolls on short viewports, and a
  // plain autoFocus yanks the card header off screen on mount.
  useEffect(() => {
    if (step === 0) nameInput.current?.focus({ preventScroll: true });
  }, [step]);

  const preset = getPreset(category);
  const trimmedName = businessName.trim();

  const draft = (): BrandProfile => ({
    businessName: trimmedName,
    category,
    tone,
    audience: audience.trim(),
    keywords,
  });

  // Moving to step 2 prefills audience and keywords from the category so the
  // user is confirming a sensible default rather than facing empty fields.
  const goToVoice = () => {
    if (!audience.trim()) setAudience(preset.audience);
    if (keywords.length === 0) setKeywords(preset.keywords);
    setStep(1);
  };

  const togglePlatform = (p: Platform) =>
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const build = async () => {
    const nextBrand = draft();
    const targets = platforms.length > 0 ? platforms : (["instagram"] as Platform[]);
    const ideas = getPreset(category).ideas.slice(0, 3);

    setBuilding(true);

    // One post per idea, cycling through the chosen channels, spread over the
    // next three days at each platform's best slot.
    const results = await Promise.all(
      ideas.map(async (idea, i) => {
        const platform = targets[i % targets.length];
        const caption = await draftCaption(idea, nextBrand, platform);
        const date = new Date();
        date.setDate(date.getDate() + i + 1);
        const post: ScheduledPost = {
          id: newId(),
          date: toDateKey(date),
          time: PLATFORM_BEST_TIME[platform],
          platform,
          title: idea.title,
          caption,
          status: "draft",
        };
        return { post, fromPreset: caption === renderStarterCaption(idea, nextBrand.businessName) };
      }),
    );

    setUsedAi(results.some((r) => !r.fromPreset));
    setCreated(results.map((r) => r.post));
    setBuilding(false);
  };

  const finish = () => onComplete(draft(), created ?? []);

  const skip = () => onComplete(draft(), []);

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-label="Set up your workspace">
      <div className="onboarding-card">
        <div className="onboarding-brand">
          <PinSparkLogo size={30} />
        </div>

        {created ? (
          <ReadyStep
            posts={created}
            businessName={trimmedName}
            usedAi={usedAi}
            onFinish={finish}
          />
        ) : building ? (
          <div className="onboarding-building">
            <LoaderIcon size={32} className="spin" />
            <h2 className="onboarding-title">Writing your first posts…</h2>
            <p className="onboarding-sub">
              Drafting three posts for {trimmedName} in a {tone.toLowerCase()} voice.
            </p>
          </div>
        ) : (
          <>
            <ol className="onboarding-steps" aria-label="Progress">
              {STEP_LABELS.map((label, i) => (
                <li
                  key={label}
                  className={`onboarding-step ${i === step ? "current" : ""} ${i < step ? "done" : ""}`}
                  aria-current={i === step ? "step" : undefined}
                >
                  <span className="onboarding-step-dot">
                    {i < step ? <CheckIcon size={12} /> : i + 1}
                  </span>
                  <span className="onboarding-step-label">{label}</span>
                </li>
              ))}
            </ol>

            {step === 0 && (
              <>
                <h2 className="onboarding-title">Let&apos;s set up your workspace</h2>
                <p className="onboarding-sub">
                  Two quick questions, then we&apos;ll draft your first posts.
                </p>

                <div className="field">
                  <label className="field-label" htmlFor="ob-name">
                    What&apos;s your business called?
                  </label>
                  <input
                    id="ob-name"
                    className="input"
                    ref={nameInput}
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && trimmedName) goToVoice();
                    }}
                    placeholder="e.g. Rosewood Barbers"
                  />
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="ob-category">
                    What kind of business is it?
                  </label>
                  <select
                    id="ob-category"
                    className="select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <span className="field-hint">
                    We use this to suggest content that fits your industry.
                  </span>
                </div>

                <div className="onboarding-actions">
                  <button
                    className="btn btn-accent btn-lg"
                    onClick={goToVoice}
                    disabled={!trimmedName}
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="onboarding-title">How should {trimmedName} sound?</h2>
                <p className="onboarding-sub">
                  Every caption we write uses this voice. You can change it any time in Brand DNA.
                </p>

                <div className="field">
                  <span className="field-label">Brand voice</span>
                  <div className="onboarding-chip-row">
                    {TONES.map((t) => (
                      <button
                        key={t}
                        className={`chip ${tone === t ? "selected" : ""}`}
                        onClick={() => setTone(t)}
                        aria-pressed={tone === t}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="ob-audience">
                    Who are you talking to?
                  </label>
                  <textarea
                    id="ob-audience"
                    className="textarea"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="Who are your customers?"
                  />
                  <span className="field-hint">
                    We&apos;ve suggested one based on your category — edit it to match your customers.
                  </span>
                </div>

                <div className="onboarding-actions">
                  <button className="btn btn-ghost" onClick={() => setStep(0)}>
                    Back
                  </button>
                  <button className="btn btn-accent btn-lg" onClick={() => setStep(2)}>
                    Continue
                  </button>
                </div>
                <button className="onboarding-skip" onClick={skip}>
                  Skip setup for now
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="onboarding-title">Where do you post?</h2>
                <p className="onboarding-sub">
                  We&apos;ll write your starter posts for these channels. Connecting the accounts
                  comes later — nothing publishes without your say-so.
                </p>

                <div className="field">
                  <div className="onboarding-chip-row">
                    {PLATFORMS.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        className={`chip ${platforms.includes(id) ? "selected" : ""}`}
                        onClick={() => togglePlatform(id)}
                        aria-pressed={platforms.includes(id)}
                      >
                        <Icon size={15} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="onboarding-actions">
                  <button className="btn btn-ghost" onClick={() => setStep(1)}>
                    Back
                  </button>
                  <button
                    className="btn btn-accent btn-lg"
                    onClick={build}
                    disabled={platforms.length === 0}
                  >
                    <SparklesIcon size={16} />
                    Create my first posts
                  </button>
                </div>
                <button className="onboarding-skip" onClick={skip}>
                  Skip setup for now
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ReadyStep({
  posts,
  businessName,
  usedAi,
  onFinish,
}: {
  posts: ScheduledPost[];
  businessName: string;
  usedAi: boolean;
  onFinish: () => void;
}) {
  return (
    <>
      <div className="onboarding-ready-badge">
        <CheckIcon size={16} />
      </div>
      <h2 className="onboarding-title">
        {posts.length} drafts ready for {businessName}
      </h2>
      <p className="onboarding-sub">
        {usedAi
          ? "They're saved as drafts on your calendar — review, edit, then schedule whichever you like."
          : "Written from our starter templates because AI generation is unavailable right now. Edit them to sound like you, or regenerate any of them in Magic Creator."}
      </p>

      <ul className="onboarding-preview">
        {posts.map((post) => {
          const PlatformIcon =
            PLATFORMS.find((p) => p.id === post.platform)?.icon ?? InstagramIcon;
          return (
          <li key={post.id} className="onboarding-preview-item">
            <span className={`content-row-platform platform-${post.platform}`}>
              <PlatformIcon size={15} />
            </span>
            <div className="onboarding-preview-body">
              <div className="onboarding-preview-title">{post.title}</div>
              <p className="onboarding-preview-caption">{post.caption}</p>
            </div>
          </li>
          );
        })}
      </ul>

      <div className="onboarding-actions">
        <button className="btn btn-accent btn-lg" onClick={onFinish}>
          Open my dashboard
        </button>
      </div>
    </>
  );
}
