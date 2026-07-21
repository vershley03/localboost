"use client";

import { useState, useRef } from "react";
import { EyeDropperIcon, ImageIcon, XIcon } from "@/components/icons";
import { useToast } from "@/components/toast";
import {
  type BrandKit,
  type BrandColors,
  type VisualStylePreset,
  VISUAL_STYLE_PRESETS,
} from "@/lib/store";

// ── Color Picker with live swatch ────────────────────────────────────────────

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="brand-color-field">
      <label className="field-label" style={{ fontSize: 12, marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 40,
            height: 40,
            border: "2px solid var(--border)",
            borderRadius: 10,
            cursor: "pointer",
            padding: 2,
            background: "var(--bg-surface)",
          }}
        />
        <input
          type="text"
          className="input"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
          }}
          maxLength={7}
          style={{ width: 100, fontFamily: "monospace", fontSize: 14 }}
        />
      </div>
    </div>
  );
}

// ── Logo Dropzone ────────────────────────────────────────────────────────────

function LogoDropzone({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast("That file isn't an image", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("File too large (max 5 MB)", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Downscale for localStorage
      const img = new Image();
      img.onload = () => {
        const maxDim = 512;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        onChange(canvas.toDataURL("image/png", 0.9));
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div style={{ flex: 1 }}>
      <label className="field-label" style={{ fontSize: 12, marginBottom: 6 }}>
        {label}
      </label>
      <div
        className="logo-dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInput.current?.click()}
        style={{
          width: "100%",
          aspectRatio: "1",
          maxWidth: 160,
          border: "2px dashed var(--border)",
          borderRadius: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          background: "var(--bg-base)",
          transition: "border-color 0.2s",
        }}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={label}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: 12,
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                background: "rgba(0,0,0,0.5)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <XIcon size={12} />
            </button>
          </>
        ) : (
          <>
            <ImageIcon size={28} style={{ color: "var(--text-faint)", marginBottom: 6 }} />
            <span
              style={{
                fontSize: 11,
                color: "var(--text-faint)",
                fontWeight: 600,
                textAlign: "center",
                padding: "0 8px",
              }}
            >
              {hint}
            </span>
          </>
        )}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

// ── Visual Style Preset Cards ────────────────────────────────────────────────

const PRESET_EMOJIS: Record<VisualStylePreset, string> = {
  cozy_rustic: "🪵",
  modern_minimal: "◻️",
  bold_vibrant: "🎨",
  earthy_natural: "🌿",
  luxury_dark: "✨",
  custom: "🎛️",
};

function StylePresetCard({
  preset,
  selected,
  onClick,
}: {
  preset: VisualStylePreset;
  selected: boolean;
  onClick: () => void;
}) {
  const meta = VISUAL_STYLE_PRESETS[preset];
  return (
    <button
      className={`chip ${selected ? "selected" : ""}`}
      onClick={onClick}
      style={{
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 4,
        height: "auto",
        borderRadius: 12,
        minWidth: 140,
      }}
    >
      <span style={{ fontSize: 18 }}>{PRESET_EMOJIS[preset]}</span>
      <span style={{ fontSize: 13, fontWeight: 700 }}>{meta.label}</span>
      <span style={{ fontSize: 11, color: "var(--text-faint)", textAlign: "left" }}>
        {meta.description}
      </span>
    </button>
  );
}

// ── Color Preview Strip ──────────────────────────────────────────────────────

function ColorPreview({ colors }: { colors: BrandColors }) {
  return (
    <div style={{ display: "flex", gap: 0, borderRadius: 12, overflow: "hidden", height: 40, border: "1px solid var(--border)" }}>
      <div style={{ flex: 1, background: colors.primary }} title={`Primary: ${colors.primary}`} />
      <div style={{ flex: 1, background: colors.secondary }} title={`Secondary: ${colors.secondary}`} />
      <div style={{ flex: 1, background: colors.accent }} title={`Accent: ${colors.accent}`} />
    </div>
  );
}

// ── Main Brand Kit Tab ───────────────────────────────────────────────────────

export function BrandKitTab({
  kit,
  onSave,
}: {
  kit: BrandKit;
  onSave: (kit: BrandKit) => void;
}) {
  const [draft, setDraft] = useState<BrandKit>(kit);
  const toast = useToast();

  const set = <K extends keyof BrandKit>(key: K, value: BrandKit[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const setColor = (key: keyof BrandColors, value: string) =>
    setDraft((d) => ({ ...d, colors: { ...d.colors, [key]: value } }));

  const save = () => {
    onSave(draft);
    toast("Brand Kit saved — image generation now uses your palette");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Logo Section */}
      <div className="card card-lg" style={{ maxWidth: 640, padding: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Logo</h3>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
          Upload your primary logo and an icon/favicon variant.
        </p>
        <div style={{ display: "flex", gap: 24 }}>
          <LogoDropzone
            label="Primary Logo"
            hint="Drop logo here or click"
            value={draft.logoUrl}
            onChange={(url) => set("logoUrl", url)}
          />
          <LogoDropzone
            label="Icon / Favicon"
            hint="Square icon"
            value={draft.iconUrl}
            onChange={(url) => set("iconUrl", url)}
          />
        </div>
      </div>

      {/* Colors Section */}
      <div className="card card-lg" style={{ maxWidth: 640, padding: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Brand Colors</h3>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
          These colors are injected into AI image generation prompts.
        </p>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 20 }}>
          <ColorField label="Primary" value={draft.colors.primary} onChange={(v) => setColor("primary", v)} />
          <ColorField label="Secondary" value={draft.colors.secondary} onChange={(v) => setColor("secondary", v)} />
          <ColorField label="Accent" value={draft.colors.accent} onChange={(v) => setColor("accent", v)} />
        </div>
        <ColorPreview colors={draft.colors} />
      </div>

      {/* Visual Style Section */}
      <div className="card card-lg" style={{ maxWidth: 640, padding: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Visual Style</h3>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
          Choose a preset that matches your brand aesthetic. Used in DALL·E prompts.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          {(Object.keys(VISUAL_STYLE_PRESETS) as VisualStylePreset[]).map((preset) => (
            <StylePresetCard
              key={preset}
              preset={preset}
              selected={draft.visualStyle === preset}
              onClick={() => set("visualStyle", preset)}
            />
          ))}
        </div>
        {draft.visualStyle === "custom" && (
          <div className="field" style={{ marginTop: 12 }}>
            <label className="field-label" htmlFor="custom-style">
              Custom style description
            </label>
            <textarea
              id="custom-style"
              className="textarea"
              value={draft.customStylePrompt}
              onChange={(e) => set("customStylePrompt", e.target.value)}
              placeholder="e.g. Retro 70s diner aesthetic, neon signs, checkerboard floors..."
              maxLength={300}
              style={{ minHeight: 80 }}
            />
          </div>
        )}
      </div>

      <button className="btn btn-primary btn-lg" onClick={save} style={{ maxWidth: 640 }}>
        Save Brand Kit
      </button>
    </div>
  );
}
