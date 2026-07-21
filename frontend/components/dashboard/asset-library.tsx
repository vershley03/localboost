"use client";

import { useState, useRef } from "react";
import {
  ImageIcon,
  SearchIcon,
  TrashIcon,
  UploadIcon,
  XIcon,
} from "@/components/icons";
import { useToast } from "@/components/toast";
import {
  type BrandAsset,
  addAsset,
  deleteAsset as storeDeleteAsset,
  newId,
} from "@/lib/store";

const ASSET_TYPES = ["all", "logo", "product", "lifestyle", "background"] as const;
type AssetFilter = (typeof ASSET_TYPES)[number];

function fileToDataUrl(file: File, maxDim = 1024): Promise<string> {
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
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("not an image"));
    };
    img.src = url;
  });
}

export function AssetLibrary({
  orgId,
  assets,
  onAssetsChange,
  onUseInCreator,
}: {
  orgId: string;
  assets: BrandAsset[];
  onAssetsChange: (assets: BrandAsset[]) => void;
  onUseInCreator?: (asset: BrandAsset) => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<AssetFilter>("all");
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<BrandAsset["type"]>("product");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<BrandAsset | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const filtered = assets.filter((a) => {
    if (filter !== "all" && a.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.type.includes(q)
      );
    }
    return true;
  });

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    let count = 0;
    const newAssets = [...assets];
    for (const file of Array.from(files).slice(0, 10)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) continue;
      try {
        const dataUrl = await fileToDataUrl(file);
        const asset = addAsset(orgId, {
          type: uploadType,
          name: file.name.replace(/\.[^.]+$/, ""),
          url: dataUrl,
          tags: [],
        });
        newAssets.unshift(asset);
        count++;
      } catch {
        // skip invalid files
      }
    }
    onAssetsChange(newAssets);
    setUploading(false);
    setShowUploadModal(false);
    if (count > 0) toast(`${count} asset${count > 1 ? "s" : ""} uploaded`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleUpload(e.dataTransfer.files);
  };

  const handleDelete = (assetId: string) => {
    storeDeleteAsset(orgId, assetId);
    const next = assets.filter((a) => a.id !== assetId);
    onAssetsChange(next);
    setPreviewAsset(null);
    toast("Asset deleted");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "8px 14px",
            flex: "1 1 200px",
            maxWidth: 320,
          }}
        >
          <SearchIcon size={16} style={{ color: "var(--text-faint)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets..."
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: 14,
              color: "var(--text-primary)",
              width: "100%",
              fontFamily: "inherit",
            }}
          />
        </div>
        <div className="view-toggle">
          {ASSET_TYPES.map((t) => (
            <button
              key={t}
              className={`view-toggle-btn ${filter === t ? "active" : ""}`}
              onClick={() => setFilter(t)}
            >
              {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <button
          className="btn btn-accent"
          onClick={() => setShowUploadModal(true)}
          style={{ marginLeft: "auto" }}
        >
          <UploadIcon size={16} /> Upload
        </button>
      </div>

      {/* Drop zone / Masonry grid */}
      {filtered.length === 0 ? (
        <div
          className="card card-lg"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 24px",
            textAlign: "center",
            border: "2px dashed var(--border)",
            cursor: "pointer",
          }}
          onClick={() => setShowUploadModal(true)}
        >
          <ImageIcon size={48} style={{ color: "var(--text-faint)", marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
            {assets.length === 0 ? "No assets yet" : "No matching assets"}
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Drag & drop images here or click Upload to add brand assets.
          </p>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((asset) => (
            <div
              key={asset.id}
              className="asset-card"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.2s",
                position: "relative",
              }}
              onClick={() => setPreviewAsset(asset)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.url}
                alt={asset.name}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div style={{ padding: "10px 12px" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {asset.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>
                  {asset.type} · used {asset.useCount}×
                </div>
              </div>
              {/* Quick actions on hover */}
              <div
                className="asset-card-actions"
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  display: "flex",
                  gap: 4,
                  opacity: 0,
                  transition: "opacity 0.2s",
                }}
              >
                <button
                  className="btn btn-sm"
                  style={{
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "4px 6px",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(asset.id);
                  }}
                  title="Delete"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="card card-lg"
            style={{ width: "100%", maxWidth: 460, padding: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>Upload Assets</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="field" style={{ marginBottom: 16 }}>
              <label className="field-label">Asset type</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["logo", "product", "lifestyle", "background"] as const).map((t) => (
                  <button
                    key={t}
                    className={`chip ${uploadType === t ? "selected" : ""}`}
                    onClick={() => setUploadType(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleUpload(e.dataTransfer.files);
              }}
              onClick={() => fileInput.current?.click()}
              style={{
                border: "2px dashed var(--border)",
                borderRadius: 16,
                padding: "48px 24px",
                textAlign: "center",
                cursor: "pointer",
                background: "var(--bg-base)",
              }}
            >
              <UploadIcon size={32} style={{ color: "var(--text-faint)", marginBottom: 12 }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)" }}>
                {uploading ? "Uploading..." : "Drop images here or click to browse"}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 4 }}>
                Max 10 files · 10 MB each · PNG, JPG, WebP
              </p>
            </div>

            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                handleUpload(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      )}

      {/* Preview / detail drawer */}
      {previewAsset && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setPreviewAsset(null)}
        >
          <div
            className="card card-lg"
            style={{ width: "100%", maxWidth: 540, padding: 0, overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewAsset.url}
              alt={previewAsset.name}
              style={{ width: "100%", maxHeight: 400, objectFit: "contain", background: "#f1f5f9" }}
            />
            <div style={{ padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
                {previewAsset.name}
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
                {previewAsset.type} · Used {previewAsset.useCount} time
                {previewAsset.useCount !== 1 ? "s" : ""}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {onUseInCreator && (
                  <button
                    className="btn btn-accent"
                    onClick={() => {
                      onUseInCreator(previewAsset);
                      setPreviewAsset(null);
                    }}
                  >
                    Use in Creator
                  </button>
                )}
                <button
                  className="btn btn-outline"
                  style={{ color: "#EA4335" }}
                  onClick={() => handleDelete(previewAsset.id)}
                >
                  <TrashIcon size={14} /> Delete
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setPreviewAsset(null)}
                  style={{ marginLeft: "auto" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
