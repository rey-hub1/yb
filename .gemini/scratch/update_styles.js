const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../src/components/YearbookFlipbook.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

const newStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Lora:ital,wght@0,400;0,500;1,400&family=Caveat:wght@400;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Archivo+Black&family=Archivo:wght@400;500;600&display=swap');

/* ════════════════════════════════════════
   TOKEN DEFAULTS
   ════════════════════════════════════════ */
:root {
  --yb-bg:          #f4eee1;
  --yb-bg-dk:       #e6dec8;
  --yb-bg-lt:       #fcfbfa;
  --yb-ink:         #231c15;
  --yb-ink-mid:     #5e4c3a;
  --yb-ink-faint:   #a38c74;
  --yb-accent:      #b85e45;
  --yb-accent-gold: linear-gradient(135deg, #c79a55 0%, #d8b672 30%, #a2722b 70%, #875c1c 100%);
  --yb-border:      rgba(190, 168, 140, 0.4);
  --yb-navbar-bg:   rgba(244, 238, 225, 0.85);
  
  --yb-page-font:   'Lora', Georgia, serif;
  --yb-title-font:  'DM Serif Display', serif;
  --yb-hand-font:   'Caveat', cursive;

  --yb-card-bg:     #fcfbfa;
  --yb-card-radius: 4px;
  --yb-card-shadow: 
    0 1px 1px rgba(0,0,0,0.02),
    0 4px 8px rgba(44,27,14,0.04),
    0 12px 24px rgba(44,27,14,0.04),
    inset 0 0 0 1px rgba(255,255,255,0.6),
    inset 0 2px 4px rgba(255,255,255,0.9);
  --yb-card-hover-shadow: 
    0 4px 12px rgba(44,27,14,0.06),
    0 24px 48px rgba(44,27,14,0.12),
    0 40px 80px rgba(44,27,14,0.1),
    inset 0 0 0 1px rgba(255,255,255,0.8),
    inset 0 2px 4px rgba(255,255,255,1);
  --yb-card-hover-rot: -1.5deg;
}

/* ════════════════════════════════════════
   BASE
   ════════════════════════════════════════ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
button { border: none; background: none; cursor: pointer; outline: none; }

.yb-page {
  min-height: 100vh;
  background: var(--yb-bg);
  background-image: radial-gradient(circle at 50% 0%, var(--yb-bg-lt) 0%, transparent 70%);
  color: var(--yb-ink);
  font-family: var(--yb-page-font);
  position: relative;
  overflow-x: hidden;
  transition: background 0.35s ease, color 0.35s ease;
}

.yb-grain {
  position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
  mix-blend-mode: multiply;
}

.yb-ruled {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image: repeating-linear-gradient(transparent, transparent 31px, rgba(160,130,90,0.06) 31px, rgba(160,130,90,0.06) 32px);
}

/* ════════════════════════════════════════
   NAVBAR
   ════════════════════════════════════════ */
.yb-navbar {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: center;
  padding: 0 32px;
  height: 64px;
  background: var(--yb-navbar-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--yb-border);
  box-shadow: 0 4px 20px rgba(44,27,14,0.02);
}

.yb-navbar-brand {
  display: flex; align-items: center; gap: 12px;
  font-family: var(--yb-title-font);
  font-size: 18px; font-weight: 400;
  color: var(--yb-ink);
  letter-spacing: 0.02em;
}

.yb-navbar-logo {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  background: var(--yb-accent-gold);
  color: #fff;
  font-family: var(--yb-title-font);
  font-size: 14px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(135, 92, 28, 0.3);
}

/* ════════════════════════════════════════
   HERO
   ════════════════════════════════════════ */
.yb-hero {
  position: relative; z-index: 1;
  text-align: center;
  padding: 80px 24px 60px;
  border-bottom: 1px solid var(--yb-border);
  background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%);
  overflow: hidden;
}

.yb-hero::after {
  content: ''; position: absolute;
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
  pointer-events: none; z-index: -1;
  opacity: 0.6;
}

.yb-tape {
  position: absolute; top: 30px;
  width: 60px; height: 24px;
  background: rgba(220,205,180,0.6);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255,255,255,0.4);
  box-shadow: 1px 2px 4px rgba(0,0,0,0.06);
}
.yb-tape--left  { left: 80px;  transform: rotate(-3deg); }
.yb-tape--right { right: 80px; transform: rotate(4deg); }

.yb-stamp-ring {
  display: inline-flex; align-items: center; justify-content: center;
  width: 76px; height: 76px; border-radius: 50%;
  border: 1.5px solid rgba(184, 94, 69, 0.4);
  box-shadow: inset 0 0 0 4px rgba(184, 94, 69, 0.05);
  margin-bottom: 24px;
  position: relative;
}
.yb-stamp-ring::before {
  content: ''; position: absolute; inset: 4px; border-radius: 50%;
  border: 1px dashed rgba(184, 94, 69, 0.3);
}
.yb-stamp-ring span {
  font-family: 'Caveat', cursive;
  font-size: 13px; letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--yb-accent);
  transform: rotate(-12deg);
  opacity: 0.8;
}

.yb-eyebrow {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  font-family: var(--yb-page-font);
  font-size: 12px; font-weight: 500;
  color: var(--yb-ink-faint);
  letter-spacing: 0.3em;
  text-transform: uppercase;
  margin-bottom: 20px;
}

.yb-eyebrow-rule {
  display: inline-block; width: 48px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--yb-ink-faint), transparent);
  opacity: 0.5;
}

.yb-hero-title {
  font-family: var(--yb-title-font);
  font-size: clamp(64px, 12vw, 120px);
  font-weight: 400;
  line-height: 0.9;
  color: var(--yb-ink);
  letter-spacing: -0.01em;
  margin-bottom: 24px;
  text-shadow: 2px 4px 12px rgba(44,27,14,0.06);
}

.yb-hero-title em {
  font-style: italic;
  background: var(--yb-accent-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  padding-right: 0.1em;
}

.yb-hero-sub {
  font-family: var(--yb-page-font);
  font-size: 16px;
  color: var(--yb-ink-mid);
  letter-spacing: 0.08em;
}

/* ════════════════════════════════════════
   MAIN & SECTION LABEL
   ════════════════════════════════════════ */
.yb-main {
  position: relative; z-index: 1;
  max-width: 1140px; margin: 0 auto;
  padding: 64px 32px 100px;
}

.yb-section-label {
  text-align: center;
  font-family: var(--yb-hand-font);
  font-size: 18px;
  color: var(--yb-ink-faint);
  letter-spacing: 0.15em;
  margin-bottom: 40px;
}
.yb-section-label::after {
  content: ''; display: block;
  width: 24px; height: 2px;
  background: var(--yb-accent);
  margin: 12px auto 0; opacity: 0.3;
}

/* ════════════════════════════════════════
   GRID
   ════════════════════════════════════════ */
.yb-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
}

@media (max-width: 960px) { .yb-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 640px) { .yb-grid { grid-template-columns: repeat(2, 1fr); } }

/* ════════════════════════════════════════
   CARD — BASE
   ════════════════════════════════════════ */
.yb-card {
  position: relative; overflow: hidden;
  background: var(--yb-card-bg);
  border: 1px solid rgba(0,0,0,0.04);
  border-radius: var(--yb-card-radius);
  text-align: left;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: var(--yb-card-shadow);
  animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--delay, 0ms);
  transform-origin: center bottom;
}

.yb-card::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(145deg, rgba(255,255,255,0.7) 0%, transparent 100%);
  pointer-events: none; z-index: 1;
}

.yb-card:hover {
  transform: translateY(-8px) rotate(var(--yb-card-hover-rot)) scale(1.02);
  box-shadow: var(--yb-card-hover-shadow);
  border-color: rgba(0,0,0,0.08);
}

.yb-card-number {
  position: absolute; top: 12px; right: 14px;
  font-size: 13px; font-weight: 400;
  color: var(--yb-ink-faint);
  font-family: var(--yb-page-font);
  opacity: 0.4; z-index: 2;
}

.yb-card-tab {
  position: absolute; top: 0; left: 0; right: 0; height: 5px;
  background: var(--hue); transition: height 0.3s ease; z-index: 2;
}
.yb-card:hover .yb-card-tab { height: 8px; }

.yb-card-corner {
  position: absolute; bottom: 0; right: 0;
  width: 24px; height: 24px;
  background: linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.04) 50%);
  z-index: 2; pointer-events: none;
}
.yb-card-corner::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.5) 50%);
  transform: translate(-1px, -1px);
}

.yb-card-hole {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--yb-bg-dk);
  box-shadow: inset 1px 1px 3px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.8);
  z-index: 2;
}

.yb-card-inner {
  padding: 24px 20px 20px 36px;
  display: flex; flex-direction: column; gap: 4px;
  position: relative; z-index: 3;
}

.yb-card-grade {
  font-family: var(--yb-page-font);
  font-size: 10px; letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--yb-ink-faint); font-weight: 500;
}

.yb-card-name {
  font-family: var(--yb-title-font);
  font-size: 26px; font-weight: 400;
  color: var(--yb-ink); line-height: 1.1;
  transition: color 0.3s ease;
}

.yb-card:hover .yb-card-name { color: var(--hue); }

.yb-card-rule {
  width: 100%; height: 1px;
  background: linear-gradient(90deg, var(--yb-border), transparent);
  margin: 12px 0 10px;
}

.yb-card-cta {
  font-family: var(--yb-page-font);
  font-size: 12px; font-style: italic;
  color: var(--yb-ink-faint);
  transition: all 0.3s ease;
  display: flex; align-items: center; gap: 4px;
}
.yb-card-cta::after {
  content: '→'; transition: transform 0.3s ease;
}
.yb-card:hover .yb-card-cta { color: var(--hue); }
.yb-card:hover .yb-card-cta::after { transform: translateX(4px); }

/* ════════════════════════════════════════
   FOOTER
   ════════════════════════════════════════ */
.yb-footer {
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: center;
  gap: 24px; padding: 24px 32px 40px;
  font-family: var(--yb-page-font);
  font-size: 13px; font-style: italic;
  color: var(--yb-ink-faint);
}

.yb-footer-rule {
  flex: 1; max-width: 100px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--yb-border), transparent);
}

/* ════════════════════════════════════════
   EDITORIAL VIEWER OVERLAY
   ════════════════════════════════════════ */
.yb-overlay {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; flex-direction: column; align-items: center;
  animation: overlayIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  --yb-overlay-bg: #050505;
  --yb-overlay-txt: #ffffff;
  --yb-overlay-dim: rgba(255,255,255,0.4);
  --yb-overlay-accent: #FFF001;
}

.yb-overlay::before {
  content: ''; position: absolute;
  top: 0; left: 0; right: 0; height: 5px;
  background: var(--yb-overlay-accent);
  z-index: 100;
  box-shadow: 0 0 20px var(--yb-overlay-accent);
}

.yb-overlay > *:not(.yb-overlay-bg-stack) { position: relative; z-index: 1; }

.yb-overlay-bg-stack {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background: var(--yb-overlay-bg);
}

.yb-overlay-bg-layer {
  position: absolute; inset: 0; transition: opacity 0.4s ease;
  background: linear-gradient(135deg, var(--yb-overlay-bg-start, #111) 0%, var(--yb-overlay-bg-mid, #000) 50%, var(--yb-overlay-bg-end, #0a0a0a) 100%);
}

.yb-overlay-bg-layer::after {
  content: ''; position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
  opacity: 0.03; mix-blend-mode: screen;
}

.yb-overlay-bg-layer::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 50%, var(--yb-overlay-book-glow, rgba(255,255,255,0.03)) 0%, transparent 60%);
}

.yb-overlay-bg-layer--fade { animation: overlayBgFadeOut 0.5s ease-out forwards; }

/* ── Viewer Header ───────────────────────── */
.yb-viewer-header {
  width: 100%; max-width: 1400px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 40px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%);
}

.yb-viewer-meta { display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap; }

.yb-viewer-eyebrow {
  font-family: 'Archivo Black', sans-serif;
  font-size: 11px; letter-spacing: 0.15em;
  text-transform: uppercase; color: var(--yb-overlay-dim);
  background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 20px;
}

.yb-viewer-title {
  font-family: 'Archivo Black', sans-serif;
  font-size: 24px; font-weight: 900;
  letter-spacing: -0.02em; color: var(--yb-overlay-txt);
}

.yb-viewer-count {
  font-size: 13px; font-weight: 500;
  color: var(--yb-overlay-dim);
  font-family: 'Archivo', sans-serif;
}

.yb-viewer-actions { display: flex; align-items: center; gap: 16px; }

.yb-dl-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 20px; background: transparent;
  border: 1px solid var(--yb-overlay-accent);
  color: var(--yb-overlay-accent);
  font-family: 'Archivo', sans-serif; font-size: 12px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.1em;
  text-decoration: none; transition: all 0.3s ease;
  position: relative; overflow: hidden;
}
.yb-dl-btn::before {
  content: ''; position: absolute; inset: 0; background: var(--yb-overlay-accent);
  transform: scaleX(0); transform-origin: right; transition: transform 0.3s ease; z-index: -1;
}
.yb-dl-btn:hover { color: #000; }
.yb-dl-btn:hover::before { transform: scaleX(1); transform-origin: left; }

.yb-close-btn {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(255,255,255,0.15);
  color: var(--yb-overlay-dim); transition: all 0.3s ease; border-radius: 50%;
}
.yb-close-btn:hover { color: #fff; border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.05); transform: rotate(90deg); }

/* ── Book Area ───────────────────────────── */
.yb-book-area {
  flex: 1; display: flex; align-items: center; justify-content: center;
  width: 100%; position: relative; overflow: hidden;
  padding: 32px 0 16px;
}

.yb-book-shell {
  position: relative; display: inline-block;
  filter:
    drop-shadow(0 4px 12px rgba(0,0,0,0.8))
    drop-shadow(0 20px 40px rgba(0,0,0,0.9))
    drop-shadow(0 60px 100px rgba(0,0,0,0.6));
}

/* ── Loading ─────────────────────────────── */
.yb-loading-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 20px; position: absolute; inset: 0; justify-content: center; z-index: 20;
  backdrop-filter: blur(8px);
}

.yb-spinner {
  width: 48px; height: 48px;
  border: 2px solid rgba(255,255,255,0.05);
  border-top-color: var(--yb-overlay-accent);
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.6, 0.2, 0.4, 0.8) infinite;
}

.yb-loading-label {
  font-family: 'Archivo', sans-serif;
  font-size: 12px; font-weight: 700; letter-spacing: 0.3em;
  text-transform: uppercase; color: rgba(255,255,255,0.6);
}

.yb-loading-bar {
  width: 240px; height: 2px;
  background: rgba(255,255,255,0.1); overflow: hidden;
}
.yb-loading-bar span {
  display: block; height: 100%;
  background: var(--yb-overlay-accent);
  box-shadow: 0 0 10px var(--yb-overlay-accent);
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ── Error ───────────────────────────────── */
.yb-error-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; text-align: center; padding: 48px;
  background: rgba(20,0,0,0.4); border: 1px solid rgba(255,50,50,0.2);
  border-radius: 8px; backdrop-filter: blur(10px);
}
.yb-error-state span { font-size: 32px; color: #ff4444; }
.yb-error-state p { color: #fff; font-family: 'Archivo', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 0.05em; }
.yb-error-state code {
  background: rgba(0,0,0,0.6); color: #ff8888;
  padding: 8px 12px; border-radius: 4px;
  font-family: 'Courier New', monospace; font-size: 13px;
}

/* ── Nav ─────────────────────────────────── */
.yb-nav {
  display: flex; align-items: center; gap: 32px;
  padding: 24px; flex-shrink: 0;
}

.yb-nav-btn {
  padding: 10px 24px; border: none;
  color: rgba(255,255,255,0.5);
  font-family: 'Archivo', sans-serif; font-size: 12px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.15em;
  transition: all 0.3s ease; position: relative;
}
.yb-nav-btn::after {
  content: ''; position: absolute; bottom: 0; left: 50%; right: 50%; height: 2px;
  background: var(--yb-overlay-accent); transition: all 0.3s ease;
}
.yb-nav-btn:hover { color: #fff; }
.yb-nav-btn:hover::after { left: 20%; right: 20%; }

.yb-dots { display: flex; align-items: center; gap: 8px; }

.yb-dot {
  width: 6px; height: 6px; background: rgba(255,255,255,0.2);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.yb-dot:hover { background: rgba(255,255,255,0.6); transform: scale(1.5); }
.yb-dot.active { background: var(--yb-overlay-accent); transform: scale(2); box-shadow: 0 0 8px var(--yb-overlay-accent); }

/* ════════════════════════════════════════
   ANIMATIONS
   ════════════════════════════════════════ */
@keyframes cardIn {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes overlayIn {
  from { opacity: 0; backdrop-filter: blur(0px); }
  to   { opacity: 1; backdrop-filter: blur(20px); }
}
@keyframes overlayBgFadeOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ════════════════════════════════════════
   RESPONSIVE
   ════════════════════════════════════════ */
@media (max-width: 768px) {
  .yb-hero-title { font-size: clamp(48px, 10vw, 80px); }
  .yb-main { padding: 40px 20px 80px; }
  .yb-viewer-header { padding: 16px 20px; }
  .yb-viewer-title { font-size: 18px; }
  .yb-dl-btn span { display: none; }
  .yb-dl-btn { padding: 10px; border-radius: 50%; }
  .yb-nav { gap: 16px; padding: 16px; }
  .yb-nav-btn { padding: 8px 12px; font-size: 10px; }
}
@media (max-width: 480px) {
  .yb-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .yb-hero { padding: 60px 16px 40px; }
  .yb-card-inner { padding: 16px 12px 12px 28px; }
  .yb-card-name { font-size: 20px; }
  .yb-tape { display: none; }
  .yb-stamp-ring { width: 60px; height: 60px; }
}
`;

const startIndex = content.indexOf('const STYLES = `');
const endIndex = content.lastIndexOf('`;');

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.substring(0, startIndex) + 'const STYLES = `' + newStyles + '`;\n' + content.substring(endIndex + 3);
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log('Styles updated successfully.');
} else {
  console.error('Could not find STYLES block.');
}
