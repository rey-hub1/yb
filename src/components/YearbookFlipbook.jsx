import React, { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { CLASSES } from "../data/classes";
import MessageWall from "./MessageWall";
import {
  buildPalette,
  buildSpreadPalette,
  getSpreadPageNumbers,
  extractPdfPalette,
  getCardStyle,
  getViewerThemeStyle
} from "../utils/colorExtractor";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const PAGE_W = 520;
const PAGE_H = 740;

function useBookScale() {
  const calc = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const marginX = vw < 768 ? 24 : 96;   // sisi kiri-kanan
    const reservedY = vw < 768 ? 150 : 180; // header + pagination + napas
    const fitW = (vw - marginX) / (PAGE_W * 2);
    const fitH = (vh - reservedY) / PAGE_H;
    const s = Math.min(fitW, fitH);
    // boleh gede di layar besar (sampai 1.45×) biar nggak kerasa kayak HP di desktop
    return Math.max(0.3, Math.min(s, 1.45));
  };
  const [scale, setScale] = useState(calc);
  useEffect(() => {
    let timeoutId;
    const fn = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setScale(calc()), 100);
    };
    window.addEventListener("resize", fn);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", fn);
    };
  }, []);
  return scale;
}

// ─── FlipPage wrapper ─────────────────────────────────────────────────────────
const FlipPage = React.forwardRef(function FlipPage({ children, width, height }, ref) {
  return (
    <div ref={ref} style={{ width, height, background: "#ffffff", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {children}
    </div>
  );
});

// ─── Progressive Page (low-res → HD fade, sequential) ────────────────────────
const LO_W = 100;

function ProgressivePage({ pageNumber, isFirst, onFirstRender, width, height }) {
  const [loReady, setLoReady] = useState(false);
  const [hdReady, setHdReady] = useState(false);
  const loScale = width / LO_W;

  const handleLoReady = useCallback(() => {
    setLoReady(true);
    if (isFirst) onFirstRender?.();
  }, [isFirst, onFirstRender]);

  return (
    <div style={{ width, height, position: "relative", overflow: "hidden" }}>
      {/* lo-res: render dulu, sembunyikan setelah HD siap */}
      <div style={{
        position: "absolute", top: 0, left: 0,
        transform: `scale(${loScale})`, transformOrigin: "top left",
        opacity: hdReady ? 0 : 1, transition: "opacity 0.4s ease",
      }}>
        <Page pageNumber={pageNumber} width={LO_W}
          renderTextLayer={false} renderAnnotationLayer={false}
          onRenderSuccess={handleLoReady}
        />
      </div>
      {/* HD: baru mount setelah lo-res selesai */}
      {loReady && (
        <div style={{
          position: "absolute", top: 0, left: 0,
          opacity: hdReady ? 1 : 0, transition: "opacity 0.4s ease",
        }}>
          <Page pageNumber={pageNumber} width={width}
            renderTextLayer={false} renderAnnotationLayer={false}
            onRenderSuccess={() => setHdReady(true)}
          />
        </div>
      )}
      {/* Loading Indicator untuk HD */}
      {loReady && !hdReady && (
        <div style={{
          position: "absolute",
          bottom: "16px",
          right: "16px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(4px)",
          padding: "8px",
          borderRadius: "50%",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            width: "14px",
            height: "14px",
            border: "2px solid rgba(0,0,0,0.1)",
            borderTopColor: "rgba(0,0,0,0.6)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
        </div>
      )}
    </div>
  );
}

// ─── Book Cover Thumbnail ─────────────────────────────────────────────────────
function BookCoverThumbnail({ cover, hue }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="yb-book-cover-wrap">
      <div className="yb-book-cover-placeholder" style={{ background: hue, opacity: loaded ? 0 : 1 }} />
      {cover && (
        <img
          src={cover}
          alt=""
          loading="lazy"
          decoding="async"
          className="yb-book-cover-img"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
        />
      )}
    </div>
  );
}

// ─── Suara flip (sintesis Web Audio, nol aset) ───────────────────────────────
// Niru bunyi kertas dibalik: burst noise pendek difilter lowpass + envelope cepat.
// Ganti ke file mp3 gampang nanti kalau mau lebih realistis.
function playFlipSound(ctxRef) {
  try {
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctxRef.current = new AC();
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const dur = 0.18;

    // buffer noise putih
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      // amplop: naik cepat lalu turun — kesan "swoosh" kertas
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;

    // lowpass yang nyapu turun biar terasa "geser"
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(3200, now);
    lp.frequency.exponentialRampToValueAtTime(900, now + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    src.connect(lp).connect(gain).connect(ctx.destination);
    src.start(now);
    src.stop(now + dur);
  } catch {
    /* abaikan — audio opsional */
  }
}

// ─── Flipbook Viewer ──────────────────────────────────────────────────────────
function FlipBookViewer({ classData, onClose, viewerThemeStyle }) {
  const viewPdf = classData.pdf.replace(".pdf", "-optimized.pdf");
  const [numPages, setNumPages]   = useState(null);
  const [documentReady, setDocumentReady] = useState(false);
  const [firstPageReady, setFirstPageReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError]         = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [spreadThemeStyle, setSpreadThemeStyle] = useState(viewerThemeStyle);
  const [displayedThemeStyle, setDisplayedThemeStyle] = useState(viewerThemeStyle);
  const [fadingThemeStyle, setFadingThemeStyle] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem("yb-flip-muted") === "1"; } catch { return false; }
  });
  const flipBookRef = useRef(null);
  const overlayRef = useRef(null);
  const backgroundTimeoutRef = useRef(null);
  const audioCtxRef = useRef(null);
  const mutedRef = useRef(muted);

  const toggleMuted = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      mutedRef.current = next;
      try { localStorage.setItem("yb-flip-muted", next ? "1" : "0"); } catch { /* noop */ }
      return next;
    });
  }, []);
  const scale = useBookScale();
  // Ukuran piksel asli — flipbook dirender pada ukuran ini (bukan CSS scale),
  // supaya koordinat sentuh page-flip cocok & swipe/flip jalan di HP.
  const dispW = Math.max(1, Math.round(PAGE_W * scale));
  const dispH = Math.max(1, Math.round(PAGE_H * scale));

  const flipPrev = useCallback(() => flipBookRef.current?.pageFlip().flipPrev(), []);
  const flipNext = useCallback(() => flipBookRef.current?.pageFlip().flipNext(), []);
  const jumpTo = useCallback((p) => flipBookRef.current?.pageFlip().turnToPage(p), []);

  // Input sendiri (bukan dari react-pageflip) supaya konsisten di HP/tablet/PC.
  // Library di-nonaktifin mouse/touch-nya; layer transparan di atas buku nangkep
  // pointer → tap kiri/kanan = mundur/maju, swipe horizontal juga jalan.
  const flippingRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const onBookPointerDown = useCallback((e) => {
    pointerRef.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onBookPointerUp = useCallback((e) => {
    if (flippingRef.current) return;
    const dx = e.clientX - pointerRef.current.x;
    const dy = e.clientY - pointerRef.current.y;
    const rect = e.currentTarget.getBoundingClientRect();
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      // swipe: geser ke kiri = halaman maju, geser ke kanan = mundur
      if (dx < 0) flipNext();
      else flipPrev();
    } else if (Math.abs(dx) < 14 && Math.abs(dy) < 14) {
      // tap: sisi kiri = mundur, sisi kanan = maju
      const x = e.clientX - rect.left;
      if (x < rect.width / 2) flipPrev();
      else flipNext();
    }
  }, [flipPrev, flipNext]);

  const toggleFullscreen = useCallback(() => {
    const el = overlayRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const fn = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", fn);
    return () => document.removeEventListener("fullscreenchange", fn);
  }, []);

  const handleLoadProgress = useCallback(({ loaded = 0, total = 0 }) => {
    if (!total) return;
    setLoadProgress(Math.min(100, Math.round((loaded / total) * 100)));
  }, []);
  const handleLoadSuccess = useCallback(({ numPages: n }) => {
    setNumPages(n);
    setDocumentReady(true);
    setLoadProgress(100);
  }, []);
  const handleLoadError   = useCallback((error) => {
    setError(error.message);
    setDocumentReady(false);
    setFirstPageReady(false);
  }, []);
  const handleFirstPageRenderSuccess = useCallback(() => {
    setFirstPageReady(true);
  }, []);

  useEffect(() => {
    setNumPages(null);
    setDocumentReady(false);
    setFirstPageReady(false);
    setLoadProgress(0);
    setError(false);
    setCurrentPage(0);
    setSpreadThemeStyle(viewerThemeStyle);
    setDisplayedThemeStyle(viewerThemeStyle);
    setFadingThemeStyle(null);
  }, [viewPdf]);

  useEffect(() => {
    setSpreadThemeStyle(viewerThemeStyle);
  }, [viewerThemeStyle]);

  useEffect(() => {
    return () => {
      if (backgroundTimeoutRef.current) clearTimeout(backgroundTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") {
        if (!document.fullscreenElement) onClose();
      } else if (e.key === "ArrowLeft") flipPrev();
      else if (e.key === "ArrowRight") flipNext();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose, flipPrev, flipNext]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (!numPages) return;

    const { left, right } = getSpreadPageNumbers(currentPage, numPages);
    let cancelled = false;

    Promise.all([
      extractPdfPalette(viewPdf, left, classData.hue),
      right ? extractPdfPalette(viewPdf, right, classData.hue) : Promise.resolve(null),
    ]).then(([leftPalette, rightPalette]) => {
      if (cancelled || !leftPalette) return;
      setSpreadThemeStyle(getViewerThemeStyle(buildSpreadPalette(leftPalette, rightPalette)));
    });

    return () => {
      cancelled = true;
    };
  }, [classData.hue, viewPdf, currentPage, numPages]);

  useEffect(() => {
    if (!spreadThemeStyle) return;

    const currentStyleKey = JSON.stringify(displayedThemeStyle);
    const nextStyleKey = JSON.stringify(spreadThemeStyle);

    if (!displayedThemeStyle || currentStyleKey === nextStyleKey) {
      if (!displayedThemeStyle) setDisplayedThemeStyle(spreadThemeStyle);
      return;
    }

    if (backgroundTimeoutRef.current) clearTimeout(backgroundTimeoutRef.current);

    setFadingThemeStyle(displayedThemeStyle);
    setDisplayedThemeStyle(spreadThemeStyle);

    backgroundTimeoutRef.current = setTimeout(() => {
      setFadingThemeStyle(null);
    }, 400);
  }, [displayedThemeStyle, spreadThemeStyle]);

  const totalSpreads  = numPages ? Math.ceil(numPages / 2) : 0;
  const atEnd = numPages ? currentPage + 2 >= numPages : false;
  const currentSpread = atEnd ? Math.max(0, totalSpreads - 1) : Math.floor(currentPage / 2);
  const progressPct = totalSpreads ? (atEnd ? 100 : ((currentSpread + 1) / totalSpreads) * 100) : 0;
  const loading = !documentReady || !firstPageReady;
  const RENDER_WINDOW = 4;

  return (
    <div ref={overlayRef} className="yb-overlay" style={displayedThemeStyle}>
      <div className="yb-overlay-bg-stack" aria-hidden="true">
        <div className="yb-overlay-bg-layer yb-overlay-bg-layer--current" />
        {fadingThemeStyle && (
          <div
            className="yb-overlay-bg-layer yb-overlay-bg-layer--fade"
            style={fadingThemeStyle}
          />
        )}
        <div className="yb-overlay-vignette" />
      </div>
      {/* Header */}
      <div className="yb-viewer-header">
        <div className="yb-viewer-meta">
          <span className="yb-viewer-eyebrow">Yearbook 2023–2026</span>
          <h2 className="yb-viewer-title">Kelas {classData.name}</h2>
        </div>
        <div className="yb-viewer-actions">
          {numPages && (
            <span className="yb-viewer-count">
              <strong>{String(currentPage + 1).padStart(2, "0")}</strong>
              <span>–{Math.min(currentPage + 2, numPages)}</span>
              <em>/ {numPages}</em>
            </span>
          )}
          <span className="yb-action-divider" aria-hidden="true" />
          <button onClick={toggleMuted} className="yb-action-btn" aria-label={muted ? "Nyalakan suara" : "Matikan suara"}>
            {muted ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>
            )}
            <span className="yb-action-tooltip">{muted ? "Suara mati" : "Suara nyala"}</span>
          </button>
          <button onClick={toggleFullscreen} className="yb-action-btn" aria-label="Layar Penuh">
            {isFullscreen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3m13-5h-3a2 2 0 0 0-2 2v3"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m13-5v3a2 2 0 0 1-2 2h-3"/>
              </svg>
            )}
            <span className="yb-action-tooltip">{isFullscreen ? "Keluar" : "Layar Penuh"}</span>
          </button>
          <a href={classData.pdf} download className="yb-action-btn" aria-label="Unduh PDF">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span className="yb-action-tooltip">Unduh</span>
          </a>
          <button onClick={onClose} className="yb-action-btn yb-close-btn" aria-label="Tutup Viewer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            <span className="yb-action-tooltip">Tutup</span>
          </button>
        </div>
      </div>

      {/* Book */}
      <div className="yb-book-area">
        {loading && !error && (
          <div className="yb-loading-state">
            <div className="yb-load-book" aria-hidden="true">
              {classData.cover && (
                <img className="yb-load-book-cover" src={classData.cover} alt="" loading="eager" />
              )}
              <div className="yb-load-book-shade" />
              <div className="yb-load-book-spine" />
              <div className="yb-load-book-foil" />
              <div className="yb-load-book-seal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
            </div>

            <div className="yb-load-meta">
              <span className="yb-load-eyebrow">Membuka Kenangan</span>
              <p className="yb-load-quote">ini milik kita, untuk selamanya</p>
            </div>

            <div className="yb-load-progress">
              <div className="yb-loading-bar" aria-hidden="true">
                <span style={{ width: `${Math.max(loadProgress, documentReady ? 100 : 6)}%` }} />
              </div>
              <span className="yb-load-pct">
                {String(Math.round(Math.max(loadProgress, documentReady ? 100 : 6))).padStart(2, "0")}
                <em>%</em>
              </span>
            </div>
          </div>
        )}
        {error && (
          <div className="yb-error-state">
            <span>✦</span>
            <p>Gagal memuat PDF:</p>
            <code>{error}</code>
          </div>
        )}
        <Document
          file={viewPdf}
          onLoadSuccess={handleLoadSuccess}
          onLoadProgress={handleLoadProgress}
          onLoadError={handleLoadError}
          loading={null}
        >
          {documentReady && !error && numPages && (
            <div className={`yb-book-shell${isFlipping ? " is-flipping" : ""}`}>
              <HTMLFlipBook
                key={dispW}
                ref={flipBookRef}
                width={dispW} height={dispH}
                size="fixed"
                minWidth={dispW} maxWidth={dispW}
                minHeight={dispH} maxHeight={dispH}
                startPage={currentPage}
                showCover={true} flippingTime={780}
                drawShadow={true} maxShadowOpacity={0.55}
                showPageCorners={false} disableFlipByClick={true}
                useMouseEvents={false}
                usePortrait={false} mobileScrollSupport={false}
                onFlip={(e) => setCurrentPage(e.data)}
                onChangeState={(e) => {
                  const flipping = e.data === "flipping" || e.data === "user_fold";
                  // bunyi cuma pas MASUK ke state flipping (bukan tiap perubahan)
                  if (e.data === "flipping" && !flippingRef.current && !mutedRef.current) {
                    playFlipSound(audioCtxRef);
                  }
                  flippingRef.current = flipping;
                  setIsFlipping(flipping);
                }}
                className="yb-flipbook"
              >
                {Array.from({ length: numPages }, (_, i) => (
                  <FlipPage key={i} width={dispW} height={dispH}>
                    {Math.abs(i - currentPage) <= RENDER_WINDOW ? (
                      <ProgressivePage
                        pageNumber={i + 1}
                        isFirst={i === 0}
                        onFirstRender={handleFirstPageRenderSuccess}
                        width={dispW}
                        height={dispH}
                      />
                    ) : (
                      <div style={{ width: dispW, height: dispH }} />
                    )}
                  </FlipPage>
                ))}
              </HTMLFlipBook>
              <div
                className="yb-tap-layer"
                onPointerDown={onBookPointerDown}
                onPointerUp={onBookPointerUp}
              />
            </div>
          )}
        </Document>
      </div>

      {/* Floating Nav & Pagination */}
      {!loading && !error && numPages && (
        <>
          <button onClick={flipPrev} className="yb-nav-arrow yb-nav-prev" disabled={currentPage <= 0} aria-label="Halaman sebelumnya">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>

          <button onClick={flipNext} className="yb-nav-arrow yb-nav-next" disabled={currentPage + 2 >= numPages} aria-label="Halaman berikutnya">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>

          <div className="yb-pagination">
            <button className="yb-page-jump" onClick={flipPrev} disabled={currentSpread <= 0} aria-label="Halaman sebelumnya">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span className="yb-page-num">{String(currentSpread + 1).padStart(2, '0')}</span>
            <div className="yb-page-track">
              <div className="yb-page-progress" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="yb-page-num yb-page-num--total">{String(totalSpreads).padStart(2, '0')}</span>
            <button className="yb-page-jump" onClick={flipNext} disabled={currentSpread >= totalSpreads - 1} aria-label="Halaman berikutnya">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </>
      )}

    </div>
  );
}

const SVG_ICONS = [
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="6.5"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3v18m9-9H3m15.364-6.364l-12.728 12.728m0-12.728l12.728 12.728"/></svg>
];

const ANGKATAN_PHOTOS = ['/angkatan/1.jpg', '/angkatan/2.jpg'];

function HeroPhotos() {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);
  const total = ANGKATAN_PHOTOS.length;

  const prev = () => setCurrent(i => (i - 1 + total) % total);
  const next = () => setCurrent(i => (i + 1) % total);

  const onTouchStart = e => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = e => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <div className="yb-hero-photos">
      {/* Desktop: side by side */}
      <div className="yb-hero-photos-row">
        {ANGKATAN_PHOTOS.map((src, i) => (
          <div key={i} className={`yb-hero-photo-wrap yb-hero-photo-wrap--${i}`}>
            <img src={src} alt={`Foto Angkatan ${i + 1}`} className="yb-hero-photo" loading="eager" draggable="false" />
          </div>
        ))}
      </div>
      {/* Mobile: carousel */}
      <div className="yb-hero-photos-carousel" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="yb-hero-photos-track" style={{ transform: `translateX(-${current * 100}%)` }}>
          {ANGKATAN_PHOTOS.map((src, i) => (
            <div key={i} className="yb-hero-photo-slide">
              <div className={`yb-hero-photo-wrap yb-hero-photo-wrap--${i}`}>
                <img src={src} alt={`Foto Angkatan ${i + 1}`} className="yb-hero-photo" loading="eager" draggable="false" />
              </div>
            </div>
          ))}
        </div>
        <div className="yb-hero-photos-dots">
          {ANGKATAN_PHOTOS.map((_, i) => (
            <button
              key={i}
              className={`yb-hero-photos-dot${i === current ? ' active' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Foto angkatan ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FloatingParticles() {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    const items = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      iconIndex: Math.floor(Math.random() * SVG_ICONS.length),
      left: Math.random() * 100,
      size: 16 + Math.random() * 16,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * -30,
      sway: (Math.random() - 0.5) * 200,
      rot: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360),
      opacity: 0.15 + Math.random() * 0.3
    }));
    setParticles(items);
  }, []);

  return (
    <div className="yb-particles" aria-hidden="true">
      {particles.map(p => (
        <div 
          key={p.id} 
          className="yb-particle yb-particle--icon"
          style={{
            left: `${p.left}vw`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            '--duration': `${p.duration}s`,
            '--delay': `${p.delay}s`,
            '--sway': `${p.sway}px`,
            '--rot': `${p.rot}deg`,
            '--base-opacity': p.opacity
          }}
        >
          {SVG_ICONS[p.iconIndex]}
        </div>
      ))}
    </div>
  );
}

// ─── Splash Screen ───────────────────────────────────────────────────────────
function SplashScreen({ onEnter }) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onEnter, 600);
  };

  return (
    <div className={`yb-splash${exiting ? " yb-splash--exit" : ""}`}>
      {/* Cover mosaic background */}
      <div className="yb-splash-mosaic">
        {CLASSES.map((cls, i) => (
          <div key={cls.id} className="yb-splash-mosaic-item" style={{ "--i": i }}>
            {cls.cover && (
              <img src={cls.cover} alt="" loading="lazy" decoding="async"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={e => { e.target.style.display = "none"; }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="yb-splash-overlay" />
      <div className="yb-splash-grain" aria-hidden="true" />
      <div className="yb-splash-frame" aria-hidden="true" />

      <div className="yb-splash-inner">
        <img src="/logo_baru.jpeg" alt="Logo" className="yb-splash-logo" style={{ "--d": "0.1s" }} onError={e => e.target.style.display='none'} />
        <p className="yb-splash-eyebrow" style={{ "--d": "0.22s" }}>
          <span className="yb-splash-eyebrow-rule" />
          2023 &mdash; 2026
          <span className="yb-splash-eyebrow-rule" />
        </p>
        <h1 className="yb-splash-title" style={{ "--d": "0.34s" }}>Year<em>book</em></h1>
        <p className="yb-splash-sub" style={{ "--d": "0.5s" }}>ini milik kita, untuk selamanya</p>
        <button className="yb-splash-btn yb-splash-btn--ready" style={{ "--d": "0.64s" }} onClick={handleEnter}>
          <span>Buka Yearbook</span>
          <span className="yb-splash-btn-arrow">→</span>
        </button>
      </div>
    </div>
  );
}

// ─── Device tier detection ────────────────────────────────────────────────────
function isLowEndDevice() {
  const memory = navigator.deviceMemory ?? 4;
  const cores  = navigator.hardwareConcurrency ?? 4;
  const conn   = navigator.connection?.effectiveType ?? '4g';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  return reduced || memory <= 2 || cores <= 2 || conn === 'slow-2g' || conn === '2g';
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function YearbookApp() {
  const [selected, setSelected] = useState(null);
  const [extractedPalettes, setExtractedPalettes] = useState(() => {
    const initial = {};
    CLASSES.forEach(cls => {
      if (cls.palette) initial[cls.pdf] = cls.palette;
    });
    return initial;
  });
  const [entered, setEntered]   = useState(false);
  const [showVideoBanner, setShowVideoBanner] = useState(() => {
    return localStorage.getItem('yb-video-dismissed-v2') !== '1';
  });
  const [lowEnd] = useState(isLowEndDevice);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = lowEnd ? 'auto' : 'smooth';
    return () => { document.documentElement.style.scrollBehavior = ''; };
  }, [lowEnd]);

  if (!entered) {
    return (
      <>
        <style>{STYLES}</style>
        <SplashScreen onEnter={() => setEntered(true)} />
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="yb-page">
        {!lowEnd && <FloatingParticles />}
      
        {showVideoBanner && (
          <div className="yb-video-banner-overlay">
            <div className="yb-video-banner">
              <button className="yb-video-banner-close" onClick={() => { setShowVideoBanner(false); localStorage.setItem('yb-video-dismissed-v2', '1'); }}>✕</button>
              <div className="yb-video-wrapper">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/uOMjhAj8aBI?autoplay=1&mute=1&start=31"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                ></iframe>
              </div>
            </div>
          </div>
        )}

        {/* Dekorasi per-tema */}
        <div className="yb-grain" aria-hidden="true" />
        <div className="yb-ruled" aria-hidden="true" />
        <div className="yb-editorial-stripe" aria-hidden="true" />

        {/* ── Navbar ──────────────────────────── */}
        <nav className="yb-navbar">
          <div className="yb-navbar-inner">
            <span className="yb-navbar-brand">
              <img src="/logomaha.png" alt="Logo" className="yb-navbar-logo" />
              <span className="yb-navbar-brand-text">
                Yearbook
                <em>SMKN 2 Purwakarta · 2026</em>
              </span>
            </span>
            
          </div>
        </nav>

        {/* ── Hero ────────────────────────────── */}
        <header className="yb-hero">
          <span className="yb-hero-ghost" aria-hidden="true" style={{ transform: "translate(-50%, -50%)" }}>2026</span>
          <div className="yb-hero-inner">
            <div className="yb-tape yb-tape--left"  aria-hidden="true" style={{ transform: "rotate(-3deg)" }} />
            <div className="yb-tape yb-tape--right" aria-hidden="true" style={{ transform: "rotate(4deg)" }} />

            <img src="/logomaha.png" alt="Logo 2026" className="yb-hero-logo" />

            <p className="yb-hero-meta">
              <span>Vol. 01</span>
              <span className="yb-hero-meta-dot" />
              <span>Mahawaluya Pangestu</span>
              <span className="yb-hero-meta-dot" />
              <span>SMKN 2 Purwakarta</span>
            </p>

            <h1 className="yb-hero-title">
              Year<em>book</em>
            </h1>

            <div className="yb-hero-rule" aria-hidden="true">
              <span /><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><span />
            </div>

            <p className="yb-hero-sub">ini milik kita, untuk selamanya</p>

            <HeroPhotos />

            <div className="yb-hero-scrolls">
              <a href="#kelas" className="yb-hero-scroll" aria-label="Gulir ke daftar kelas">
                <span>Lihat Kelas</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
              </a>
              <a href="#kenangan" className="yb-hero-scroll" aria-label="Gulir ke kotak kenangan">
                <span>Lihat Sticky Memory</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
              </a>
            </div>
          </div>
        </header>

        {/* ── Foreword ────────────────────────────── */}
        <section className="yb-foreword">
          <span className="yb-foreword-mark" aria-hidden="true">&ldquo;</span>
          <p className="yb-foreword-quote">
            Tiga tahun, ribuan tawa, dan satu cerita yang kita tulis bersama. Halaman boleh menua, tapi kenangan ini milik kita, untuk selamanya.
          </p>
          <div className="yb-foreword-sign">
            <span className="yb-foreword-rule" />
            <span className="yb-foreword-author">mahawaluya pangestu</span>
          </div>
        </section>

        {/* ── Grid ────────────────────────────── */}
        <main className="yb-main" id="kelas">
          <div className="yb-section-header">
            <span className="yb-section-index">01</span>
            <div className="yb-section-titles">
              <p className="yb-section-label">Pilih Kelas</p>
              <p className="yb-section-desc">{CLASSES.length} kelas &middot; ketuk untuk membuka buku</p>
            </div>
            <span className="yb-section-line" />
          </div>

          <div className="yb-grid">
            {CLASSES.map((cls, i) => (
                <button
                  key={cls.id}
                  onClick={() => setSelected(cls)}
                  onMouseEnter={() => fetch(cls.pdf.replace(".pdf", "-optimized.pdf"), { priority: "low" }).catch(() => {})}
                  className="yb-card"
                  style={{
                    ...getCardStyle(cls, i, extractedPalettes),
                    "--i": i
                  }}
                >
                  <div className="yb-book-3d">
                    <div className="yb-book-back" />
                    <div className="yb-book-pages" />
                    <div className="yb-book-front">
                      <BookCoverThumbnail cover={cls.cover} hue={cls.hue} />
                      <div className="yb-spine-shadow" />
                      <div className="yb-spine-highlight" />
                      <div className="yb-spine-crease" />
                      <div className="yb-spine-band" />
                      <div className="yb-gloss" />
                      <div className="yb-book-label">
                        <span className="yb-card-name">{cls.name}</span>
                        <span className="yb-card-cta">↗</span>
                      </div>
                    </div>
                  </div>
              </button>
            ))}
          </div>
        </main>

        <MessageWall />

        <footer className="yb-footer">
          <div className="yb-footer-divider" aria-hidden="true">
            <span /><em>rey</em><span />
          </div>
          <img src="/logomaha.png" alt="" className="yb-footer-logo" onError={e => e.target.style.display='none'} />
          <p className="yb-footer-motto">ini milik kita, untuk selamanya</p>
          <p className="yb-footer-meta">
            <span>SMKN 2 Purwakarta</span>
            <span className="yb-footer-dot" />
            <span>Yearbook Vol. 01</span>
            <span className="yb-footer-dot" />
            <span>2026</span>
          </p>
          <p className="yb-footer-copy">&copy; 2026 &middot; Kenangan tak pernah pudar</p>
        </footer>
      </div>

      {selected && (
        <FlipBookViewer
          classData={selected}
          onClose={() => setSelected(null)}
          viewerThemeStyle={getViewerThemeStyle(extractedPalettes[selected.pdf] ?? selected.palette ?? buildPalette(selected.hue))}
        />
      )}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
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


@keyframes fadeUpStagger {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ════════════════════════════════════════
   VIDEO BANNER
   ════════════════════════════════════════ */
.yb-video-banner-overlay {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  animation: overlayIn 0.5s ease;
}

.yb-video-banner {
  position: relative;
  background: var(--yb-bg);
  padding: 8px;
  border-radius: 8px;
  width: 100%; max-width: 800px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  animation: fadeUpStagger 0.5s ease backwards;
}

.yb-video-banner-close {
  position: absolute; top: -16px; right: -16px;
  width: 32px; height: 32px;
  background: var(--yb-accent); color: #fff;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: bold; cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  transition: transform 0.2s;
  z-index: 2;
}
.yb-video-banner-close:hover { transform: scale(1.1); background: #ff3333; }

.yb-video-wrapper {
  position: relative; width: 100%; padding-bottom: 56.25%;
  border-radius: 4px; overflow: hidden;
}
.yb-video-wrapper iframe {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
}

/* ════════════════════════════════════════
   PARTICLES
   ════════════════════════════════════════ */
@keyframes fallingLeaves {
  0% { transform: translate(0, -10vh) rotate(0deg); opacity: 0; }
  10% { opacity: var(--base-opacity, 0.5); }
  90% { opacity: var(--base-opacity, 0.5); }
  100% { transform: translate(var(--sway), 110vh) rotate(var(--rot)); opacity: 0; }
}

.yb-particles {
  position: absolute; inset: 0;
  pointer-events: none; z-index: -1; overflow: hidden;
}

.yb-particle {
  position: absolute; top: -10vh;
  animation: fallingLeaves var(--duration) linear infinite;
  animation-delay: var(--delay);
  pointer-events: none;
}

.yb-particle--icon {
  background: transparent;
  color: var(--yb-ink-faint);
  display: flex; align-items: center; justify-content: center;
}
.yb-particle--icon svg {
  width: 100%; height: 100%;
}

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

.yb-navbar {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: center;
  padding: 0 32px;
  height: 68px;
  background: var(--yb-navbar-bg);
  backdrop-filter: blur(16px) saturate(140%);
  border-bottom: 1px solid var(--yb-border);
}

.yb-navbar-inner {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; max-width: 1140px; margin: 0 auto;
  gap: 12px;
}
.yb-nav-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

.yb-nav-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--yb-page-font);
  font-size: 12.5px;
  color: var(--yb-ink-mid);
  padding: 7px 14px;
  border-radius: 20px;
  border: 1px solid var(--yb-border);
  background: rgba(255,255,255,0.25);
  transition: all 0.25s ease;
  white-space: nowrap;
}
.yb-nav-ico { font-size: 13px; line-height: 1; }
.yb-nav-btn:hover {
  background: var(--yb-ink); color: var(--yb-bg);
  border-color: var(--yb-ink);
  transform: translateY(-1px);
}


.yb-navbar-brand {
  display: flex; align-items: center; gap: 12px;
  color: var(--yb-ink);
}
.yb-navbar-brand-text {
  display: flex; flex-direction: column; line-height: 1;
  font-family: var(--yb-title-font);
  font-size: 19px; letter-spacing: 0.01em;
}
.yb-navbar-brand-text em {
  font-family: var(--yb-page-font);
  font-style: normal; font-size: 9.5px;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--yb-ink-faint); margin-top: 3px;
}

.yb-navbar-logo {
  width: 46px; height: 46px;
  object-fit: contain;
  border-radius: 6px;
}
@media (max-width: 600px) {
  .yb-navbar { padding: 0 16px; height: 60px; }
  .yb-navbar-brand-text em { display: none; }
  .yb-navbar-brand { gap: 9px; }
  .yb-navbar-logo { width: 30px; height: 30px; }
  .yb-nav-actions { gap: 7px; }
  .yb-nav-btn { padding: 7px 11px; font-size: 11.5px; }
}
@media (max-width: 430px) {
  .yb-nav-lbl { display: none; } /* BGM/tema jadi icon-only */
  .yb-nav-btn { padding: 8px 9px; }
  .yb-nav-ico { font-size: 14px; }
  .yb-nav-btn--admin { padding: 7px 13px; }
  .yb-navbar-brand-text { font-size: 16px; }
}

.yb-hero-logo {
  width: 148px;
  height: 148px;
  object-fit: contain;
  margin: 0 auto 22px;
  display: block;
  animation: heroRise 0.9s cubic-bezier(0.16,1,0.3,1) 0.05s backwards;
}

.yb-hero {
  position: relative; z-index: 1;
  text-align: center;
  padding: 64px 24px 40px;
  border-bottom: 1px solid var(--yb-border);
  background: linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%);
  overflow: hidden;
}

.yb-hero-inner {
  max-width: 820px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

@keyframes heroRise {
  from { opacity: 0; transform: translateY(26px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* giant ghost year behind */
.yb-hero-ghost {
  position: absolute; top: 50%; left: 50%;
  font-family: var(--yb-title-font);
  font-size: clamp(220px, 42vw, 560px);
  font-weight: 400; line-height: 1;
  color: var(--yb-ink);
  opacity: 0.04; pointer-events: none; user-select: none;
  white-space: nowrap; z-index: 0;
  letter-spacing: -0.03em;
}

.yb-hero-meta {
  display: flex; align-items: center; justify-content: center;
  flex-wrap: wrap; gap: 12px;
  font-family: var(--yb-page-font);
  font-size: 11px; letter-spacing: 0.26em; text-transform: uppercase;
  color: var(--yb-ink-faint);
  margin-bottom: 18px;
  animation: heroRise 0.9s cubic-bezier(0.16,1,0.3,1) 0.18s backwards;
}
.yb-hero-meta-dot {
  width: 4px; height: 4px; border-radius: 50%;
  background: var(--yb-accent); opacity: 0.55;
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
  position: absolute; top: 10px;
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
  margin-bottom: 12px;
}

.yb-eyebrow-rule {
  display: inline-block; width: 48px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--yb-ink-faint), transparent);
  opacity: 0.5;
}

.yb-hero-title {
  font-family: var(--yb-title-font);
  font-size: clamp(64px, 12vw, 124px);
  font-weight: 400;
  line-height: 0.9;
  color: var(--yb-ink);
  letter-spacing: -0.01em;
  margin-bottom: 18px;
  text-shadow: 2px 4px 12px rgba(44,27,14,0.06);
  animation: heroRise 1s cubic-bezier(0.16,1,0.3,1) 0.3s backwards;
}

.yb-hero-title em {
  font-style: italic;
  background: linear-gradient(110deg, #a2722b 0%, #d8b672 30%, #fff0c8 48%, #c79a55 65%, #875c1c 100%);
  background-size: 220% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  padding-right: 0.1em;
  animation: heroFoil 6s linear infinite;
}
@keyframes heroFoil { to { background-position: 220% center; } }

.yb-hero-rule {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  color: var(--yb-accent);
  margin-bottom: 18px;
  animation: heroRise 1s cubic-bezier(0.16,1,0.3,1) 0.42s backwards;
}
.yb-hero-rule span {
  width: 64px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--yb-ink-faint));
  opacity: 0.6;
}
.yb-hero-rule span:last-child { transform: scaleX(-1); }
.yb-hero-rule svg { width: 16px; height: 16px; opacity: 0.7; }

.yb-hero-sub {
  font-family: var(--yb-hand-font);
  font-size: 26px;
  color: var(--yb-ink-mid);
  letter-spacing: 0.01em;
  margin-bottom: 36px;
  animation: heroRise 1s cubic-bezier(0.16,1,0.3,1) 0.54s backwards;
}

.yb-hero-scrolls {
  display: flex; justify-content: center; align-items: flex-start;
  gap: 40px; flex-wrap: wrap;
}
.yb-hero-scroll {
  display: inline-flex; flex-direction: column; align-items: center; gap: 8px;
  font-family: var(--yb-page-font);
  font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase;
  color: var(--yb-ink-faint);
  text-decoration: none;
  transition: color 0.25s ease;
  animation: heroRise 1s cubic-bezier(0.16,1,0.3,1) 0.66s backwards;
}
.yb-hero-scroll svg {
  width: 18px; height: 18px;
  animation: scrollBob 1.8s ease-in-out infinite;
}
.yb-hero-scroll:hover { color: var(--yb-accent); }
@keyframes scrollBob {
  0%, 100% { transform: translateY(0); opacity: 0.6; }
  50%      { transform: translateY(5px); opacity: 1; }
}

/* ── Hero Photos ─────────────────────────── */
.yb-hero-photos {
  margin: 28px 0 24px;
  animation: heroRise 1s cubic-bezier(0.16,1,0.3,1) 0.55s backwards;
}

/* Desktop: side by side */
.yb-hero-photos-row {
  display: flex;
  justify-content: center;
  gap: 20px;
}
.yb-hero-photos-carousel { display: none; }

.yb-hero-photo-wrap {
  position: relative;
  background: #fff;
  padding: 8px 8px 30px;
  box-shadow:
    0 4px 12px rgba(0,0,0,0.12),
    0 1px 3px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.yb-hero-photo-wrap:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.1);
}
.yb-hero-photo-wrap--0 { transform: rotate(-2.5deg); }
.yb-hero-photo-wrap--0:hover { transform: rotate(-1deg) scale(1.02); }
.yb-hero-photo-wrap--1 { transform: rotate(2deg); margin-top: 16px; }
.yb-hero-photo-wrap--1:hover { transform: rotate(0.5deg) scale(1.02); }

.yb-hero-photo {
  display: block;
  width: 420px;
  height: auto;
  user-select: none;
}

/* Mobile: carousel */
@media (max-width: 640px) {
  .yb-hero-photos-row { display: none; }
  .yb-hero-photos-carousel {
    display: block;
    position: relative;
    overflow: hidden;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
  .yb-hero-photos-track {
    display: flex;
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .yb-hero-photo-slide {
    flex: 0 0 100%;
    display: flex;
    justify-content: center;
    padding: 8px 4px 4px;
  }
  .yb-hero-photo-wrap--0 { transform: rotate(-1.5deg); }
  .yb-hero-photo-wrap--0:hover { transform: rotate(-1.5deg); }
  .yb-hero-photo-wrap--1 { transform: rotate(1.5deg); margin-top: 0; }
  .yb-hero-photo-wrap--1:hover { transform: rotate(1.5deg); }
  .yb-hero-photo { width: 100%; height: auto; }
  .yb-hero-photos-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
  }
  .yb-hero-photos-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--yb-ink-faint);
    opacity: 0.35;
    transition: opacity 0.2s, background 0.2s;
    cursor: pointer;
  }
  .yb-hero-photos-dot.active {
    background: var(--yb-accent);
    opacity: 1;
  }
}

/* ════════════════════════════════════════
   MAIN & SECTION LABEL
   ════════════════════════════════════════ */
.yb-foreword {
  max-width: 680px;
  margin: 0 auto;
  padding: 64px 24px 24px;
  text-align: center;
  position: relative;
}
.yb-foreword-mark {
  display: block;
  font-family: var(--yb-title-font);
  font-size: 96px; line-height: 0.4;
  color: var(--yb-accent);
  opacity: 0.25;
  margin-bottom: 8px;
}
.yb-foreword-quote {
  font-family: var(--yb-title-font);
  font-size: clamp(20px, 3vw, 28px);
  color: var(--yb-ink);
  line-height: 1.5;
  font-style: italic;
  margin-bottom: 24px;
}
.yb-foreword-sign {
  display: flex; align-items: center; justify-content: center; gap: 14px;
}
.yb-foreword-rule {
  width: 40px; height: 1px; background: var(--yb-accent); opacity: 0.5;
}
.yb-foreword-author {
  font-family: var(--yb-page-font);
  font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--yb-ink-faint);
}

.yb-main {
  position: relative; z-index: 1;
  max-width: 1140px; margin: 0 auto;
  padding: 48px 32px 100px;
  scroll-margin-top: 80px;
}

.yb-section-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 44px;
}
.yb-section-index {
  font-family: var(--yb-title-font);
  font-size: 40px; line-height: 1;
  color: var(--yb-accent);
  flex-shrink: 0;
  position: relative; top: -2px;
}
.yb-section-titles { flex-shrink: 0; }
.yb-section-label {
  font-family: var(--yb-title-font);
  font-size: 28px; line-height: 1.1;
  color: var(--yb-ink);
  letter-spacing: 0.01em;
}
.yb-section-desc {
  font-family: var(--yb-page-font);
  font-size: 12.5px; letter-spacing: 0.08em;
  color: var(--yb-ink-faint);
  margin-top: 3px;
}
.yb-section-line {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, var(--yb-border), transparent);
}
@media (max-width: 560px) {
  .yb-section-index { font-size: 32px; }
  .yb-section-label { font-size: 23px; }
  .yb-section-line { display: none; }
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
   CARD — BOOK
   ════════════════════════════════════════ */
/* ── Card = perspective wrapper ─────────────────── */
.yb-card {
  position: relative;
  width: 100%; aspect-ratio: 3/4;
  perspective: 1000px;
  cursor: pointer;
  border: none;
  padding: 0;
  background: none;
  animation: fadeUpStagger 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  animation-delay: calc(var(--i) * 0.05s);
  box-shadow:
    3px 6px 16px rgba(0,0,0,0.32),
    1px 2px 5px rgba(0,0,0,0.16);
  transition: box-shadow 0.25s ease;
}

/* ── 3D book transform ───────────────────────────── */
.yb-book-3d {
  width: 100%; height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transform-origin: left center;
  transform: rotateY(-2deg);
  transition: transform 0.25s ease-out;
}

.yb-card:hover .yb-book-3d {
  transform: rotateY(-8deg) scale(1.02) translateX(-2px);
}

.yb-card:hover {
  box-shadow:
    5px 10px 28px rgba(0,0,0,0.44),
    2px 4px 8px rgba(0,0,0,0.22);
}

/* ── Book back cover ─────────────────────────────── */
.yb-book-back {
  position: absolute; inset: 0;
  background: #f0ebe0;
  border-radius: 2px 10px 10px 2px;
  transform: translateZ(-8px);
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: -2;
}
.yb-card:hover .yb-book-back { transform: translateZ(-8px) translateX(9px); }

/* ── Book page stack ─────────────────────────────── */
.yb-book-pages {
  position: absolute;
  inset: 4px 2px 4px 0;
  background: #f9f5ee;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 2px 8px 8px 2px;
  transform: translateZ(-5px);
  box-shadow: inset 4px 0 10px rgba(0,0,0,0.05);
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: -1;
  overflow: hidden;
}
.yb-book-pages::before {
  content: '';
  position: absolute; top: 0; right: 2px; bottom: 0; left: 0;
  background: repeating-linear-gradient(to right, transparent, transparent 1px, rgba(0,0,0,0.04) 2px, transparent 3px);
}
.yb-card:hover .yb-book-pages { transform: translateZ(-5px) translateX(5px); }

/* ── Book front face ─────────────────────────────── */
.yb-book-front {
  position: absolute; inset: 0;
  border-radius: 3px 8px 8px 3px;
  overflow: hidden;
  z-index: 10;
  background: var(--hue, #5a7a9a);
}

/* ── Cover image ─────────────────────────────────── */
.yb-book-cover-wrap {
  position: absolute; inset: 0;
  overflow: hidden; z-index: 1;
}
.yb-book-cover-placeholder {
  position: absolute; inset: 0;
  z-index: 0; transition: opacity 0.4s ease;
}
.yb-book-cover-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; z-index: 1;
}

/* ── Spine overlays ──────────────────────────────── */
.yb-spine-shadow {
  position: absolute; top: 0; bottom: 0; left: 0; width: 22px;
  background: linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.15), transparent);
  pointer-events: none; z-index: 2;
}
.yb-spine-highlight {
  position: absolute; top: 0; bottom: 0; left: 0; width: 2px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(255,255,255,0.3), rgba(255,255,255,0.1));
  pointer-events: none; z-index: 3;
}
.yb-spine-crease {
  position: absolute; top: 0; bottom: 0; left: 3px; width: 1.5px;
  background: rgba(0,0,0,0.2);
  pointer-events: none; z-index: 3;
}
.yb-spine-band {
  position: absolute; top: 0; bottom: 0; left: 5px; width: 6px;
  background: linear-gradient(to right, rgba(0,0,0,0.1), transparent);
  pointer-events: none; z-index: 2;
}
.yb-gloss {
  position: absolute; inset: 0;
  background: linear-gradient(130deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05) 40%, transparent);
  pointer-events: none; z-index: 4;
}

/* ── Bottom label ────────────────────────────────── */
.yb-book-label {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 28px 12px 12px;
  background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 70%, transparent 100%);
  z-index: 5;
  display: flex; flex-direction: row;
  align-items: flex-end; justify-content: space-between;
  transition: background 0.3s ease;
}
.yb-card:hover .yb-book-label {
  background: linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.15) 70%, transparent 100%);
}

.yb-card-name {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 15px; font-weight: 700;
  color: #ffffff; line-height: 1.2;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5);
}
.yb-card-cta {
  font-size: 18px;
  color: rgba(255,255,255,0.5);
  transition: color 0.3s ease, transform 0.3s ease;
  line-height: 1;
}
.yb-card:hover .yb-card-cta {
  color: rgba(255,255,255,0.95);
  transform: translateX(3px);
}

/* ════════════════════════════════════════
   KOTAK KENANGAN — papan scrapbook + sticky notes
   ════════════════════════════════════════ */
.yb-kenangan {
  position: relative; z-index: 1;
  max-width: 1040px; margin: 0 auto; padding: 80px 24px 40px;
  font-family: var(--yb-page-font);
}
.yb-kenangan-head { text-align: center; margin-bottom: 44px; }
.yb-kenangan-kicker {
  display: inline-block;
  font-family: var(--yb-hand-font);
  font-size: 26px; color: var(--yb-accent);
  transform: rotate(-2.5deg);
}
.yb-kenangan-title {
  font-family: var(--yb-title-font);
  font-size: clamp(34px, 7vw, 56px);
  color: var(--yb-ink); margin: 2px 0 10px; line-height: 1.05;
}
.yb-kenangan-sub {
  color: var(--yb-ink-mid); font-size: 15px; margin: 0 auto; max-width: 440px;
}

/* ── Notepad bergaris (form tulis) ── */
.yb-notepad {
  position: relative;
  max-width: 460px; margin: 0 auto 64px;
  transform: rotate(-1deg);
  filter: drop-shadow(0 14px 26px rgba(60, 42, 24, 0.18));
  transition: transform 0.3s ease;
}
.yb-notepad:focus-within { transform: rotate(0deg); }
.yb-notepad-rings {
  position: absolute; top: -9px; left: 26px; right: 26px;
  display: flex; justify-content: space-between; z-index: 3;
}
.yb-notepad-rings span {
  width: 13px; height: 18px; border-radius: 7px;
  background: linear-gradient(180deg, #c9b48f, #8a7350);
  box-shadow: inset 0 -2px 3px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.3);
}
.yb-notepad-sheet {
  position: relative; padding: 26px 22px 18px 56px;
  background:
    /* garis tepi merah margin */
    linear-gradient(90deg, transparent 42px, rgba(196, 92, 74, 0.5) 42px, rgba(196, 92, 74, 0.5) 44px, transparent 44px),
    /* baris-baris */
    repeating-linear-gradient(180deg, transparent 0 35px, rgba(120, 150, 175, 0.28) 35px 36px),
    #fffdf6;
  border-radius: 3px 3px 5px 5px;
  border: 1px solid rgba(170, 150, 120, 0.4);
}
.yb-notepad-text {
  display: block; width: 100%; box-sizing: border-box;
  border: none; outline: none; resize: none; background: transparent;
  font-family: var(--yb-hand-font); font-size: 24px; line-height: 36px;
  color: #2a3a4a; padding: 0; min-height: 108px;
}
.yb-notepad-text::placeholder { color: rgba(90, 110, 130, 0.5); }
.yb-notepad-sign {
  display: flex; align-items: baseline; gap: 6px;
  margin-top: 6px; line-height: 36px;
}
.yb-notepad-dash { font-family: var(--yb-hand-font); font-size: 22px; color: var(--yb-accent); }
.yb-notepad-name {
  flex: 1; border: none; outline: none; background: transparent;
  font-family: var(--yb-hand-font); font-size: 22px; color: var(--yb-accent);
}
.yb-notepad-name::placeholder { color: rgba(184, 94, 69, 0.45); }
.yb-notepad-colors {
  display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
  margin-top: 14px;
}
.yb-notepad-colors-label {
  font-family: var(--yb-hand-font); font-size: 18px; color: var(--yb-accent);
  margin-right: 2px;
}
.yb-swatch {
  width: 24px; height: 24px; padding: 0; cursor: pointer;
  border: 1px solid rgba(80, 60, 40, 0.25); border-radius: 50%;
  box-shadow: inset 0 -2px 3px rgba(0,0,0,0.08);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.yb-swatch:hover { transform: scale(1.15) rotate(-6deg); }
.yb-swatch.is-active {
  transform: scale(1.2);
  border-color: var(--yb-ink);
  box-shadow: 0 0 0 2px var(--yb-bg-lt), 0 0 0 4px var(--yb-ink);
}
.yb-notepad-foot {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 12px; padding-left: 0;
}
.yb-notepad-count { font-family: var(--yb-page-font); font-size: 11px; color: var(--yb-ink-faint); }
.yb-notepad-btn {
  font-family: var(--yb-page-font); font-size: 14px; font-weight: 700;
  letter-spacing: 0.02em; color: #fff;
  background: var(--yb-accent);
  border: none; border-radius: 3px; padding: 9px 20px; cursor: pointer;
  box-shadow: 0 3px 0 rgba(120, 56, 40, 0.7);
  transition: transform 0.1s, box-shadow 0.1s, opacity 0.2s;
}
.yb-notepad-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 0 rgba(120,56,40,0.7); }
.yb-notepad-btn:active:not(:disabled) { transform: translateY(2px); box-shadow: 0 1px 0 rgba(120,56,40,0.7); }
.yb-notepad-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
.yb-notepad-error {
  margin: 8px 0 0; color: #b02e1c; font-family: var(--yb-page-font); font-size: 13px;
}
.yb-notepad-ok {
  margin: 8px 0 0; color: #2f8f5b; font-family: var(--yb-page-font); font-size: 13px;
  animation: okFade .3s ease both;
}
@keyframes okFade { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: none; } }
.yb-notepad-btn.is-done {
  background: #2f8f5b; box-shadow: 0 3px 0 rgba(20,80,50,0.7);
}

/* ── Papan tempel (masonry sticky notes) ── */
.yb-refresh-btn {
  display: inline-flex; align-items: center; gap: 7px;
  margin-top: 16px; padding: 7px 16px;
  font-family: var(--yb-page-font); font-size: 11px;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--yb-accent);
  background: transparent;
  border: 1px solid rgba(184, 94, 69, 0.4);
  border-radius: 999px; cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
}
.yb-refresh-btn svg { width: 14px; height: 14px; }
.yb-refresh-btn:hover:not(:disabled) {
  background: rgba(184, 94, 69, 0.08);
  border-color: var(--yb-accent);
  transform: translateY(-1px);
}
.yb-refresh-btn:disabled { opacity: 0.6; cursor: progress; }
.yb-refresh-btn.is-spinning svg { animation: ybSpin 0.8s linear infinite; }
@keyframes ybSpin { to { transform: rotate(360deg); } }

/* ── Peringatan penyalahgunaan ── */
.yb-kenangan-warn {
  display: flex; align-items: flex-start; gap: 10px;
  max-width: 460px; margin: -44px auto 24px;
  padding: 12px 16px;
  background: rgba(214, 168, 90, 0.14);
  border: 1px solid rgba(196, 140, 60, 0.4);
  border-left: 4px solid #c4923c;
  border-radius: 4px;
}
.yb-kenangan-warn-ic { font-size: 17px; line-height: 1.5; flex-shrink: 0; }
.yb-kenangan-warn p {
  margin: 0; font-family: var(--yb-page-font);
  font-size: 12.5px; line-height: 1.5; color: var(--yb-ink-mid);
}
.yb-kenangan-warn b { color: var(--yb-ink); }

/* ── Cari note ── */
.yb-board-search {
  position: relative; display: flex; align-items: center;
  max-width: 440px; margin: 0 auto 22px;
}
.yb-board-search-ic {
  position: absolute; left: 14px; width: 17px; height: 17px;
  color: var(--yb-ink-faint); pointer-events: none;
}
.yb-board-search-input {
  width: 100%; box-sizing: border-box;
  font-family: var(--yb-page-font); font-size: 14px; color: var(--yb-ink);
  background: var(--yb-bg-lt); border: 1px solid var(--yb-border);
  border-radius: 999px; padding: 11px 38px 11px 40px; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.yb-board-search-input::placeholder { color: var(--yb-ink-faint); }
.yb-board-search-input:focus {
  border-color: var(--yb-accent);
  box-shadow: 0 0 0 3px rgba(184, 94, 69, 0.12);
}
.yb-board-search-clear {
  position: absolute; right: 8px;
  display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border: none; border-radius: 50%;
  background: rgba(80,60,40,0.1); color: var(--yb-ink-mid);
  font-size: 12px; cursor: pointer; transition: background 0.2s;
}
.yb-board-search-clear:hover { background: rgba(80,60,40,0.2); }
.yb-board-result {
  text-align: center; margin: 0 0 26px;
  font-family: var(--yb-hand-font); font-size: 20px; color: var(--yb-accent);
}

.yb-board {
  display: flex; flex-wrap: wrap;
  align-items: flex-start; justify-content: center;
  gap: 16px 14px;
}
.yb-board-empty {
  flex-basis: 100%; text-align: center;
  font-family: var(--yb-hand-font); font-size: 22px;
  color: var(--yb-ink-faint); padding: 28px 0;
}
.yb-note {
  position: relative;
  width: fit-content; min-width: 96px; max-width: 190px;
  padding: 16px 14px 11px;
  transform: rotate(var(--rot, 0deg));
  box-shadow: 2px 5px 14px rgba(60, 42, 24, 0.18);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}
.yb-note:hover {
  transform: rotate(0deg) scale(1.035);
  box-shadow: 4px 10px 24px rgba(60, 42, 24, 0.28);
  z-index: 4;
}
/* selotip washi */
.yb-note-tape {
  position: absolute; top: -9px; left: 50%;
  width: 58px; height: 19px; margin-left: -29px;
  transform: rotate(var(--tape-rot, 0deg));
  background: rgba(255, 255, 255, 0.45);
  border-left: 1px dashed rgba(255,255,255,0.55);
  border-right: 1px dashed rgba(255,255,255,0.55);
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  backdrop-filter: blur(1px);
}
.yb-note-body {
  margin: 0 0 11px; color: #33291d;
  font-family: var(--yb-hand-font); font-size: 16px; line-height: 1.4;
  white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere;
}
.yb-note-meta {
  display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
  border-top: 1px dashed rgba(80, 60, 40, 0.28); padding-top: 6px;
}
.yb-note-from {
  font-family: var(--yb-hand-font); font-size: 15px; font-weight: 700;
  color: var(--yb-accent);
}
.yb-note-time {
  font-family: var(--yb-page-font); font-size: 8.5px; letter-spacing: 0.04em;
  color: rgba(80, 60, 40, 0.5); text-transform: uppercase; white-space: nowrap;
}
/* varian warna kertas */
.yb-note--t0 { background: #fef3c0; }
.yb-note--t1 { background: #fcded0; }
.yb-note--t2 { background: #d7eed9; }
.yb-note--t3 { background: #fbd6e2; }
.yb-note--t4 { background: #d6e6f4; }
.yb-note--t5 { background: #ece2f7; }

.yb-note--pinned {
  box-shadow:
    0 12px 36px rgba(60, 42, 24, 0.28),
    0 28px 64px rgba(60, 42, 24, 0.14),
    0 2px 6px rgba(0,0,0,0.1);
  z-index: 2;
}
.yb-note--pinned:hover {
  box-shadow:
    0 16px 48px rgba(60, 42, 24, 0.32),
    0 36px 80px rgba(60, 42, 24, 0.18);
  z-index: 5;
}
/* note baru ditempel — sorot sebentar biar user langsung lihat */
.yb-note--new {
  animation: notePop 2.6s ease both;
  z-index: 6;
}
@keyframes notePop {
  0%   { box-shadow: 0 0 0 0 rgba(47,143,91,0.0); }
  12%  { box-shadow: 0 0 0 4px rgba(47,143,91,0.55), 0 14px 40px rgba(47,143,91,0.3); transform: scale(1.04) rotate(var(--rot)); }
  100% { box-shadow: 0 0 0 0 rgba(47,143,91,0.0); }
}

/* CSS pushpin — kepala bulat 3D + batang metalik */
.yb-note-pin {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: radial-gradient(circle at 37% 33%, #f5a89a, #c0392b 52%, #8e1a10);
  box-shadow:
    inset 2px 2px 4px rgba(255,255,255,0.38),
    inset -1px -1px 3px rgba(0,0,0,0.35),
    0 5px 12px rgba(0,0,0,0.4),
    0 2px 4px rgba(0,0,0,0.25);
  pointer-events: none;
  z-index: 3;
}
/* shine spot */
.yb-note-pin::before {
  content: '';
  position: absolute;
  top: 3px; left: 4px;
  width: 5px; height: 4px;
  border-radius: 50%;
  background: rgba(255,255,255,0.55);
  transform: rotate(-20deg);
}
/* batang pin metalik */
.yb-note-pin::after {
  content: '';
  position: absolute;
  top: calc(100% - 1px);
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 12px;
  background: linear-gradient(to bottom, #aab3ba 0%, #8a9199 45%, #606970 100%);
  border-radius: 0 0 2px 2px;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.22);
}

@media (max-width: 540px) {
  .yb-notepad { max-width: 100%; }
}

/* ════════════════════════════════════════
   FOOTER
   ════════════════════════════════════════ */
.yb-footer {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center;
  gap: 14px; padding: 56px 32px 64px;
  text-align: center;
  border-top: 1px solid var(--yb-border);
  background: linear-gradient(0deg, rgba(255,255,255,0.35) 0%, transparent 100%);
}

.yb-footer-divider {
  display: flex; align-items: center; justify-content: center; gap: 14px;
  width: 100%; max-width: 220px; margin-bottom: 6px;
}
.yb-footer-divider span {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, transparent, var(--yb-border));
}
.yb-footer-divider span:last-child { transform: scaleX(-1); }
.yb-footer-divider em {
  font-family: var(--yb-hand-font);
  font-style: normal; font-size: 18px;
  color: var(--yb-ink-faint); letter-spacing: 0.05em;
}

.yb-footer-logo {
  width: 48px; height: 48px; object-fit: contain;
  opacity: 0.85; margin-bottom: 2px;
}
.yb-footer-motto {
  font-family: var(--yb-title-font);
  font-size: 22px; font-style: italic;
  color: var(--yb-ink);
}
.yb-footer-meta {
  display: flex; align-items: center; justify-content: center;
  flex-wrap: wrap; gap: 12px;
  font-family: var(--yb-page-font);
  font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--yb-ink-faint);
}
.yb-footer-dot {
  width: 3px; height: 3px; border-radius: 50%;
  background: var(--yb-accent); opacity: 0.5;
}
.yb-footer-copy {
  font-family: var(--yb-page-font);
  font-size: 11px; font-style: italic;
  color: var(--yb-ink-faint); opacity: 0.7;
  margin-top: 6px;
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

.yb-overlay > *:not(.yb-overlay-bg-stack):not(.yb-viewer-header):not(.yb-nav-arrow):not(.yb-pagination) { position: relative; z-index: 1; }

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
  position: absolute; top: 5px; left: 0; right: 0; /* 5px = tebal garis accent overlay */
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 28px;
  z-index: 100;
  background: rgba(12, 12, 12, 0.55);
  backdrop-filter: blur(16px) saturate(140%);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 4px 24px rgba(0,0,0,0.3);
}
.yb-viewer-meta, .yb-viewer-actions { pointer-events: auto; }

.yb-viewer-meta { display: flex; flex-direction: column; gap: 2px; }

.yb-viewer-eyebrow {
  font-family: 'Archivo', sans-serif;
  font-size: 10px; font-weight: 700; letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--yb-overlay-accent);
  opacity: 0.85;
}

.yb-viewer-title {
  font-family: var(--yb-title-font);
  font-size: 26px; font-weight: 400;
  color: #fff; letter-spacing: 0.02em;
  line-height: 1.1;
  text-shadow: 0 2px 12px rgba(0,0,0,0.5);
}

.yb-viewer-count {
  display: flex; align-items: baseline; gap: 3px;
  font-family: 'Archivo', sans-serif;
  font-size: 13px;
  color: rgba(255,255,255,0.45);
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(8px);
}
.yb-viewer-count strong { color: #fff; font-weight: 700; }
.yb-viewer-count em { font-style: normal; opacity: 0.7; margin-left: 2px; }

.yb-action-divider {
  width: 1px; height: 24px;
  background: rgba(255,255,255,0.12);
  margin: 0 2px;
}

.yb-viewer-actions { display: flex; align-items: center; gap: 10px; }

.yb-action-btn {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid transparent;
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.85); border-radius: 10px;
  transition: all 0.25s ease;
  position: relative;
  text-decoration: none;
}
.yb-action-btn:hover {
  background: var(--yb-overlay-accent);
  color: #000;
  transform: translateY(-1px);
}
.yb-close-btn { color: #fff; }
.yb-close-btn:hover { background: #ff4444; color: #fff; }
.yb-close-btn svg { width: 22px; height: 22px; }

.yb-action-tooltip {
  position: absolute; right: 100%; margin-right: 12px;
  background: rgba(0,0,0,0.8); color: #fff;
  padding: 6px 12px; border-radius: 4px;
  font-family: 'Archivo', sans-serif; font-size: 11px; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase;
  opacity: 0; pointer-events: none; transform: translateX(10px);
  transition: all 0.3s ease; white-space: nowrap;
}
.yb-action-btn:hover .yb-action-tooltip {
  opacity: 1; transform: translateX(0);
}

/* ── Book Area ───────────────────────────── */
.yb-book-area {
  flex: 1; display: flex; align-items: center; justify-content: center;
  width: 100%; position: relative; overflow: hidden;
  padding: 88px 0 92px; /* napas buat header bar + pagination */
}

.yb-book-shell {
  position: relative; display: inline-block;
  transform-origin: center center;
  will-change: transform;
  filter: drop-shadow(0 18px 36px rgba(0,0,0,0.45));
  cursor: pointer;
}
/* swipe/flip di HP: cegah browser ambil gesture horizontal jadi scroll */
.yb-flipbook,
.yb-flipbook * {
  touch-action: pan-y pinch-zoom;
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
/* layer transparan penangkap tap/swipe — di atas buku, di semua device */
.yb-tap-layer {
  position: absolute; inset: 0; z-index: 20;
  touch-action: pan-y pinch-zoom;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
/* contact shadow — elips lembut di bawah buku, bikin kesan "nempel permukaan" */
.yb-book-shell::before {
  content: '';
  position: absolute; left: 50%; bottom: -34px;
  transform: translateX(-50%);
  width: 86%; height: 60px;
  background: radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.28) 40%, transparent 72%);
  filter: blur(14px);
  pointer-events: none; z-index: -1;
}
/* center gutter seam — cuma muncul pas buku diam, sembunyi saat flip */
.yb-book-shell::after {
  content: '';
  position: absolute; top: 0; left: 50%;
  transform: translateX(-50%);
  width: 30px; height: 100%;
  background: linear-gradient(to right,
    transparent 0%,
    rgba(0,0,0,0.1) 36%,
    rgba(0,0,0,0.22) 50%,
    rgba(0,0,0,0.1) 64%,
    transparent 100%
  );
  pointer-events: none; z-index: 10;
  opacity: 1; transition: opacity 0.25s ease;
}
.yb-book-shell.is-flipping::after { opacity: 0; }

/* ── Loading ─────────────────────────────── */
.yb-loading-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 30px; position: absolute; inset: 0; justify-content: center; z-index: 20;
  backdrop-filter: blur(10px);
  animation: ybLoadIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes ybLoadIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ── Sampul buku tertutup ─────────────────── */
.yb-load-book {
  position: relative;
  width: 132px; height: 176px;
  border-radius: 4px 9px 9px 4px;
  background: var(--yb-overlay-bg-start, #15140f);
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow:
    0 1px 0 rgba(255,255,255,0.12) inset,
    -22px 30px 60px rgba(0,0,0,0.6),
    0 14px 30px rgba(0,0,0,0.45);
  overflow: hidden;
  animation: ybBookBreathe 3.4s ease-in-out infinite;
  will-change: transform;
}
/* cover asli kelas */
.yb-load-book-cover {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; object-position: center;
  border-radius: inherit;
}
/* gelapin tepi biar segel & foil kebaca di atas cover */
.yb-load-book-shade {
  position: absolute; inset: 0; border-radius: inherit;
  background:
    radial-gradient(120% 90% at 50% 38%, transparent 30%, rgba(0,0,0,0.55) 100%),
    linear-gradient(to top, rgba(0,0,0,0.6), transparent 45%);
}
@keyframes ybBookBreathe {
  0%, 100% { transform: translateY(0) rotate(-1.2deg); }
  50%      { transform: translateY(-7px) rotate(-1.2deg); }
}
/* punggung buku */
.yb-load-book-spine {
  position: absolute; top: 0; bottom: 0; left: 0; width: 11px;
  background: linear-gradient(to right,
    rgba(0,0,0,0.55), rgba(0,0,0,0.15) 60%, transparent);
  border-right: 1px solid rgba(255,255,255,0.05);
}
/* foil/cahaya yang menyapu sampul */
.yb-load-book-foil {
  position: absolute; inset: -40% -120%;
  background: linear-gradient(105deg,
    transparent 38%,
    var(--yb-overlay-accent) 49%,
    rgba(255,255,255,0.85) 50%,
    var(--yb-overlay-accent) 51%,
    transparent 62%);
  opacity: 0.5; mix-blend-mode: screen;
  transform: translateX(-60%);
  animation: ybFoilSweep 2.8s cubic-bezier(0.6, 0.05, 0.3, 1) infinite;
}
@keyframes ybFoilSweep {
  0%   { transform: translateX(-65%); }
  55%  { transform: translateX(65%); }
  100% { transform: translateX(65%); }
}
/* segel bintang di tengah sampul */
.yb-load-book-seal {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 48px; height: 48px; border-radius: 50%;
  display: grid; place-items: center;
  color: var(--yb-overlay-accent);
  background: rgba(10,9,6,0.35);
  backdrop-filter: blur(2px);
  border: 1px solid rgba(255,240,1,0.4);
  box-shadow: 0 0 22px rgba(255,240,1,0.22), 0 0 0 6px rgba(255,240,1,0.05);
}
.yb-load-book-seal svg {
  width: 24px; height: 24px;
  animation: ybSealSpin 6s linear infinite;
  filter: drop-shadow(0 0 6px rgba(255,240,1,0.5));
}
@keyframes ybSealSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
/* ── Teks ─────────────────────────────────── */
.yb-load-meta {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  text-align: center;
}
.yb-load-eyebrow {
  font-family: 'Archivo', sans-serif;
  font-size: 10px; font-weight: 700; letter-spacing: 0.42em;
  text-transform: uppercase; color: var(--yb-overlay-accent);
  opacity: 0.85;
  animation: ybEyebrowPulse 2.4s ease-in-out infinite;
}
@keyframes ybEyebrowPulse {
  0%, 100% { opacity: 0.5; }
  50%      { opacity: 0.95; }
}
.yb-load-quote {
  font-family: 'DM Serif Display', serif; font-style: italic;
  font-size: 21px; line-height: 1.2; color: rgba(255,255,255,0.82);
  max-width: 280px;
}

/* ── Progress ─────────────────────────────── */
.yb-load-progress {
  display: flex; align-items: center; gap: 16px;
}
.yb-loading-bar {
  width: 200px; height: 2px;
  background: rgba(255,255,255,0.12); border-radius: 2px;
  overflow: hidden; position: relative;
}
.yb-loading-bar span {
  display: block; height: 100%; border-radius: 2px;
  background: linear-gradient(90deg, rgba(255,240,1,0.4), var(--yb-overlay-accent));
  box-shadow: 0 0 12px var(--yb-overlay-accent);
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.yb-load-pct {
  font-family: 'Archivo', sans-serif;
  font-size: 13px; font-weight: 700; letter-spacing: 0.08em;
  color: rgba(255,255,255,0.7);
  font-variant-numeric: tabular-nums; min-width: 38px;
}
.yb-load-pct em {
  font-style: normal; font-size: 9px; color: var(--yb-overlay-accent);
  margin-left: 1px; vertical-align: super;
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

/* ── Floating Nav & Pagination ───────────── */
.yb-nav-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 56px; height: 56px; border-radius: 50%;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 50;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.35);
}
.yb-nav-arrow svg { width: 26px; height: 26px; }
.yb-nav-arrow:hover:not(:disabled) {
  background: var(--yb-overlay-accent);
  color: #000;
  border-color: var(--yb-overlay-accent);
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 8px 30px var(--yb-overlay-accent);
}
.yb-nav-arrow:disabled {
  opacity: 0.25; cursor: default;
  pointer-events: none;
}
.yb-nav-prev { left: 40px; }
.yb-nav-next { right: 40px; }

/* ── Vignette ────────────────────────────── */
.yb-overlay-vignette {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 80% 70% at 50% 45%, transparent 40%, rgba(0,0,0,0.5) 100%);
  mix-blend-mode: multiply;
}

.yb-pagination {
  position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; justify-content: center; gap: 14px;
  padding: 8px 14px; flex-shrink: 0; z-index: 50;
  width: calc(100% - 48px); max-width: 440px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 30px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.yb-page-jump {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.6);
  transition: all 0.25s ease; flex-shrink: 0;
}
.yb-page-jump svg { width: 16px; height: 16px; }
.yb-page-jump:hover:not(:disabled) { background: rgba(255,255,255,0.12); color: #fff; }
.yb-page-jump:disabled { opacity: 0.2; cursor: default; }
.yb-page-num {
  font-family: 'Archivo', sans-serif; font-size: 13px; font-weight: 700;
  color: #fff; letter-spacing: 0.1em; min-width: 22px; text-align: center;
}
.yb-page-num--total { color: rgba(255,255,255,0.45); }
.yb-page-track {
  flex: 1; height: 3px; border-radius: 3px;
  background: rgba(255,255,255,0.1);
  position: relative; overflow: hidden;
}
.yb-page-progress {
  position: absolute; top: 0; left: 0; height: 100%; border-radius: 3px;
  background: var(--yb-overlay-accent);
  box-shadow: 0 0 10px var(--yb-overlay-accent);
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

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
  /* hero */
  .yb-hero { padding: 44px 20px 32px; }
  .yb-hero-logo { width: 76px; height: 76px; margin-bottom: 16px; }
  .yb-hero-title { font-size: clamp(48px, 13vw, 80px); }
  .yb-hero-meta { gap: 8px; font-size: 10px; letter-spacing: 0.18em; }
  .yb-hero-sub { font-size: 22px; margin-bottom: 28px; }
  .yb-hero-rule span { width: 44px; }
  /* foreword */
  .yb-foreword { padding: 44px 22px 16px; }
  .yb-foreword-quote { font-size: 19px; }
  /* main */
  .yb-main { padding: 36px 20px 72px; }
  .yb-section-header { gap: 14px; margin-bottom: 32px; }
  /* viewer */
  .yb-viewer-header { padding: 14px 16px; }
  .yb-viewer-title { font-size: 20px; }
  .yb-viewer-eyebrow { font-size: 9px; letter-spacing: 0.24em; }
  .yb-viewer-count, .yb-action-divider { display: none; }
  .yb-viewer-actions { gap: 8px; }
  .yb-action-btn { width: 38px; height: 38px; }
  .yb-close-btn { width: 44px; height: 44px; }
  .yb-nav-arrow { width: 42px; height: 42px; }
  .yb-nav-arrow svg { width: 20px; height: 20px; }
  .yb-nav-prev { left: 12px; }
  .yb-nav-next { right: 12px; }
  .yb-pagination { max-width: 320px; gap: 10px; }
  /* footer */
  .yb-footer { padding: 44px 22px 52px; }
  /* video banner */
  .yb-video-banner-overlay { padding: 16px; }
}
@media (max-width: 480px) {
  .yb-nav-arrow { display: none; }
  .yb-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .yb-hero { padding: 36px 16px 28px; }
  .yb-hero-sub { font-size: 20px; }
  .yb-hero-meta { row-gap: 6px; }
  .yb-foreword-mark { font-size: 72px; }
  .yb-foreword-quote { font-size: 17px; }
  .yb-section-index { font-size: 30px; }
  .yb-section-label { font-size: 21px; }
  .yb-footer-motto { font-size: 19px; }
  .yb-footer-meta { gap: 8px; font-size: 10px; letter-spacing: 0.14em; }
  .yb-tape { display: none; }
  .yb-stamp-ring { width: 60px; height: 60px; }
  .yb-video-banner-close { top: -12px; right: -12px; width: 30px; height: 30px; }
}
@media (max-width: 360px) {
  .yb-grid { gap: 12px; }
  .yb-hero-title { font-size: 44px; }
  .yb-main { padding: 32px 14px 64px; }
}

/* ════════════════════════════════════════
   SPLASH SCREEN
   ════════════════════════════════════════ */
.yb-splash {
  position: fixed; inset: 0; z-index: 9999;
  background: #0d0a06;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.7, 0, 0.3, 1), filter 0.7s ease;
}
.yb-splash--exit {
  opacity: 0; transform: scale(1.06); filter: blur(8px);
  pointer-events: none;
}

/* ── Cover mosaic bg — slow drift ── */
.yb-splash-mosaic {
  position: absolute; inset: -2%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 4px;
  filter: saturate(0.7) brightness(0.75);
  animation: mosaicDrift 32s ease-in-out infinite alternate;
}
.yb-splash-mosaic-item {
  position: relative; overflow: hidden; background: #111;
  opacity: 0;
  animation: mosaicIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: calc(var(--i) * 0.045s);
}
.yb-splash-mosaic-item::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(200,150,70,0.12), transparent 60%);
  mix-blend-mode: overlay;
}
@keyframes mosaicIn {
  from { opacity: 0; transform: scale(1.12); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes mosaicDrift {
  from { transform: scale(1.04) translate(-1%, -1%); }
  to   { transform: scale(1.1) translate(1%, 1%); }
}


.yb-splash-overlay {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background:
    linear-gradient(to bottom, rgba(13,10,6,0.7) 0%, rgba(13,10,6,0.2) 32%, rgba(13,10,6,0.35) 62%, rgba(13,10,6,0.9) 100%),
    radial-gradient(ellipse 70% 65% at 50% 48%, rgba(13,10,6,0) 0%, rgba(13,10,6,0.45) 60%, rgba(13,10,6,0.92) 100%);
}

/* grain */
.yb-splash-grain {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  opacity: 0.5; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
}

/* thin gold frame inset */
.yb-splash-frame {
  position: absolute; inset: 18px; z-index: 2; pointer-events: none;
  border: 1px solid rgba(200,169,110,0.22);
  opacity: 0; animation: splashRise 1s ease 0.85s forwards;
}
.yb-splash-frame::before, .yb-splash-frame::after {
  content: ''; position: absolute; width: 14px; height: 14px;
  border: 1px solid rgba(200,169,110,0.55);
}
.yb-splash-frame::before { top: -1px; left: -1px; border-right: none; border-bottom: none; }
.yb-splash-frame::after  { bottom: -1px; right: -1px; border-left: none; border-top: none; }

.yb-splash-inner {
  position: relative; z-index: 3;
  display: flex; flex-direction: column; align-items: center;
  gap: 0; text-align: center; padding: 40px 24px;
}
.yb-splash-inner > * {
  opacity: 0;
  animation: splashRise 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--d, 0s);
}
@keyframes splashRise {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}

.yb-splash-logo {
  width: 120px; height: 120px; object-fit: contain;
  margin-bottom: 22px;
  filter: drop-shadow(0 4px 20px rgba(0,0,0,0.7));
}
.yb-splash-eyebrow {
  display: flex; align-items: center; justify-content: center; gap: 14px;
  font-family: var(--yb-page-font);
  font-size: 11px; letter-spacing: 0.34em; text-transform: uppercase;
  color: rgba(244,238,225,0.65); margin-bottom: 14px;
  text-shadow: 0 1px 8px rgba(0,0,0,0.9);
}
.yb-splash-eyebrow-rule {
  width: 36px; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200,169,110,0.7), transparent);
}
.yb-splash-title {
  font-family: var(--yb-title-font);
  font-size: clamp(58px, 13vw, 104px);
  color: #f4eee1; line-height: 0.92; margin-bottom: 14px;
  letter-spacing: -0.01em;
  text-shadow: 0 6px 40px rgba(0,0,0,0.8);
}
.yb-splash-title em {
  font-style: italic;
  background: linear-gradient(110deg, #9a7434 0%, #e8c987 28%, #fff3d4 45%, #d4af6a 60%, #8a6526 100%);
  background-size: 220% auto;
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: splashFoil 5s linear infinite;
}
@keyframes splashFoil {
  to { background-position: 220% center; }
}
.yb-splash-sub {
  font-family: var(--yb-page-font);
  font-size: 14px; font-style: italic;
  color: rgba(244,238,225,0.6); margin-bottom: 42px;
  letter-spacing: 0.04em;
  text-shadow: 0 1px 8px rgba(0,0,0,0.9);
}
.yb-splash-btn {
  display: inline-flex; align-items: center; gap: 12px;
  padding: 15px 44px;
  border: 1px solid rgba(200,169,110,0.55);
  border-radius: 2px;
  background: rgba(13,10,6,0.35);
  color: #e8c987;
  font-family: var(--yb-page-font);
  font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase;
  cursor: pointer;
  transition: background 0.4s ease, color 0.4s ease, border-color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease;
  backdrop-filter: blur(6px);
  position: relative; overflow: hidden;
}
.yb-splash-btn::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(120deg, transparent 30%, rgba(255,243,212,0.4) 50%, transparent 70%);
  transform: translateX(-120%);
  animation: splashSheen 4.5s ease-in-out 1.6s infinite;
}
@keyframes splashSheen {
  0%, 55% { transform: translateX(-120%); }
  75%, 100% { transform: translateX(120%); }
}
.yb-splash-btn-arrow { transition: transform 0.4s cubic-bezier(0.16,1,0.3,1); }
.yb-splash-btn:hover {
  background: linear-gradient(135deg, #e8c987, #c8a96e);
  color: #1a1207;
  border-color: #e8c987;
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(200,169,110,0.35);
}
.yb-splash-btn:hover .yb-splash-btn-arrow { transform: translateX(5px); }

@media (max-width: 600px) {
  .yb-splash-mosaic { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(5, 1fr); grid-auto-rows: 0; overflow: hidden; }
  .yb-splash-frame { inset: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .yb-splash-mosaic, .yb-splash-title em, .yb-splash-btn::before { animation: none; }
}
`;
