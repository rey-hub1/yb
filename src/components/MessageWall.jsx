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
    const [error, setError] = useState("");
    const seenIds = useRef(new Set());

    const addMessages = useCallback((rows, prepend = false) => {
        setMessages((prev) => {
            const fresh = rows.filter((r) => !seenIds.current.has(r.id));
            fresh.forEach((r) => seenIds.current.add(r.id));
            if (fresh.length === 0) return prev;
            return prepend ? [...fresh, ...prev] : [...prev, ...fresh];
        });
    }, []);

    // ambil pesan terbaru dari server (dipakai load awal + refresh manual)
    const fetchMessages = useCallback(async () => {
        if (!supabase) return false;
        const { data, error: err } = await supabase
            .from("messages")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(100);
        if (err) {
            setError("Gagal memuat pesan.");
            return false;
        }
        setError("");
        // pesan baru (belum pernah dilihat) ditempel di paling atas
        addMessages(data || [], true);
        return true;
    }, [addMessages]);

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

    // realtime: pesan baru dari orang lain langsung muncul
    useEffect(() => {
        if (!supabase) return;
        const ch = supabase
            .channel("messages-insert")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "messages" },
                (payload) => addMessages([payload.new], true),
            )
            .subscribe();
        return () => {
            supabase.removeChannel(ch);
        };
    }, [addMessages]);

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
        setSending(false);

        if (status === 429) {
            setError(data?.error ?? "Tunggu 30 detik sebelum nempel lagi.");
            return;
        }
        if (status !== 200) {
            setError(data?.error ?? "Gagal menempel. Coba lagi.");
            return;
        }

        if (data) addMessages([data], true);
        setBody("");
        setTone(Math.floor(Math.random() * TONES));
    };

    return (
        <section id="kenangan" className="yb-kenangan">
            <div className="yb-kenangan-head">
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
                            className="yb-notepad-btn"
                            type="submit"
                            disabled={sending || !body.trim()}
                        >
                            {sending ? "menempel…" : "Tempel ✎"}
                        </button>
                    </div>
                    {error && <p className="yb-notepad-error">{error}</p>}
                </div>
            </form>

            {/* peringatan penyalahgunaan */}
            <div className="yb-kenangan-warn" role="note">
                <span className="yb-kenangan-warn-ic" aria-hidden="true">
                    ⚠
                </span>
                <p>
                    Pesan tampil <b>publik</b> dan bisa <b>anonim</b>. Jangan
                    mengatasnamakan atau memakai nama orang lain, dan jangan
                    menulis hal yang menyinggung/SARA. Pesan yang menyalahi
                    aturan bisa dihapus admin. ~rey
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
                                        ✕
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
                                    .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
                                    .map((m) => {
                                    const v = noteVariant(m.id);
                                    const t =
                                        m.color != null ? m.color : v.tone;
                                    return (
                                        <article
                                            key={m.id}
                                            className={`yb-note yb-note--t${t}${m.is_pinned ? " yb-note--pinned" : ""}`}
                                            style={{
                                                "--rot": `${v.rot}deg`,
                                                "--tape-rot": `${v.tapeRot}deg`,
                                            }}
                                        >
                                            {m.is_pinned && (
                                                <span className="yb-note-pin" aria-label="Ditempel">📌</span>
                                            )}
                                            <span
                                                className="yb-note-tape"
                                                aria-hidden="true"
                                            />
                                            <p className="yb-note-body">
                                                {m.body}
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
                            Papan masih kosong. Jadi note pertama ✦
                        </p>
                    )}
                </div>
            )}
        </section>
    );
}
