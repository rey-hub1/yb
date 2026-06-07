import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase, POST_MESSAGE_URL, SUPABASE_ANON_KEY } from "../lib/supabase";

const MAX_LEN = 80;
const MAX_NAME = 18;
const TONES = 6; // jumlah varian warna kertas (yb-note--t0..t5)
// warna swatch — harus sinkron sama .yb-note--t0..t5 di STYLES
const NOTE_COLORS = [
    "#fef3c0",
    "#fcded0",
    "#d7eed9",
    "#fbd6e2",
    "#d6e6f4",
    "#ece2f7",
];
const COLOR_NAMES = ["Kuning", "Peach", "Mint", "Pink", "Biru", "Lavender"];

// tema latar story per tone — gradient gelap + warna aksen glow (sinkron NOTE_COLORS, +t6 emas)
const STORY_THEME = [
    { from: "#4a3713", to: "#0c0904", accent: "#f4c850" }, // kuning
    { from: "#4a2218", to: "#0c0605", accent: "#f5a583" }, // peach
    { from: "#143a24", to: "#050d08", accent: "#82dd9d" }, // mint
    { from: "#441a2b", to: "#0c0508", accent: "#f593bc" }, // pink
    { from: "#143049", to: "#04080e", accent: "#83bdf6" }, // biru
    { from: "#2c1844", to: "#08050e", accent: "#bb95f5" }, // lavender
    { from: "#4a3a10", to: "#0c0803", accent: "#f0cd6a" }, // t6 emas
];
const STORY_MS = 7000; // durasi auto-advance per note

// skin/tema story yang bisa dipilih user — berlaku untuk semua note (persist localStorage).
// perTone=true → latar pakai gradient warna note. perTone=false → latar dari CSS .yb-story-bg--<key>
const STORY_SKINS = [
    { key: "paper", name: "Kertas", perTone: true },
    { key: "aurora", name: "Aurora", perTone: false },
    { key: "noir", name: "Noir", perTone: false },
    { key: "senja", name: "Senja", perTone: false },
];
const SKIN_STORAGE = "yb-story-skin";

// waktu relatif sederhana (Bahasa Indonesia)
function timeAgo(iso) {
    const d = new Date(iso);
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return "baru";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}mnt`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}jam`;
    const hari = Math.floor(h / 24);
    if (hari < 30) return `${hari}hr`;
    return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

// hash stabil dari id → varian warna/rotasi/selotip (konsisten antar render)
function noteVariant(id = "") {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return {
        tone: h % TONES,
        rot: ((h >> 3) % 7) - 3, // -3..3 deg
        tapeRot: ((h >> 6) % 13) - 6, // -6..6 deg
    };
}

// ── STORY VIEWER ────────────────────────────────────────────────────────────
// Putar note jadi cerita layar penuh: progress bar, auto-advance, tap kiri/kanan,
// swipe, panah keyboard, tahan untuk jeda, tombol bagikan. Mirip story IG.
function StoryViewer({ list, startIndex, onClose }) {
    const [index, setIndex] = useState(startIndex);
    const [progress, setProgress] = useState(0);
    const [paused, setPaused] = useState(false);
    const [copied, setCopied] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [skinKey, setSkinKey] = useState(
        () => localStorage.getItem(SKIN_STORAGE) || "paper",
    );
    const progRef = useRef(0);
    const touchRef = useRef(null);
    const downRef = useRef(0);
    const posterRef = useRef(null);

    const m = list[index];
    const isPinned = (m.body ?? "").startsWith("/pin ");
    const displayBody = isPinned ? m.body.slice(5) : m.body;
    const v = noteVariant(m.id);
    const t = m.color != null ? m.color : v.tone;
    const theme = STORY_THEME[t] || STORY_THEME[0];
    const skin = STORY_SKINS.find((s) => s.key === skinKey) || STORY_SKINS[0];
    const skinBg = skin.perTone
        ? { background: `linear-gradient(165deg, ${theme.from}, ${theme.to})` }
        : undefined;

    useEffect(() => { localStorage.setItem(SKIN_STORAGE, skinKey); }, [skinKey]);

    const goNext = useCallback(() => {
        setIndex((i) => { if (i < list.length - 1) return i + 1; onClose(); return i; });
    }, [list.length, onClose]);
    const goPrev = useCallback(() => setIndex((i) => (i > 0 ? i - 1 : i)), []);

    // reset progress tiap pindah note
    useEffect(() => { progRef.current = 0; setProgress(0); }, [index]);

    // loop progress + auto-advance (rAF, dihentikan saat paused)
    useEffect(() => {
        let raf, last = performance.now();
        const tick = (now) => {
            const dt = now - last; last = now;
            if (!paused) {
                progRef.current += dt / STORY_MS;
                if (progRef.current >= 1) { setProgress(1); goNext(); return; }
                setProgress(progRef.current);
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [index, paused, goNext]);

    // keyboard + kunci scroll body
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
            else if (e.key === "ArrowRight") goNext();
            else if (e.key === "ArrowLeft") goPrev();
        };
        window.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
    }, [onClose, goNext, goPrev]);

    // tap vs tahan: <250ms = navigasi, lebih lama = jeda saja
    const zoneDown = () => { downRef.current = Date.now(); setPaused(true); };
    const zoneUp = (dir) => () => {
        setPaused(false);
        if (Date.now() - downRef.current < 250) (dir === "next" ? goNext : goPrev)();
    };

    const onTouchStart = (e) => {
        touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = (e) => {
        if (!touchRef.current) return;
        const dx = e.changedTouches[0].clientX - touchRef.current.x;
        const dy = e.changedTouches[0].clientY - touchRef.current.y;
        touchRef.current = null;
        if (Math.abs(dy) > 90 && Math.abs(dy) > Math.abs(dx)) { onClose(); return; } // swipe bawah = tutup
        if (Math.abs(dx) > 50) (dx < 0 ? goNext : goPrev)();
    };

    // share sebagai GAMBAR (poster offscreen → html2canvas). Web Share file
    // di mobile, fallback download di desktop. Hint/UI tidak ikut terambil.
    const share = async () => {
        if (sharing || !posterRef.current) return;
        setSharing(true);
        setPaused(true); // bekukan auto-advance saat ambil gambar
        try {
            await (document.fonts?.ready ?? Promise.resolve());
            const { default: html2canvas } = await import("html2canvas");
            const canvas = await html2canvas(posterRef.current, {
                scale: 2, backgroundColor: null, useCORS: true, logging: false,
            });
            const blob = await new Promise((res) => canvas.toBlob(res, "image/png", 0.95));
            if (!blob) throw new Error("no blob");
            const file = new File([blob], `kenangan-${m.id}.png`, { type: "image/png" });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: "Sticky Memory" });
            } else {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = file.name; a.click();
                URL.revokeObjectURL(url);
                setCopied(true); setTimeout(() => setCopied(false), 1800);
            }
        } catch { /* dibatalkan/diblokir — abaikan */ }
        setSharing(false);
        setPaused(false);
    };

    return createPortal(
        <div
            className={`yb-story-overlay yb-story-bg--${skin.key}`}
            style={skinBg}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            <div className="yb-story-glow" aria-hidden="true" style={{ background: `radial-gradient(circle, ${theme.accent}55, transparent 70%)` }} />

            {/* progress bars */}
            <div className="yb-story-bars">
                {list.map((_, i) => (
                    <div key={i} className="yb-story-bar">
                        <span className="yb-story-bar-fill" style={{ width: i < index ? "100%" : i === index ? `${progress * 100}%` : "0%" }} />
                    </div>
                ))}
            </div>

            {/* header */}
            <div className="yb-story-top">
                <span className="yb-story-counter">{index + 1} / {list.length}</span>
                <button className="yb-story-close" onClick={onClose} aria-label="Tutup">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {/* zona tap kiri / kanan */}
            <button className="yb-story-zone yb-story-zone--prev" aria-label="Sebelumnya" onPointerDown={zoneDown} onPointerUp={zoneUp("prev")} onPointerLeave={() => setPaused(false)} />
            <button className="yb-story-zone yb-story-zone--next" aria-label="Berikutnya" onPointerDown={zoneDown} onPointerUp={zoneUp("next")} onPointerLeave={() => setPaused(false)} />

            {/* panah navigasi terlihat */}
            <button className="yb-story-arrow yb-story-arrow--prev" onClick={goPrev} disabled={index === 0} aria-label="Note sebelumnya">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button className="yb-story-arrow yb-story-arrow--next" onClick={goNext} disabled={index === list.length - 1} aria-label="Note berikutnya">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>

            {/* kartu */}
            <div className="yb-story-stage">
                <article key={m.id} className={`yb-story-card yb-story-card--t${t}`}>
                    {isPinned && <span className="yb-story-pinned">disematkan</span>}
                    <span className="yb-story-quote" aria-hidden="true" style={{ color: theme.accent }}>“</span>
                    <p className="yb-story-text">{displayBody}</p>
                    <div className="yb-story-sign">
                        <span className="yb-story-author">{m.name?.trim() || "Anonim"}</span>
                        <span className="yb-story-time">{timeAgo(m.created_at)}</span>
                    </div>
                </article>

                <button className="yb-story-share" onClick={share} disabled={sharing}>
                    {sharing ? (
                        <><svg className="yb-story-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.22-8.56" /></svg>menyiapkan…</>
                    ) : copied ? (
                        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Tersimpan</>
                    ) : (
                        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /><polyline points="8 8 12 4 16 8" /><line x1="12" y1="4" x2="12" y2="16" /></svg>Bagikan gambar</>
                    )}
                </button>
            </div>

            {/* pemilih tema */}
            <div className="yb-story-skins">
                {STORY_SKINS.map((s) => (
                    <button
                        key={s.key}
                        type="button"
                        className={`yb-story-skin-btn yb-story-bg--${s.key}${s.key === skin.key ? " is-active" : ""}`}
                        style={s.perTone ? skinBg : undefined}
                        onClick={() => setSkinKey(s.key)}
                        title={s.name}
                    >
                        <span>{s.name}</span>
                    </button>
                ))}
            </div>

            {/* poster offscreen untuk di-capture jadi gambar share */}
            <div
                ref={posterRef}
                className={`yb-story-poster yb-story-bg--${skin.key}`}
                style={skinBg}
                aria-hidden="true"
            >
                <div className="yb-story-poster-inner">
                    <article className={`yb-story-card yb-story-card--t${t}`}>
                        {isPinned && <span className="yb-story-pinned">disematkan</span>}
                        <span className="yb-story-quote" style={{ color: theme.accent }}>“</span>
                        <p className="yb-story-text">{displayBody}</p>
                        <div className="yb-story-sign">
                            <span className="yb-story-author">{m.name?.trim() || "Anonim"}</span>
                            <span className="yb-story-time">{timeAgo(m.created_at)}</span>
                        </div>
                    </article>
                    <div className="yb-story-poster-mark">
                        <span className="yb-story-poster-title">Yearbook 2026 · Sticky Memory</span>
                        <span className="yb-story-poster-url">yb-mahawaluya-pangestu.vercel.app</span>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}

export default function MessageWall() {
    const [messages, setMessages] = useState([]);
    const [name, setName] = useState("");
    const [body, setBody] = useState("");
    const [tone, setTone] = useState(() => Math.floor(Math.random() * TONES));
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sending, setSending] = useState(false);
    const [justSent, setJustSent] = useState(false);
    const [highlightId, setHighlightId] = useState(null);
    const [error, setError] = useState("");
    const [expanded, setExpanded] = useState(false);
    const [story, setStory] = useState(null); // { list, index }
    const seenIds = useRef(new Set());

    // tambah satu note (realtime/optimistik) — dedup by id, tempel di atas
    const prependOne = useCallback((row) => {
        if (!row?.id) return;
        setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            seenIds.current.add(row.id);
            return [row, ...prev];
        });
    }, []);

    // ambil pesan terbaru dari server (load awal + refresh manual).
    // REPLACE total dari DB → selalu otoritatif, refresh button pasti sinkron.
    const fetchMessages = useCallback(async () => {
        if (!supabase) return false;
        const { data, error: err } = await supabase
            .from("messages")
            .select("id, name, body, color, created_at")
            .order("created_at", { ascending: false })
            .limit(100);
        if (err) {
            console.log("[fetchMessages] ERROR:", err);
            setError("Gagal memuat pesan.");
            return false;
        }
        setError("");
        const rows = data || [];
        console.log("[fetchMessages] rows dari DB:", rows.length);
        seenIds.current = new Set(rows.map((r) => r.id));
        setMessages(rows);
        return true;
    }, []);

    // konfirmasi note benar-benar tersimpan & bisa dibaca dari DB
    // (read-after-write — antisipasi replica DB telat sedikit).
    // Polling by id sampai ketemu atau timeout, biar loading selesai
    // hanya saat note sudah pasti masuk Supabase.
    const confirmInDb = useCallback(async (id, tries = 10, delayMs = 400) => {
        if (!supabase) return false;
        for (let i = 0; i < tries; i++) {
            const { data } = await supabase
                .from("messages")
                .select("id")
                .eq("id", id)
                .maybeSingle();
            if (data) return true;
            await new Promise((r) => setTimeout(r, delayMs));
        }
        return false;
    }, []);

    // load awal
    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }
        let alive = true;
        (async () => {
            await fetchMessages();
            if (alive) setLoading(false);
        })();
        return () => {
            alive = false;
        };
    }, [fetchMessages]);

    const handleRefresh = async () => {
        if (refreshing) return;
        setRefreshing(true);
        await fetchMessages();
        setRefreshing(false);
    };

    // realtime: pesan baru dari orang lain langsung muncul.
    // Fallback polling tiap 6 detik kalau realtime gagal/belum aktif —
    // note tetap nongol tanpa refresh manual.
    useEffect(() => {
        if (!supabase) return;
        let realtimeOk = false;
        const ch = supabase
            .channel("messages-insert")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "messages" },
                (payload) => prependOne(payload.new),
            )
            .subscribe((status) => {
                // SUBSCRIBED = realtime hidup. CHANNEL_ERROR/TIMED_OUT = gagal.
                console.log("[realtime messages]", status);
                realtimeOk = status === "SUBSCRIBED";
            });

        // polling cadangan — cuma jalan saat tab terlihat & realtime belum OK
        const poll = setInterval(() => {
            if (document.visibilityState === "visible" && !realtimeOk) {
                fetchMessages();
            }
        }, 6000);

        return () => {
            clearInterval(poll);
            supabase.removeChannel(ch);
        };
    }, [prependOne, fetchMessages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const text = body.trim();
        if (!text) return;
        if (text.length > MAX_LEN) {
            setError(`Maksimal ${MAX_LEN} karakter.`);
            return;
        }

        if (!POST_MESSAGE_URL) {
            setError("Fitur belum dikonfigurasi (env Supabase kosong).");
            return;
        }

        setSending(true);
        setJustSent(false);
        let data, status;
        try {
            const res = await fetch(POST_MESSAGE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({ name: name.trim() || null, body: text, color: tone }),
            });
            status = res.status;
            data = await res.json();
        } catch {
            setSending(false);
            setError("Gagal menempel. Periksa koneksi.");
            return;
        }

        if (status === 429) {
            setSending(false);
            setError(data?.error ?? "Tunggu 30 detik sebelum nempel lagi.");
            return;
        }
        if (status !== 200) {
            setSending(false);
            setError(data?.error ?? "Gagal menempel. Coba lagi.");
            return;
        }

        // status 200 = edge function sudah INSERT + return row.
        // Tunggu read-after-write: poll DB sampai note benar-benar terbaca,
        // baru loading selesai — biar user yakin note sudah masuk Supabase.
        // Tombol tetap "menempel…" selama proses ini.
        console.log("[submit] POST 200, data:", data);
        if (data?.id) {
            const ok = await confirmInDb(data.id);
            console.log("[submit] confirmInDb:", ok);
        }
        // tampilkan optimistik (kalau confirm timeout) lalu replace dgn DB-truth
        if (data) prependOne(data);
        const fetched = await fetchMessages();
        console.log("[submit] fetchMessages ok:", fetched);
        setMessages((cur) => { console.log("[submit] messages count now:", cur.length, "ids include posted?", cur.some((m) => m.id === data?.id)); return cur; });

        setSending(false);
        setBody("");
        setTone(Math.floor(Math.random() * TONES));

        // konfirmasi sukses + sorot note baru biar user langsung lihat
        if (data?.id) {
            setHighlightId(data.id);
            setTimeout(() => setHighlightId((cur) => (cur === data.id ? null : cur)), 2600);
        }
        setJustSent(true);
        setTimeout(() => setJustSent(false), 2600);
    };

    return (
        <section id="kenangan" className="yb-kenangan">
            <div className="yb-kenangan-head">
                <span className="yb-section-index" style={{ display: 'block', opacity: 0.8, marginBottom: 12 }}>2</span>
                <span className="yb-kenangan-kicker">tempel kenanganmu</span>
                <h2 className="yb-kenangan-title">Sticky Memory</h2>
                <p className="yb-kenangan-sub">
                    Tulis di kertas, tempel di papan. Pesan, harapan, atau salam
                    perpisahan — boleh anonim.
                </p>
                <button
                    type="button"
                    className={`yb-refresh-btn${refreshing ? " is-spinning" : ""}`}
                    onClick={handleRefresh}
                    disabled={refreshing}
                    aria-label="Ambil pesan terbaru"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                        <path d="M21 3v6h-6" />
                    </svg>
                    {refreshing ? "memuat…" : "Refresh"}
                </button>
            </div>

            {/* notepad bergaris tempat nulis */}
            <form className="yb-notepad" onSubmit={handleSubmit}>
                <div className="yb-notepad-rings" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                </div>
                <div className="yb-notepad-sheet">
                    <textarea
                        className="yb-notepad-text"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Tulis pesanmu di sini…"
                        rows={3}
                        maxLength={MAX_LEN}
                    />
                    <div className="yb-notepad-sign">
                        <span className="yb-notepad-dash">—</span>
                        <input
                            className="yb-notepad-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="namamu (atau biar anonim)"
                            maxLength={MAX_NAME}
                        />
                    </div>
                    <div
                        className="yb-notepad-colors"
                        role="radiogroup"
                        aria-label="Warna kertas"
                    >
                        <span className="yb-notepad-colors-label">Warna:</span>
                        {NOTE_COLORS.map((c, i) => (
                            <button
                                type="button"
                                key={i}
                                className={`yb-swatch${tone === i ? " is-active" : ""}`}
                                style={{ background: c }}
                                onClick={() => setTone(i)}
                                role="radio"
                                aria-checked={tone === i}
                                aria-label={COLOR_NAMES[i]}
                                title={COLOR_NAMES[i]}
                            />
                        ))}
                    </div>
                    <div className="yb-notepad-foot">
                        <span className="yb-notepad-count">
                            {body.length}/{MAX_LEN}
                        </span>
                        <button
                            className={`yb-notepad-btn${justSent ? " is-done" : ""}`}
                            type="submit"
                            disabled={sending || !body.trim()}
                        >
                            {sending ? (
                                "menempel…"
                            ) : justSent ? (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Tertempel
                                </>
                            ) : (
                                <>
                                    Tempel
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                    {error && <p className="yb-notepad-error">{error}</p>}
                    {justSent && !error && (
                        <p className="yb-notepad-ok">
                            Tersimpan di papan. Lihat di bawah
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: "-2px", marginLeft: 4 }}>
                                <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
                            </svg>
                        </p>
                    )}
                </div>
            </form>

            {/* peringatan penyalahgunaan */}
            <div className="yb-kenangan-warn" role="note">
                <span className="yb-kenangan-warn-ic" aria-hidden="true">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </span>
                <p>
                    <b>Publik & anonim.</b> Dilarang catat nama orang lain atau tulis hal menyinggung/SARA. Pesan melanggar bisa dihapus. ~rey
                </p>
            </div>

            {/* cari notesmu */}
            {!loading &&
                messages.length > 0 &&
                (() => {
                    const q = query.trim().toLowerCase();
                    const shown = q
                        ? messages.filter(
                              (m) =>
                                  (m.body || "").toLowerCase().includes(q) ||
                                  (m.name || "").toLowerCase().includes(q),
                          )
                        : messages;
                    // collapse papan default — buka semua via tombol.
                    // gak collapse saat lagi nyari (q aktif) atau note sedikit.
                    const collapsible = !q && shown.length > 6;
                    const collapsed = collapsible && !expanded;
                    return (
                        <>
                            <div className="yb-board-search">
                                <svg
                                    className="yb-board-search-ic"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m21 21-4.3-4.3" />
                                </svg>
                                <input
                                    className="yb-board-search-input"
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Cari namamu di pesan atau pembuatnya…"
                                />
                                {query && (
                                    <button
                                        type="button"
                                        className="yb-board-search-clear"
                                        onClick={() => setQuery("")}
                                        aria-label="Hapus pencarian"
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            {q && (
                                <p className="yb-board-result">
                                    {shown.length > 0
                                        ? `${shown.length} note cocok "${query.trim()}"`
                                        : `Gak ada note yang nyebut "${query.trim()}"`}
                                </p>
                            )}
                            <div className={`yb-board-wrap${collapsed ? " is-collapsed" : ""}`}>
                            <div className="yb-board">
                                {(() => {
                                  const sorted = [...shown].sort((a, b) => {
                                        const ap = (a.body ?? "").startsWith("/pin ") ? 1 : 0;
                                        const bp = (b.body ?? "").startsWith("/pin ") ? 1 : 0;
                                        return bp - ap;
                                  });
                                  return sorted.map((m, i) => {
                                    const isPinned = (m.body ?? "").startsWith("/pin ");
                                    const displayBody = isPinned ? m.body.slice(5) : m.body;
                                    const v = noteVariant(m.id);
                                    const t = m.color != null ? m.color : v.tone;
                                    return (
                                        <article
                                            key={m.id}
                                            onClick={() => setStory({ list: sorted, index: i })}
                                            className={`yb-note yb-note--t${t}${isPinned ? " yb-note--pinned" : ""}${m.id === highlightId ? " yb-note--new" : ""} clickable-note`}
                                            style={{
                                                "--rot": isPinned ? `${v.rot * 0.35}deg` : `${v.rot}deg`,
                                                "--tape-rot": `${v.tapeRot}deg`,
                                                cursor: "pointer",
                                            }}
                                        >
                                            {isPinned ? (
                                                <span className="yb-note-pin" aria-hidden="true" />
                                            ) : (
                                                <span className="yb-note-tape" aria-hidden="true" />
                                            )}
                                            <p className="yb-note-body">
                                                {displayBody}
                                            </p>
                                            <div className="yb-note-meta">
                                                <span className="yb-note-from">
                                                    {m.name?.trim() || "Anonim"}
                                                </span>
                                                <span className="yb-note-time">
                                                    {timeAgo(m.created_at)}
                                                </span>
                                            </div>
                                        </article>
                                    );
                                  });
                                })()}
                            </div>
                                {collapsed && (
                                    <div className="yb-board-fade" aria-hidden="true" />
                                )}
                            </div>
                            {collapsible && (
                                <div className="yb-board-toggle-wrap">
                                    <button
                                        type="button"
                                        className="yb-board-toggle"
                                        onClick={() => setExpanded((v) => !v)}
                                    >
                                        {expanded
                                            ? "Tutup"
                                            : `Lihat semua (${shown.length})`}
                                        <svg
                                            className={`yb-board-toggle-ic${expanded ? " is-open" : ""}`}
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </>
                    );
                })()}

            {/* state loading / papan kosong */}
            {(loading || messages.length === 0) && (
                <div className="yb-board">
                    {loading ? (
                        <p className="yb-board-empty">Memuat papan…</p>
                    ) : (
                        <p className="yb-board-empty">
                            Papan masih kosong. Jadi note pertama
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: "-2px", marginLeft: 5 }}>
                                <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
                            </svg>
                        </p>
                    )}
                </div>
            )}

            {/* Story Viewer */}
            {story && (
                <StoryViewer
                    list={story.list}
                    startIndex={story.index}
                    onClose={() => setStory(null)}
                />
            )}
        </section>
    );
}
