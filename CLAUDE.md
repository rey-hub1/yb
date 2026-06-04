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

Static SPA — zero backend, zero DB. Vite + React 18.

**Entry:** `src/main.jsx` → `YearbookApp` (default export of `YearbookFlipbook.jsx`) → `#root`

**Source layout:**
- `src/components/YearbookFlipbook.jsx` — main app (~1300 lines), contains all sub-components and `STYLES` CSS string
- `src/components/AdminPanel.jsx` — color palette editor, uses Tailwind (only file that does)
- `src/data/classes.js` — `CLASSES` array (16 entries: id, name, pdf path, hue hex) and `THEMES` array
- `src/utils/colorExtractor.js` — PDF color extraction pipeline, palette builders, module-level `PDF_COLOR_CACHE` Map

**YearbookFlipbook sub-components (all defined in one file):**
- `FloatingParticles` — 25 animated SVG icons falling in background
- `FlipPage` — `React.forwardRef` wrapper for `HTMLFlipBook` pages
- `FlipBookViewer` — modal overlay for PDF reading
- `YearbookApp` — root: navbar, video banner, hero, foreword, class grid, footer

**FlipBookViewer flow:**
1. Class card click → `selected` state set with class data
2. `react-pdf` `<Document>` loads PDF from `classData.pdf` (files in `/public/yearbook/`)
3. PDF.js worker resolved via `new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url)` (bundled, not CDN)
4. `HTMLFlipBook` (react-pageflip) wraps `<Page>` components; navigation by 2 pages (spread view)
5. On page flip (editorial theme only): `extractPdfPalette` samples both pages via off-screen canvas, updates CSS vars on the overlay for a per-spread background color transition

**Color extraction (`colorExtractor.js`):**
- `extractPdfPalette(pdfUrl, pageNumber, fallbackColor)` — renders PDF page to canvas, samples pixels with position/vibrance weighting, returns `{primary, secondary, accent, left, right}` palette. Results cached in `PDF_COLOR_CACHE` (module-level Map, keyed `"pdfUrl::pageNumber"`).
- `buildPalette(primary, secondary?)` — derives full palette from 1–2 hex colors
- `getViewerThemeStyle(theme, palette)` — returns CSS custom property object for viewer overlay; only acts on `"editorial"` theme
- `getCardStyle(cls, index, theme, extractedPalettes)` — returns inline style for class cards

**State (YearbookApp):** `selected`, `extractedPalettes`, `searchQuery`, `darkMode`, `isPlaying`, `showVideoBanner`, `view`

**Admin panel:** Accessible via URL hash `#admin` or the footer button. Lets you preview/adjust per-class hue colors and extract palettes from PDFs. Does not persist — changes are for copy-paste into `classes.js`.

**Styling:** All CSS in `STYLES` template string constant at bottom of `YearbookFlipbook.jsx`, injected via `<style>{STYLES}</style>`. Uses CSS custom properties (`--yb-bg`, `--yb-ink`, `--yb-accent`, `--yb-overlay-*`, etc.) for dark mode and viewer theming. Tailwind is imported but only used in `AdminPanel.jsx`.

**Adding a new class:** Add entry to `CLASSES` in `src/data/classes.js` and place the PDF in `/public/yearbook/`.
