"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@/components/icons";

function getInitialDarkMode() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("lb:theme") === "dark";
}

export function ThemeToggle() {
  const [dark, setDark] = useState(getInitialDarkMode);

  useEffect(() => {
    if (dark) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("lb:theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("lb:theme", "light");
    }
  }, [dark]);

  const toggle = () => {
    setDark((value) => !value);
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
