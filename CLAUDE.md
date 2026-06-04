# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Dev server at http://localhost:5173
npm run build    # Production build → /dist
npm run preview  # Preview production build
```

No lint or test scripts configured.

## Architecture

Static SPA — zero backend, zero DB. All logic in one monolithic component.

**Entry:** `src/main.jsx` → `YearbookApp` → `#root`

**Single component:** `src/components/YearbookFlipbook.jsx` (~1100 lines)

Sections rendered top-to-bottom:
- `Navbar` — theme switcher (paper / modern / editorial)
- `Hero` — decorative header, changes per theme
- `Grid` — 16 class cards driven by hardcoded `CLASSES` array
- `Footer`
- `FlipBookViewer` — modal overlay, mounts when user picks a class

**FlipBookViewer flow:**
1. Class card click → `selected` state set with class data (id, name, PDF path, hue)
2. `react-pdf` loads PDF from `/yearbook/<class>.pdf` (files live in `/public/yearbook/`)
3. PDF.js worker loaded from Cloudflare CDN (hardcoded URL in component)
4. `HTMLFlipBook` (react-pageflip) wraps pages with flip animation
5. Navigation advances/retreats by 2 pages (spread view)

**State:** React hooks only — `theme`, `selected`, `numPages`, `loading`, `error`, `currentPage`. No Zustand/Redux.

**Styling:** All CSS embedded as template string constant `STYLES` inside the component (not in separate CSS files). Three themes use CSS custom properties (`--yb-bg`, `--yb-ink`, `--yb-accent`, etc.). Tailwind is imported but barely used.

**Adding a new class:** Add entry to `CLASSES` array and drop the PDF in `/public/yearbook/`.
