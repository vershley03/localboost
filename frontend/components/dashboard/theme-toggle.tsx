"use client";

import { useSyncExternalStore } from "react";
import { SunIcon, MoonIcon } from "@/components/icons";

// The <html data-theme> attribute is the source of truth: the inline script in
// the root layout sets it before first paint, and this component subscribes to
// it. Reading localStorage during render instead would make the server and
// client markup disagree on hydration.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function isDark() {
  return document.documentElement.getAttribute("data-theme") === "dark";
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  const toggle = () => {
    const next = !dark;
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try {
      localStorage.setItem("lb:theme", next ? "dark" : "light");
    } catch {
      // Storage can be unavailable (private mode, blocked cookies) — the theme
      // still applies for this page, it just won't be remembered.
    }
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
    >
      <span className={`theme-toggle-track ${dark ? "dark" : ""}`}>
        <span className="theme-toggle-thumb">
          {dark ? <MoonIcon size={12} /> : <SunIcon size={12} />}
        </span>
      </span>
    </button>
  );
}
