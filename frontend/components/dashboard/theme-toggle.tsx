"use client";

import { useState, useEffect } from "react";
import { SunIcon, MoonIcon } from "@/components/icons";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lb:theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("lb:theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("lb:theme", "light");
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
