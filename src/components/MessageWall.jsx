import React, { useState, useEffect, useCallback, useRef } from "react";
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

// waktu relatif sederhana (Bahasa Indonesia)
function timeAgo(iso) {
    const d = new Date(iso);
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return "baru saja";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} menit lalu`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} jam lalu`;
    const hari = Math.floor(h / 24);
    if (hari < 30) return `${hari} hari lalu`;
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
                            <div className="yb-board">
                                {[...shown]
                                    .sort((a, b) => {
                                        const ap = (a.body ?? "").startsWith("/pin ") ? 1 : 0;
                                        const bp = (b.body ?? "").startsWith("/pin ") ? 1 : 0;
                                        return bp - ap;
                                    })
                                    .map((m) => {
                                    const isPinned = (m.body ?? "").startsWith("/pin ");
                                    const displayBody = isPinned ? m.body.slice(5) : m.body;
                                    const v = noteVariant(m.id);
                                    const t = m.color != null ? m.color : v.tone;
                                    return (
                                        <article
                                            key={m.id}
                                            className={`yb-note yb-note--t${t}${isPinned ? " yb-note--pinned" : ""}${m.id === highlightId ? " yb-note--new" : ""}`}
                                            style={{
                                                "--rot": isPinned ? `${v.rot * 0.35}deg` : `${v.rot}deg`,
                                                "--tape-rot": `${v.tapeRot}deg`,
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
                                })}
                            </div>
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
        </section>
    );
}
