import React, { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

// ─── Data ─────────────────────────────────────────────────────────────────────
const CLASSES = [
  { id: 1,  name: "RPL 1", pdf: "/yearbook/RPL-1.pdf", hue: "#2B4C7E" },
  { id: 2,  name: "RPL 2", pdf: "/yearbook/RPL-2.pdf", hue: "#1A365D" },
  { id: 3,  name: "TKJ 1", pdf: "/yearbook/TKJ-1.pdf", hue: "#276749" },
  { id: 4,  name: "TKJ 2", pdf: "/yearbook/TKJ-2.pdf", hue: "#22543D" },
  { id: 5,  name: "MP 1",  pdf: "/yearbook/MP-1.pdf",  hue: "#C05621" },
  { id: 6,  name: "MP 2",  pdf: "/yearbook/MP-2.pdf",  hue: "#9B2C2C" },
  { id: 7,  name: "DPB 1", pdf: "/yearbook/DPB-1.pdf", hue: "#553C9A" },
  { id: 8,  name: "DPB 2", pdf: "/yearbook/DPB-2.pdf", hue: "#44337A" },
  { id: 9,  name: "DPB 3", pdf: "/yearbook/DPB-3.pdf", hue: "#702459" },
  { id: 10, name: "AK 1",  pdf: "/yearbook/AK-1.pdf",  hue: "#744210" },
  { id: 11, name: "AK 2",  pdf: "/yearbook/AK-2.pdf",  hue: "#C05A00" },
  { id: 12, name: "AK 3",  pdf: "/yearbook/AK-3.pdf",  hue: "#7B341E" },
  { id: 13, name: "BR 1",  pdf: "/yearbook/BR-1.pdf",  hue: "#234E52" },
  { id: 14, name: "BR 2",  pdf: "/yearbook/BR-2.pdf",  hue: "#1D4044" },
  { id: 15, name: "BD 1",  pdf: "/yearbook/BD-1.pdf",  hue: "#C53030" },
  { id: 16, name: "BD 2",  pdf: "/yearbook/BD-2.pdf",  hue: "#9B1C1C" },
];

const THEMES = [
  { id: "paper",     label: "Kertas"    },
  { id: "modern",    label: "Modern"    },
  { id: "editorial", label: "Editorial" },
];

const PAGE_W = 520;
const PAGE_H = 740;

function useBookScale() {
  const calc = () => {
    const vw = window.innerWidth;
    if (vw >= 900) return 1;
    return Math.min(1, (vw - 32) / (PAGE_W * 2));
  };
  const [scale, setScale] = useState(calc);
  useEffect(() => {
    const fn = () => setScale(calc());
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return scale;
}

// ─── FlipPage wrapper ─────────────────────────────────────────────────────────
const FlipPage = React.forwardRef(function FlipPage({ children, theme }, ref) {
  const bg = theme === "editorial" ? "#ffffff" : theme === "modern" ? "#ffffff" : "#faf3e4";
  return (
    <div ref={ref} style={{ width: PAGE_W, height: PAGE_H, background: bg, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {children}
    </div>
  );
});

// ─── Theme Switcher ───────────────────────────────────────────────────────────
function ThemeSwitcher({ theme, setTheme }) {
  return (
    <div className="yb-theme-switcher">
      <span className="yb-theme-label">Tema</span>
      <div className="yb-theme-pills">
        {THEMES.map((t) => (
          <button
            key={t.id}
            className={`yb-theme-pill${theme === t.id ? " yb-theme-pill--active" : ""}`}
            onClick={() => setTheme(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Flipbook Viewer ──────────────────────────────────────────────────────────
function FlipBookViewer({ classData, theme, onClose }) {
  const [numPages, setNumPages]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const flipBookRef = useRef(null);
  const scale = useBookScale();

  const handleLoadSuccess = useCallback(({ numPages: n }) => { setNumPages(n); setLoading(false); }, []);
  const handleLoadError   = useCallback((error) => { setError(error.message); setLoading(false); }, []);

  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const totalSpreads  = numPages ? Math.ceil(numPages / 2) : 0;
  const currentSpread = Math.floor(currentPage / 2);

  return (
    <div className={`yb-overlay yb-overlay--${theme}`}>
      {/* Header */}
      <div className="yb-viewer-header">
        <div className="yb-viewer-meta">
          <span className="yb-viewer-eyebrow">Yearbook 2024</span>
          <h2 className="yb-viewer-title">{classData.name}</h2>
          {numPages && (
            <span className="yb-viewer-count">
              Hal. {currentPage + 1}–{Math.min(currentPage + 2, numPages)} / {numPages}
            </span>
          )}
        </div>
        <div className="yb-viewer-actions">
          <a href={classData.pdf} download className="yb-dl-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span className="yb-dl-btn-text">Unduh PDF</span>
          </a>
          <button onClick={onClose} className="yb-close-btn" aria-label="Tutup">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Book */}
      <div className="yb-book-area">
        {loading && (
          <div className="yb-loading-state">
            <div className="yb-spinner" />
            <p className="yb-loading-label">Membuka halaman…</p>
          </div>
        )}
        {error && !loading && (
          <div className="yb-error-state">
            <span>✦</span>
            <p>Gagal memuat PDF:</p>
            <code>{error}</code>
          </div>
        )}
        <Document file={classData.pdf} onLoadSuccess={handleLoadSuccess} onLoadError={handleLoadError} loading={null}>
          {!loading && !error && numPages && (
            <div className="yb-book-shell" style={scale < 1 ? { transform: `scale(${scale})`, transformOrigin: "top center", marginBottom: `${-(PAGE_H * (1 - scale))}px` } : {}}>
              <HTMLFlipBook
                ref={flipBookRef}
                width={PAGE_W} height={PAGE_H}
                size="fixed"
                minWidth={PAGE_W} maxWidth={PAGE_W}
                minHeight={PAGE_H} maxHeight={PAGE_H}
                showCover={true} flippingTime={780}
                drawShadow={true} maxShadowOpacity={0.55}
                showPageCorners={true} disableFlipByClick={false}
                usePortrait={false} mobileScrollSupport={true}
                onFlip={(e) => setCurrentPage(e.data)}
                className="yb-flipbook"
              >
                {Array.from({ length: numPages }, (_, i) => (
                  <FlipPage key={i} theme={theme}>
                    <Page pageNumber={i + 1} width={PAGE_W} renderTextLayer={false} renderAnnotationLayer={false} />
                  </FlipPage>
                ))}
              </HTMLFlipBook>
            </div>
          )}
        </Document>
      </div>

      {/* Nav */}
      {!loading && !error && numPages && (
        <div className="yb-nav">
          <button onClick={() => flipBookRef.current?.pageFlip().flipPrev()} className="yb-nav-btn">← Sebelumnya</button>
          <div className="yb-dots">
            {Array.from({ length: totalSpreads }, (_, i) => (
              <button key={i} onClick={() => flipBookRef.current?.pageFlip().flip(i * 2)}
                className={`yb-dot${currentSpread === i ? " active" : ""}`} />
            ))}
          </div>
          <button onClick={() => flipBookRef.current?.pageFlip().flipNext()} className="yb-nav-btn">Berikutnya →</button>
        </div>
      )}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function YearbookApp() {
  const [theme,    setTheme]    = useState("paper");
  const [selected, setSelected] = useState(null);

  return (
    <>
      <style>{STYLES}</style>
      <div className={`yb-page yb-theme--${theme}`}>

        {/* Dekorasi per-tema */}
        <div className="yb-grain" aria-hidden="true" />
        <div className="yb-ruled" aria-hidden="true" />
        <div className="yb-editorial-stripe" aria-hidden="true" />

        {/* ── Navbar ──────────────────────────── */}
        <nav className="yb-navbar">
          <span className="yb-navbar-brand">
            <span className="yb-navbar-logo">YB</span>
            Yearbook 2024
          </span>
          <ThemeSwitcher theme={theme} setTheme={setTheme} />
        </nav>

        {/* ── Hero ────────────────────────────── */}
        <header className="yb-hero">
          {/* Paper dekorasi */}
          <div className="yb-tape yb-tape--left"  aria-hidden="true" />
          <div className="yb-tape yb-tape--right" aria-hidden="true" />
          <div className="yb-stamp-ring"           aria-hidden="true"><span>ABADI</span></div>

          {/* Modern dekorasi */}
          <div className="yb-modern-badge" aria-hidden="true">
            <svg viewBox="0 0 60 68" fill="none">
              <path d="M30 2L58 16V38C58 52 45 63 30 66C15 63 2 52 2 38V16L30 2Z" stroke="currentColor" strokeWidth="2"/>
              <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize="11" fontFamily="inherit" fill="currentColor">2024</text>
            </svg>
          </div>

          <p className="yb-eyebrow">
            <span className="yb-eyebrow-rule" />
            T.A. 2023 / 2024
            <span className="yb-eyebrow-rule" />
          </p>

          <h1 className="yb-hero-title">
            Year<em>book</em>
          </h1>

          <p className="yb-hero-sub">SMA Negeri &mdash; Kenangan Bersama</p>
        </header>

        {/* ── Grid ────────────────────────────── */}
        <main className="yb-main">
          <p className="yb-section-label">Pilih Kelas</p>
          <div className="yb-grid">
            {CLASSES.map((cls, i) => (
              <button
                key={cls.id}
                onClick={() => setSelected(cls)}
                className="yb-card"
                style={
                  theme === "editorial"
                    ? { "--delay": `${i * 40}ms` }
                    : { "--hue": cls.hue, "--delay": `${i * 40}ms` }
                }
              >
                <div className="yb-card-tab" />
                <div className="yb-card-corner" />
                <div className="yb-card-hole" />
                <div className="yb-card-number">{String(cls.id).padStart(2, "0")}</div>
                <div className="yb-card-inner">
                  <span className="yb-card-grade">Kelas</span>
                  <span className="yb-card-name">{cls.name}</span>
                  <div className="yb-card-rule" />
                  <span className="yb-card-cta">Buka ↗</span>
                </div>
              </button>
            ))}
          </div>
        </main>

        <footer className="yb-footer">
          <span className="yb-footer-rule" />
          <p>Kenangan tak pernah pudar &bull; 2024</p>
          <span className="yb-footer-rule" />
        </footer>
      </div>

      {selected && (
        <FlipBookViewer classData={selected} theme={theme} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Lora:ital,wght@0,400;0,500;1,400&family=Caveat:wght@400;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Archivo+Black&family=Archivo:wght@400;500;600&display=swap');

/* ════════════════════════════════════════
   TOKEN DEFAULTS (paper theme)
   ════════════════════════════════════════ */
:root {
  --yb-bg:          #f2e8d5;
  --yb-bg-dk:       #e8d8be;
  --yb-bg-lt:       #faf5ec;
  --yb-ink:         #2c1b0e;
  --yb-ink-mid:     #6b4c30;
  --yb-ink-faint:   #b89a7a;
  --yb-accent:      #c1654a;
  --yb-border:      #c9ac86;
  --yb-navbar-bg:   #e8d8be;
  --yb-overlay-bg:  #1c1208;
  --yb-overlay-hdr: rgba(201,172,134,0.12);
  --yb-overlay-txt: #f2e8d5;
  --yb-overlay-dim: rgba(242,232,213,0.45);
  --yb-page-font:   'Lora', Georgia, serif;
  --yb-title-font:  'DM Serif Display', serif;
  --yb-hand-font:   'Caveat', cursive;
  --yb-card-bg:     #faf5ec;
  --yb-card-radius: 3px;
  --yb-card-shadow: 2px 3px 0 #e8d8be, 3px 5px 0 #c9ac86;
  --yb-card-hover-shadow: 4px 8px 0 #e8d8be, 6px 12px 0 #c9ac86, 0 20px 40px rgba(44,27,14,0.14);
  --yb-card-hover-rot: -0.5deg;
  --yb-pill-bg:     rgba(201,172,134,0.18);
  --yb-pill-active-bg: var(--yb-accent);
  --yb-pill-active-txt: #fff;
  --yb-pill-txt:    var(--yb-ink-mid);
}

/* ════════════════════════════════════════
   MODERN THEME
   ════════════════════════════════════════ */
.yb-theme--modern {
  --yb-bg:          #f0f5ff;
  --yb-bg-dk:       #dde6f7;
  --yb-bg-lt:       #ffffff;
  --yb-ink:         #0f1f3d;
  --yb-ink-mid:     #3d5a8a;
  --yb-ink-faint:   #8aabcf;
  --yb-accent:      #2563eb;
  --yb-border:      #c5d5ee;
  --yb-navbar-bg:   #ffffff;
  --yb-overlay-bg:  #0a1628;
  --yb-overlay-hdr: rgba(37,99,235,0.08);
  --yb-overlay-txt: #e8f0fe;
  --yb-overlay-dim: rgba(232,240,254,0.45);
  --yb-page-font:   'Plus Jakarta Sans', sans-serif;
  --yb-title-font:  'Plus Jakarta Sans', sans-serif;
  --yb-hand-font:   'Plus Jakarta Sans', sans-serif;
  --yb-card-bg:     #ffffff;
  --yb-card-radius: 14px;
  --yb-card-shadow: 0 1px 3px rgba(15,31,61,0.07), 0 4px 14px rgba(15,31,61,0.05);
  --yb-card-hover-shadow: 0 8px 32px rgba(37,99,235,0.14), 0 2px 8px rgba(15,31,61,0.08);
  --yb-card-hover-rot: 0deg;
  --yb-pill-bg:     rgba(37,99,235,0.08);
  --yb-pill-active-bg: #2563eb;
  --yb-pill-active-txt: #fff;
  --yb-pill-txt:    #3d5a8a;
}

/* ════════════════════════════════════════
   EDITORIAL THEME
   ════════════════════════════════════════ */
.yb-theme--editorial {
  --yb-bg:          #f7f9f2;
  --yb-bg-dk:       #e4edda;
  --yb-bg-lt:       #ffffff;
  --yb-ink:         #0f1a0b;
  --yb-ink-mid:     #2e5c22;
  --yb-ink-faint:   #6a9e58;
  --yb-accent:      #FFF001;
  --yb-border:      #0f1a0b;
  --yb-navbar-bg:   #0f2d0a;
  --yb-overlay-bg:  #0a1f07;
  --yb-overlay-hdr: rgba(255,240,1,0.08);
  --yb-overlay-txt: #ffffff;
  --yb-overlay-dim: rgba(255,255,255,0.4);
  --yb-page-font:   'Archivo', sans-serif;
  --yb-title-font:  'Archivo Black', sans-serif;
  --yb-hand-font:   'Archivo', sans-serif;
  --yb-card-bg:     #009B4D;
  --yb-card-radius: 0px;
  --yb-card-shadow: 5px 5px 0 #0f1a0b;
  --yb-card-hover-shadow: 8px 8px 0 #0f1a0b;
  --yb-card-hover-rot: 0deg;
  --yb-pill-bg:     rgba(255,255,255,0.08);
  --yb-pill-active-bg: #FFF001;
  --yb-pill-active-txt: #0f1a0b;
  --yb-pill-txt:    rgba(255,255,255,0.55);
}

/* ════════════════════════════════════════
   BASE
   ════════════════════════════════════════ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
button { border: none; background: none; cursor: pointer; }

.yb-page {
  min-height: 100vh;
  background: var(--yb-bg);
  color: var(--yb-ink);
  font-family: var(--yb-page-font);
  position: relative;
  overflow-x: hidden;
  transition: background 0.35s ease, color 0.35s ease;
}

/* ── Texture decorations ─────────────────── */
.yb-grain {
  position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
  transition: opacity 0.35s;
}
.yb-theme--modern .yb-grain,
.yb-theme--editorial .yb-grain { opacity: 0.01; }

.yb-ruled {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image: repeating-linear-gradient(transparent, transparent 31px, rgba(180,140,90,0.09) 31px, rgba(180,140,90,0.09) 32px);
  transition: opacity 0.35s;
}
.yb-theme--modern .yb-ruled,
.yb-theme--editorial .yb-ruled { opacity: 0; }

/* Editorial bold stripe top */
.yb-editorial-stripe {
  position: fixed; top: 0; left: 0; right: 0; height: 6px;
  background: var(--yb-accent);
  z-index: 100;
  opacity: 0; pointer-events: none;
  transition: opacity 0.35s;
}
.yb-theme--editorial .yb-editorial-stripe { opacity: 1; }

/* ════════════════════════════════════════
   NAVBAR
   ════════════════════════════════════════ */
.yb-navbar {
  position: relative; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32px;
  height: 60px;
  background: var(--yb-navbar-bg);
  border-bottom: 1.5px solid var(--yb-border);
  transition: background 0.35s, border-color 0.35s;
}

.yb-theme--modern .yb-navbar {
  box-shadow: 0 1px 0 var(--yb-border), 0 4px 24px rgba(15,31,61,0.06);
}

.yb-theme--editorial .yb-navbar {
  border-bottom-color: transparent;
  padding-top: 6px; /* offset stripe */
}

.yb-navbar-brand {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--yb-title-font);
  font-size: 17px;
  font-weight: 700;
  color: var(--yb-ink);
  letter-spacing: -0.01em;
  transition: color 0.35s;
}

.yb-theme--editorial .yb-navbar-brand { color: #ffffff; }

.yb-navbar-logo {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: var(--yb-accent);
  color: #fff;
  font-family: var(--yb-title-font);
  font-size: 13px;
  font-weight: 900;
  border-radius: var(--yb-card-radius);
  letter-spacing: 0;
  flex-shrink: 0;
  transition: background 0.35s, border-radius 0.35s;
}

.yb-theme--editorial .yb-navbar-logo {
  border-radius: 0;
  font-family: 'Archivo Black', sans-serif;
}

/* ── Theme Switcher ──────────────────────── */
.yb-theme-switcher {
  display: flex; align-items: center; gap: 10px;
}

.yb-theme-label {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--yb-ink-faint);
  font-family: var(--yb-hand-font);
  transition: color 0.35s;
}

.yb-theme--editorial .yb-theme-label { color: rgba(255,255,255,0.35); }

.yb-theme-pills {
  display: flex; align-items: center;
  gap: 4px;
  padding: 3px;
  background: var(--yb-pill-bg);
  border-radius: 99px;
  border: 1.5px solid var(--yb-border);
  transition: background 0.35s, border-color 0.35s;
}

.yb-theme--editorial .yb-theme-pills {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.1);
  border-radius: 0;
}

.yb-theme-pill {
  padding: 5px 14px;
  border-radius: 99px;
  font-size: 12px;
  font-family: var(--yb-page-font);
  font-weight: 500;
  color: var(--yb-pill-txt);
  background: transparent;
  transition: background 0.2s, color 0.2s, border-radius 0.35s;
  white-space: nowrap;
}

.yb-theme--editorial .yb-theme-pill { border-radius: 0; }

.yb-theme-pill--active {
  background: var(--yb-pill-active-bg);
  color: var(--yb-pill-active-txt);
}

.yb-theme-pill:not(.yb-theme-pill--active):hover {
  background: rgba(128,128,128,0.12);
}

/* ════════════════════════════════════════
   HERO
   ════════════════════════════════════════ */
.yb-hero {
  position: relative; z-index: 1;
  text-align: center;
  padding: 64px 24px 52px;
  border-bottom: 1.5px solid var(--yb-border);
  background: linear-gradient(180deg, var(--yb-bg-lt) 0%, var(--yb-bg) 100%);
  overflow: hidden;
  transition: background 0.35s, border-color 0.35s, padding 0.35s;
}

/* Editorial hero gets big bg text */
.yb-theme--editorial .yb-hero::before {
  content: "YB";
  position: absolute;
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(200px, 35vw, 400px);
  color: rgba(0,0,0,0.04);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  letter-spacing: -0.05em;
  line-height: 1;
  white-space: nowrap;
}

/* Modern hero geometric accent */
.yb-theme--modern .yb-hero {
  background: linear-gradient(135deg, #f0f5ff 0%, #e8f0fe 50%, #f0f5ff 100%);
}

/* ── Paper tape ──────────────────────────── */
.yb-tape {
  position: absolute; top: 24px;
  width: 56px; height: 22px;
  background: rgba(201,172,134,0.4);
  border: 1px solid rgba(180,140,80,0.25);
  transition: opacity 0.35s;
}
.yb-tape--left  { left: 60px;  transform: rotate(-4deg); }
.yb-tape--right { right: 60px; transform: rotate(3deg); }
.yb-theme--modern .yb-tape,
.yb-theme--editorial .yb-tape { opacity: 0; pointer-events: none; }

/* ── Paper stamp ring ────────────────────── */
.yb-stamp-ring {
  display: inline-flex; align-items: center; justify-content: center;
  width: 68px; height: 68px; border-radius: 50%;
  border: 2px dashed var(--yb-accent);
  opacity: 0.5;
  margin-bottom: 20px;
  transition: opacity 0.35s;
}
.yb-stamp-ring span {
  font-family: 'Caveat', cursive;
  font-size: 11px; letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--yb-accent);
  transform: rotate(-15deg);
}
.yb-theme--modern .yb-stamp-ring,
.yb-theme--editorial .yb-stamp-ring { opacity: 0; pointer-events: none; }

/* ── Modern badge shield ─────────────────── */
.yb-modern-badge {
  display: flex; align-items: center; justify-content: center;
  width: 60px; height: 68px;
  color: var(--yb-accent);
  margin: 0 auto 16px;
  opacity: 0; pointer-events: none;
  transition: opacity 0.35s;
}
.yb-modern-badge svg { width: 100%; height: 100%; }
.yb-theme--modern .yb-modern-badge { opacity: 0.7; }

.yb-eyebrow {
  display: flex; align-items: center; justify-content: center; gap: 14px;
  font-family: var(--yb-hand-font);
  font-size: 15px;
  color: var(--yb-ink-mid);
  letter-spacing: 0.1em;
  margin-bottom: 16px;
  transition: color 0.35s, font-family 0.01s;
}

.yb-eyebrow-rule {
  display: inline-block; width: 36px; height: 1px;
  background: var(--yb-ink-faint);
  transition: background 0.35s;
}

.yb-theme--modern .yb-eyebrow { letter-spacing: 0.2em; text-transform: uppercase; font-size: 12px; font-weight: 600; }
.yb-theme--editorial .yb-eyebrow { display: none; }

.yb-hero-title {
  font-family: var(--yb-title-font);
  font-size: clamp(58px, 11vw, 104px);
  font-weight: 400;
  line-height: 0.92;
  color: var(--yb-ink);
  letter-spacing: -0.02em;
  margin-bottom: 16px;
  transition: color 0.35s, font-family 0.01s, font-weight 0.01s;
}

.yb-theme--modern .yb-hero-title {
  font-weight: 800;
  font-size: clamp(52px, 9vw, 90px);
}

.yb-theme--editorial .yb-hero-title {
  font-family: 'Archivo Black', sans-serif;
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 0.85;
  font-size: clamp(64px, 14vw, 130px);
}

.yb-hero-title em {
  font-style: italic;
  color: var(--yb-accent);
  transition: color 0.35s;
}
.yb-theme--modern .yb-hero-title em  { font-style: normal; }
.yb-theme--editorial .yb-hero-title em { font-style: normal; }

.yb-hero-sub {
  font-family: var(--yb-page-font);
  font-size: 15px;
  color: var(--yb-ink-mid);
  letter-spacing: 0.08em;
  transition: color 0.35s;
}

.yb-theme--editorial .yb-hero-sub {
  display: inline-block;
  background: var(--yb-accent);
  color: white;
  padding: 4px 14px;
  font-family: 'Archivo', sans-serif;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-top: 12px;
}

/* ════════════════════════════════════════
   MAIN & SECTION LABEL
   ════════════════════════════════════════ */
.yb-main {
  position: relative; z-index: 1;
  max-width: 1100px; margin: 0 auto;
  padding: 48px 28px 80px;
}

.yb-section-label {
  text-align: center;
  font-family: var(--yb-hand-font);
  font-size: 16px;
  color: var(--yb-ink-faint);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 32px;
  transition: color 0.35s, font-family 0.01s;
}

.yb-theme--modern .yb-section-label {
  font-size: 12px; font-weight: 700;
  color: var(--yb-ink-mid);
  letter-spacing: 0.3em;
}

.yb-theme--editorial .yb-section-label {
  font-family: 'Archivo Black', sans-serif;
  font-size: 13px; letter-spacing: 0.3em;
  color: var(--yb-ink);
  text-align: left;
  padding-left: 2px;
  border-left: 4px solid var(--yb-accent);
  padding-left: 12px;
}

/* ════════════════════════════════════════
   GRID
   ════════════════════════════════════════ */
.yb-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  transition: gap 0.35s;
}
.yb-theme--editorial .yb-grid { gap: 14px; }

@media (max-width: 900px) { .yb-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 580px) { .yb-grid { grid-template-columns: repeat(2, 1fr); } }

/* ════════════════════════════════════════
   CARD — BASE
   ════════════════════════════════════════ */
.yb-card {
  position: relative;
  overflow: hidden;
  background: var(--yb-card-bg);
  border: 1.5px solid var(--yb-border);
  border-radius: var(--yb-card-radius);
  text-align: left;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    background 0.35s,
    border-radius 0.35s,
    border-color 0.35s;
  box-shadow: var(--yb-card-shadow);
  animation: cardIn 0.4s ease both;
  animation-delay: var(--delay, 0ms);
}

.yb-card:hover {
  transform: translateY(-5px) rotate(var(--yb-card-hover-rot));
  box-shadow: var(--yb-card-hover-shadow);
}

/* Card number (editorial big bg number) */
.yb-card-number {
  position: absolute; top: 10px; right: 12px;
  font-size: 11px; font-weight: 600;
  color: var(--yb-ink-faint);
  font-family: var(--yb-hand-font);
  letter-spacing: 0.05em;
  opacity: 0.6;
  transition: color 0.35s, font-size 0.35s, opacity 0.35s;
}

.yb-theme--editorial .yb-card-number {
  font-family: 'Archivo Black', sans-serif;
  font-size: 60px;
  color: rgba(255,255,255,0.08);
  top: auto; right: -4px; bottom: -12px;
  line-height: 1;
  letter-spacing: -0.04em;
  opacity: 1;
}

/* Color tab top */
.yb-card-tab {
  position: absolute; top: 0; left: 0; right: 0; height: 4px;
  background: var(--hue);
  border-radius: var(--yb-card-radius) var(--yb-card-radius) 0 0;
  transition: height 0.35s, opacity 0.35s, border-radius 0.35s;
}
.yb-theme--paper .yb-card-tab  { top: -6px; left: 14px; right: 14px; height: 7px; border-radius: 2px 2px 0 0; }
.yb-theme--editorial .yb-card-tab { display: none; }

/* Fold corner (paper only) */
.yb-card-corner {
  position: absolute; bottom: 0; right: 0;
  width: 20px; height: 20px;
  background: linear-gradient(135deg, transparent 50%, var(--yb-bg-dk) 50%);
  z-index: 2; pointer-events: none;
  transition: opacity 0.35s;
}
.yb-theme--modern .yb-card-corner,
.yb-theme--editorial .yb-card-corner { opacity: 0; }

/* Punch hole (paper only) */
.yb-card-hole {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  width: 9px; height: 9px; border-radius: 50%;
  background: var(--yb-bg);
  border: 1.5px solid var(--yb-border);
  z-index: 2;
  transition: opacity 0.35s, background 0.35s;
}
.yb-theme--modern .yb-card-hole,
.yb-theme--editorial .yb-card-hole { opacity: 0; }

.yb-card-inner {
  padding: 18px 16px 16px 30px;
  display: flex; flex-direction: column; gap: 3px;
  position: relative; z-index: 1;
}

.yb-theme--modern  .yb-card-inner { padding: 20px 18px; }
.yb-theme--editorial .yb-card-inner { padding: 20px 16px 18px; }

.yb-card-grade {
  font-family: var(--yb-hand-font);
  font-size: 11px; letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--yb-ink-faint);
  transition: color 0.35s, font-family 0.01s;
}
.yb-theme--editorial .yb-card-grade { color: rgba(255,255,255,0.55); font-family: 'Archivo', sans-serif; font-weight: 600; }

.yb-card-name {
  font-family: var(--yb-title-font);
  font-size: 24px; font-weight: 400;
  color: var(--yb-ink); line-height: 1.1;
  transition: color 0.2s, font-family 0.01s;
}

.yb-theme--modern .yb-card-name {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 20px; font-weight: 700;
}

.yb-theme--editorial .yb-card-name {
  font-family: 'Archivo Black', sans-serif;
  font-size: 26px; font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.yb-card:hover .yb-card-name { color: var(--hue); }
.yb-theme--editorial .yb-card:hover .yb-card-name { color: #ffffff; }

.yb-card-rule {
  width: 100%; height: 1px;
  background: var(--yb-border);
  margin: 8px 0 6px; opacity: 0.6;
  transition: background 0.35s;
}
.yb-theme--editorial .yb-card-rule { background: rgba(255,255,255,0.2); }

.yb-card-cta {
  font-family: var(--yb-hand-font);
  font-size: 13px;
  color: var(--yb-ink-faint);
  transition: color 0.2s, letter-spacing 0.2s, font-family 0.01s;
}
.yb-card:hover .yb-card-cta { color: var(--hue); letter-spacing: 0.04em; }
.yb-theme--editorial .yb-card-cta { color: rgba(255,255,255,0.5); font-family: 'Archivo', sans-serif; font-weight: 600; font-size: 12px; }
.yb-theme--editorial .yb-card:hover .yb-card-cta { color: rgba(255,255,255,0.9); }

/* Modern card hover accent bar */
.yb-theme--modern .yb-card:hover .yb-card-tab { height: 5px; }

/* ════════════════════════════════════════
   FOOTER
   ════════════════════════════════════════ */
.yb-footer {
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: center;
  gap: 20px; padding: 18px 24px 28px;
  border-top: 1.5px solid var(--yb-border);
  font-family: var(--yb-hand-font);
  font-size: 14px;
  color: var(--yb-ink-faint);
  letter-spacing: 0.06em;
  transition: border-color 0.35s, color 0.35s;
}

.yb-theme--editorial .yb-footer {
  border-top: 3px solid var(--yb-border);
  font-family: 'Archivo', sans-serif;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.yb-footer-rule {
  flex: 1; max-width: 70px; height: 1px;
  background: var(--yb-border);
  transition: background 0.35s;
}

/* ════════════════════════════════════════
   OVERLAY
   ════════════════════════════════════════ */
.yb-overlay {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; flex-direction: column; align-items: center;
  animation: overlayIn 0.22s ease;
}

.yb-overlay--paper {
  background: #1c1208;
  background-image:
    radial-gradient(ellipse at 25% 0%, rgba(80,45,15,0.55) 0%, transparent 55%),
    radial-gradient(ellipse at 75% 100%, rgba(55,25,8,0.4) 0%, transparent 55%);
}

.yb-overlay--modern {
  background: #0a1628;
  background-image:
    radial-gradient(ellipse at 30% 0%, rgba(37,99,235,0.15) 0%, transparent 55%),
    radial-gradient(ellipse at 70% 100%, rgba(15,50,100,0.3) 0%, transparent 55%);
}

.yb-overlay--editorial {
  background: #000000;
}
/* Red top stripe on editorial overlay */
.yb-overlay--editorial::before {
  content: ''; position: absolute;
  top: 0; left: 0; right: 0; height: 5px;
  background: #FFF001;
  z-index: 10;
}

/* ── Viewer Header ───────────────────────── */
.yb-viewer-header {
  width: 100%; max-width: 1200px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 28px;
  border-bottom: 1px solid var(--yb-overlay-hdr);
  flex-shrink: 0;
  transition: border-color 0.35s;
}

.yb-viewer-meta {
  display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap;
}

.yb-viewer-eyebrow {
  font-family: 'Caveat', cursive;
  font-size: 13px; letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--yb-overlay-dim);
}

.yb-overlay--modern .yb-viewer-eyebrow,
.yb-overlay--editorial .yb-viewer-eyebrow {
  font-family: var(--yb-page-font);
  font-size: 11px; font-weight: 600;
}

.yb-viewer-title {
  font-family: var(--yb-title-font);
  font-size: 22px; font-weight: 400;
  color: var(--yb-overlay-txt);
}

.yb-overlay--modern .yb-viewer-title,
.yb-overlay--editorial .yb-viewer-title { font-weight: 800; }

.yb-viewer-count {
  font-size: 13px;
  color: var(--yb-overlay-dim);
  font-family: var(--yb-page-font);
}

.yb-viewer-actions { display: flex; align-items: center; gap: 10px; }

.yb-dl-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 16px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 6px;
  color: var(--yb-overlay-txt);
  font-family: var(--yb-page-font); font-size: 13px;
  text-decoration: none; opacity: 0.75;
  transition: opacity 0.2s, background 0.2s;
}
.yb-dl-btn:hover { opacity: 1; background: rgba(255,255,255,0.1); }

.yb-overlay--editorial .yb-dl-btn {
  border-color: #FFF001; color: #FFF001;
  background: transparent; border-radius: 0;
}

.yb-close-btn {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 6px;
  color: var(--yb-overlay-dim);
  background: transparent;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.yb-close-btn:hover { color: var(--yb-overlay-txt); border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.06); }
.yb-overlay--editorial .yb-close-btn { border-radius: 0; }

/* ── Book Area ───────────────────────────── */
.yb-book-area {
  flex: 1; display: flex; align-items: center; justify-content: center;
  width: 100%; position: relative; overflow: hidden;
  padding: 24px 0 8px;
}

.yb-book-shell {
  position: relative; display: inline-block;
  filter:
    drop-shadow(0 2px 4px rgba(0,0,0,0.6))
    drop-shadow(0 12px 40px rgba(0,0,0,0.75))
    drop-shadow(0 40px 80px rgba(0,0,0,0.45));
}


/* ── Loading ─────────────────────────────── */
.yb-loading-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; position: absolute; inset: 0; justify-content: center; z-index: 20;
}

.yb-spinner {
  width: 36px; height: 36px;
  border: 2px solid rgba(255,255,255,0.1);
  border-top-color: rgba(255,255,255,0.6);
  border-radius: 50%;
  animation: spin 0.85s linear infinite;
}

.yb-loading-label {
  font-family: 'Caveat', cursive;
  font-size: 15px; letter-spacing: 0.25em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
}

/* ── Error ───────────────────────────────── */
.yb-error-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; text-align: center; padding: 40px;
  color: rgba(255,255,255,0.4); font-family: var(--yb-page-font);
  font-size: 14px;
}
.yb-error-state span { font-size: 28px; color: rgba(232,0,28,0.7); }
.yb-error-state code {
  background: rgba(255,255,255,0.06);
  padding: 2px 6px; border-radius: 3px;
  font-family: 'Courier New', monospace; font-size: 12px;
}

/* ── Nav ─────────────────────────────────── */
.yb-nav {
  display: flex; align-items: center; gap: 20px;
  padding: 12px 28px 18px; flex-shrink: 0;
}

.yb-nav-btn {
  padding: 8px 20px;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 4px;
  color: rgba(255,255,255,0.4);
  background: transparent;
  font-family: var(--yb-page-font); font-size: 13px;
  letter-spacing: 0.03em;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.yb-nav-btn:hover { color: rgba(255,255,255,0.9); border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.05); }

.yb-overlay--editorial .yb-nav-btn { border-radius: 0; }
.yb-overlay--editorial .yb-nav-btn:hover { border-color: #e8001c; color: #fff; background: rgba(232,0,28,0.1); }

.yb-dots { display: flex; align-items: center; gap: 6px; }

.yb-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: rgba(255,255,255,0.2);
  transition: background 0.2s, transform 0.2s, border-radius 0.35s;
  border: none; padding: 0; cursor: pointer;
}
.yb-dot:hover { background: rgba(255,255,255,0.45); }
.yb-dot.active { background: #ffffff; transform: scale(1.5); }

.yb-overlay--editorial .yb-dot { border-radius: 0; }
.yb-overlay--editorial .yb-dot.active { background: #FFF001; }

/* ════════════════════════════════════════
   ANIMATIONS
   ════════════════════════════════════════ */
@keyframes cardIn {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes overlayIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.yb-theme--paper .react-pdf__Page__canvas {
  mix-blend-mode: multiply;
}

/* ════════════════════════════════════════
   RESPONSIVE
   ════════════════════════════════════════ */
@media (max-width: 640px) {
  .yb-navbar { padding: 0 16px; gap: 8px; }
  .yb-theme-label { display: none; }
  .yb-navbar-brand { font-size: 14px; gap: 8px; }
  .yb-theme-pill { padding: 5px 10px; font-size: 11px; }

  .yb-hero { padding: 36px 16px 30px; }
  .yb-tape--left  { left: 20px; }
  .yb-tape--right { right: 20px; }

  .yb-main { padding: 28px 16px 56px; }
  .yb-grid { gap: 12px; }

  .yb-viewer-header { padding: 10px 14px; }
  .yb-viewer-title { font-size: 17px; }
  .yb-viewer-count { font-size: 11px; }
  .yb-viewer-meta { gap: 8px; }
  .yb-dl-btn-text { display: none; }
  .yb-dl-btn { padding: 8px 10px; }

  .yb-nav { padding: 10px 14px 14px; gap: 10px; }
  .yb-nav-btn { padding: 7px 12px; font-size: 12px; }

  .yb-book-area { padding: 12px 0 4px; }
}

@media (max-width: 380px) {
  .yb-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .yb-nav-btn { padding: 6px 8px; font-size: 11px; }
}
`;
