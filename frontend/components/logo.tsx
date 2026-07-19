"use client";
import type { SVGProps } from "react";

type LogoProps = SVGProps<SVGSVGElement> & { size?: number };

/**
 * LocalBoost Logo Mark
 * Concept: Local (map pin) + Boost (growth arrow inside) + AI (sparkle star)
 * Colors: Ocean Blue #0284C7 -> Sky #38BDF8 -> Violet #8B5CF6
 * The mark is a rounded square with gradient, white symbol inside.
 * Perfectly represents the SaaS: AI-powered local growth
 */
export function LogoMark({ size = 36, ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id="lb-mark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="55%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" rx="240" fill="url(#lb-mark-grad)" />
      {/* Pin outline with hole */}
      <path
        fillRule="evenodd"
        fill="white"
        d="M 512 215 C 320 215 205 335 205 465 C 205 670 512 870 512 870 C 512 870 819 670 819 465 C 819 335 704 215 512 215 Z M 512 355 C 610 355 690 432 690 508 C 690 610 512 730 512 730 C 512 730 334 610 334 508 C 334 432 414 355 512 355 Z"
      />
      {/* Growth arrow shaft */}
      <path
        d="M 340 545 L 430 455 L 485 510 L 645 345"
        fill="none"
        stroke="white"
        strokeWidth="68"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrow head */}
      <path
        d="M 565 302 L 705 292 L 695 435 L 565 302 Z"
        fill="white"
        stroke="white"
        strokeWidth="18"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Sparkle */}
      <g transform="translate(830,180)">
        <path fill="white" d="M 0 -105 L 14 -14 L 105 0 L 14 14 L 0 105 L -14 14 L -105 0 L -14 -14 Z" />
      </g>
    </svg>
  );
}

/**
 * Simplified vector version for very small sizes (16-32px) - cleaner stroke
 */
export function LogoIcon({ size = 24, ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id="lb-icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#lb-icon-grad)" />
      <path
        fillRule="evenodd"
        fill="white"
        d="M16 6.7C11 6.7 7.2 10.1 7.2 14.2C7.2 20.5 16 27 16 27C16 27 24.8 20.5 24.8 14.2C24.8 10.1 21 6.7 16 6.7ZM16 10.8C18.8 10.8 21 12.9 21 15.4C21 18.2 16 22.2 16 22.2C16 22.2 11 18.2 11 15.4C11 12.9 13.2 10.8 16 10.8Z"
      />
      <path d="M10.5 17L12.8 14.6L14.4 16.2L19.5 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.2 9.4L21 9.1L20.7 13L17.2 9.4Z" fill="white" />
      <g transform="translate(25.5,5.5)">
        <path fill="white" d="M0 -2.8L0.35 -0.35L2.8 0L0.35 0.35L0 2.8L-0.35 0.35L-2.8 0L-0.35 -0.35Z" />
      </g>
    </svg>
  );
}

/**
 * Full logo with wordmark: LocalBoost
 * Local = #0F172A, Boost = gradient
 */
export function LocalBoostLogo({ size = 32, showText = true, iconSize }: { size?: number; showText?: boolean; iconSize?: number }) {
  const iSize = iconSize ?? size;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 12, lineHeight: 0 }}>
      <span
        style={{
          width: iSize,
          height: iSize,
          borderRadius: iSize * 0.27,
          background: "linear-gradient(135deg, #0284C7 0%, #0EA5E9 55%, #8B5CF6 100%)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(2,132,199,0.28)",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {/* Inline mini symbol for crisp scaling */}
        <svg width={iSize * 0.72} height={iSize * 0.72} viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path
            fillRule="evenodd"
            fill="white"
            d="M16 6.7C11 6.7 7.2 10.1 7.2 14.2C7.2 20.5 16 27 16 27C16 27 24.8 20.5 24.8 14.2C24.8 10.1 21 6.7 16 6.7ZM16 10.8C18.8 10.8 21 12.9 21 15.4C21 18.2 16 22.2 16 22.2C16 22.2 11 18.2 11 15.4C11 12.9 13.2 10.8 16 10.8Z"
            opacity="0.98"
          />
          <path d="M10.5 17L12.8 14.6L14.4 16.2L19.5 11" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 9.2L21 8.9L20.7 12.9L17 9.2Z" fill="white" />
          <g transform="translate(25.5,5.5)">
            <path fill="white" d="M0 -2.8L0.35 -0.35L2.8 0L0.35 0.35L0 2.8L-0.35 0.35L-2.8 0L-0.35 -0.35Z" />
          </g>
        </svg>
      </span>
      {showText && (
        <span style={{ fontSize: iSize * 0.56, fontWeight: 800, letterSpacing: "-0.5px", color: "#0F172A", fontFamily: "var(--font-jakarta), Plus Jakarta Sans, sans-serif", display: "inline-flex" }}>
          Local<span style={{ backgroundImage: "linear-gradient(135deg,#0284C7 0%,#8B5CF6 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Boost</span>
        </span>
      )}
    </span>
  );
}
