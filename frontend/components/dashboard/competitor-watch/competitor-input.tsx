"use client";

import { useState } from "react";
import { XIcon } from "@/components/icons";
import type { TrackedCompetitor } from "@/lib/store";

interface CompetitorInputProps {
  competitors: TrackedCompetitor[];
  onAdd: (username: string) => void;
  onRemove: (id: string) => void;
  onLoadDemoData: () => void;
  maxCompetitors?: number;
}

export function CompetitorInput({
  competitors,
  onAdd,
  onRemove,
  onLoadDemoData,
  maxCompetitors = 3,
}: CompetitorInputProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleAddCompetitor = () => {
    const trimmed = input.trim();

    // Validate format: alphanumeric, dots, underscores, 1-30 chars
    const usernameRegex = /^[A-Za-z0-9._]{1,30}$/;

    if (!trimmed) {
      setError("Enter an Instagram handle");
      return;
    }

    if (!usernameRegex.test(trimmed.replace(/^@/, ""))) {
      setError("Invalid handle format (alphanumeric, dots, underscores only)");
      return;
    }

    if (competitors.length >= maxCompetitors) {
      setError(`Maximum ${maxCompetitors} competitors allowed`);
      return;
    }

    const normalized = trimmed.replace(/^@/, "");

    if (competitors.some((c) => c.username === normalized)) {
      setError("Already tracking this competitor");
      return;
    }

    onAdd(normalized);
    setInput("");
    setError("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddCompetitor();
    }
  };

  return (
    <div className="competitor-input-section">
      <div className="competitor-input-header">
        <h3>Add Competitors</h3>
        <span className="competitor-count">
          {competitors.length}/{maxCompetitors}
        </span>
      </div>

      <div className="competitor-input-form">
        <div className="competitor-input-field">
          <span className="input-prefix">@</span>
          <input
            type="text"
            placeholder="instagram_handle"
            value={input}
            onChange={(e) => {
              setInput(e.currentTarget.value);
              if (error) setError("");
            }}
            onKeyDown={handleKeyDown}
            disabled={competitors.length >= maxCompetitors}
            style={{ paddingLeft: "24px" }}
          />
          <button
            onClick={handleAddCompetitor}
            disabled={competitors.length >= maxCompetitors || !input.trim()}
            className="btn-add-competitor"
          >
            Add
          </button>
        </div>

        {error && <div className="competitor-input-error">{error}</div>}
      </div>

      {competitors.length > 0 && (
        <div className="competitor-chips">
          {competitors.map((c) => (
            <div key={c.id} className="competitor-chip">
              <span>@{c.username}</span>
              <button
                onClick={() => onRemove(c.id)}
                className="chip-remove"
                aria-label={`Remove ${c.username}`}
              >
                <XIcon size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {competitors.length === 0 && (
        <button
          onClick={onLoadDemoData}
          className="btn-load-demo"
          type="button"
        >
          Load Demo Data (3 coffee shop competitors)
        </button>
      )}
    </div>
  );
}
