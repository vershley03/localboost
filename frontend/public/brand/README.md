# PinSpark Logo — Brand Kit

**Concept:** Pin (map pin) + Spark (growth arrow + sparkle star)

The SaaS functionality: AI-powered marketing that sparks growth for local businesses.
- **Location pin outline** = local business, community, physical presence
- **Upward trending arrow inside pin** = growth, spark, more walk-ins, more engagement
- **Sparkle star top-right** = AI magic, automated content creation

## Colors (matches site theme)

- Ocean Blue `#0284C7` — primary accent, trust, tech
- Sky Blue `#0EA5E9` / `#38BDF8` — mid gradient
- Violet `#8B5CF6` — AI, creativity, premium
- Slate `#0F172A` — text primary
- Background `#F8FAFC` / `#FFFFFF`

Gradient used: `135deg, #0284C7 0%, #0EA5E9 55%, #8B5CF6 100%`
Matches `globals.css` variables `--accent` and `--violet`, mesh blobs in hero.

## Files

- `logo-icon.svg` — vector mark, infinite scalability (source of truth)
- `logo-full.svg` / `logo-full.svg` (in public/) — icon + wordmark
- `logo-mark-raw-1024.png` — AI-generated raw master (1254x1254) that inspired vector
- `logo-512.png` / `icon-512.png` — raster 512, 192, favicon-32
- `favicon.ico` — multi-res 16,32,48,64 for browser tabs
- `og-image.png` — 1200x630 Open Graph

In Next.js App Router:
- `frontend/app/favicon.ico` — browser favicon
- `frontend/app/icon.png` (1024) — PWA, Google search icon
- `frontend/app/apple-icon.png` (180) — iOS
- `frontend/app/icon.svg` — modern SVG icon fallback
- `frontend/public/manifest.json` — PWA manifest references PNGs

## Usage in Code

`frontend/components/logo.tsx` exports:

- `LogoMark` — full 1024 viewBox with gradient + detailed paths (for large displays)
- `LogoIcon` — simplified 32x32 version for small UI (16-32px)
- `PinSparkLogo` — complete navbar component: gradient rounded square + symbol + text "PinSpark" where "Spark" is gradient-text clipped. Used in:
  - `app/page.tsx` landing navbar + footer
  - `components/dashboard/nav.tsx` sidebar + mobile topbar

Wordmark: "Pin" = #0F172A, "Spark" = gradient blue->violet to highlight the spark/value proposition.

## Why it works at small size (favicon)

At 16px, pin + arrow + sparkle remain recognizable because:
- Thick white stroke on pin (~2px equivalent)
- Arrow shaft is 1.9px white line with arrow head triangle
- Sparkle is 2.8px 4-point star separated from pin
- Gradient background keeps contrast high vs white symbol

Tested as favicon: distinctive vs generic zap icon, reflects functionality.
