import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase, DELETE_MESSAGE_URL, POST_MESSAGE_URL, SUPABASE_ANON_KEY } from "../lib/supabase";

const TOKEN_KEY = "yb-admin-token";
const MAX_LEN = 80;
const NOTE_COLORS = ["#fef3c0","#fcded0","#d7eed9","#fbd6e2","#d6e6f4","#ece2f7"];

async function callAdmin(token, payload) {
    if (!DELETE_MESSAGE_URL) return { ok: false, status: 0, data: {} };
    try {
        const res = await fetch(DELETE_MESSAGE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-admin-token": token },
            body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        return { ok: res.status === 200, status: res.status, data };
    } catch {
        return { ok: false, status: 0, data: { error: "Gagal terhubung ke server." } };
    }
}

function fmt(iso) {
    return new Date(iso).toLocaleString("id-ID", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

// ── FONTS ──────────────────────────────────────────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
* { box-sizing: border-box; }
::selection { background: #c8a44a33; color: #e8e2d2; }
::-webkit-scrollbar { width: 6px; background: #07070a; }
::-webkit-scrollbar-thumb { background: #1e1e2a; border-radius: 3px; }
@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes pulse { 0%,100% { opacity:.4; } 50% { opacity:.9; } }
.yn-row { animation: fadeUp .28s ease both; }
.yn-row:nth-child(1) { animation-delay:.03s }
.yn-row:nth-child(2) { animation-delay:.06s }
.yn-row:nth-child(3) { animation-delay:.09s }
.yn-row:nth-child(4) { animation-delay:.12s }
.yn-row:nth-child(5) { animation-delay:.15s }
.yn-row:nth-child(6) { animation-delay:.18s }
.yn-row:nth-child(7) { animation-delay:.21s }
.yn-row:nth-child(8) { animation-delay:.24s }
.yn-row:nth-child(n+9) { animation-delay:.27s }
.yn-btn:hover { opacity: .8; }
.yn-btn:active { transform: scale(.97); }
.yn-gate-card { animation: fadeUp .4s ease both; }
`;

// ── GATE (LOGIN) ───────────────────────────────────────────────────────────
function Gate({ onAuth }) {
    const [val, setVal] = useState("");
    const [err, setErr] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        const t = val.trim();
        if (!t) return;
        setBusy(true); setErr("");
        const { ok, status } = await callAdmin(t, { verify: true });
        setBusy(false);
        if (!ok) {
            setErr(status === 0 ? "Tidak dapat terhubung ke server." : "Token tidak valid.");
            return;
        }
        sessionStorage.setItem(TOKEN_KEY, t);
        onAuth(t);
    };

    return (
        <div style={G.bg}>
            <style>{FONTS}</style>
            <div className="yn-gate-card" style={G.card}>
                {/* ornamen */}
                <div style={G.topBar} />
                <div style={G.lockWrap}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c8a44a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>
                <p style={G.kicker}>RESTRICTED ACCESS</p>
                <h1 style={G.title}>Admin Panel</h1>
                <p style={G.sub}>Sticky Memory · Yearbook 2025</p>
                <form onSubmit={submit} style={G.form}>
                    <label style={G.label}>Admin Token</label>
                    <input
                        style={{ ...G.input, borderColor: err ? "#d95f5f" : "#1e1e2a" }}
                        type="password"
                        value={val}
                        onChange={e => setVal(e.target.value)}
                        placeholder="enter token…"
                        autoFocus
                        autoComplete="off"
                    />
                    {err && <p style={G.err}>{err}</p>}
                    <button
                        className="yn-btn"
                        style={{ ...G.submit, opacity: busy ? .6 : 1 }}
                        type="submit"
                        disabled={busy}
                    >
                        {busy ? (
                            <span style={{ animation: "pulse 1s infinite" }}>memverifikasi…</span>
                        ) : "Masuk →"}
                    </button>
                </form>
                <div style={G.rule} />
                <button className="yn-btn" style={G.back} onClick={() => { window.location.hash = ""; }}>
                    ← kembali ke situs
                </button>
            </div>
        </div>
    );
}

const G = {
    bg: {
        minHeight: "100vh",
        background: "#07070a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "'JetBrains Mono', monospace",
    },
    card: {
        width: "100%",
        maxWidth: 380,
        background: "#111118",
        border: "1px solid #2a2a38",
        borderRadius: 4,
        padding: "36px 32px 28px",
        position: "relative",
        overflow: "hidden",
    },
    topBar: {
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 3,
        background: "linear-gradient(90deg, #c8a44a 0%, #e8c97a 50%, #c8a44a 100%)",
    },
    lockWrap: {
        width: 52, height: 52,
        borderRadius: "50%",
        border: "1px solid #c8a44a50",
        background: "#c8a44a18",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20,
    },
    kicker: {
        margin: "0 0 8px",
        fontSize: 9,
        letterSpacing: "0.25em",
        color: "#c8a44a",
        fontWeight: 500,
    },
    title: {
        margin: "0 0 4px",
        fontFamily: "'Playfair Display', serif",
        fontSize: 28,
        fontWeight: 700,
        color: "#f0ece0",
        letterSpacing: "-.02em",
    },
    sub: {
        margin: "0 0 28px",
        fontSize: 11,
        color: "#7a7a96",
    },
    form: { display: "flex", flexDirection: "column", gap: 10 },
    label: { fontSize: 10, letterSpacing: ".15em", color: "#9090aa", marginBottom: -4 },
    input: {
        width: "100%",
        padding: "11px 14px",
        border: "1px solid #2a2a38",
        borderRadius: 3,
        background: "#07070a",
        color: "#f0ece0",
        fontSize: 13,
        fontFamily: "'JetBrains Mono', monospace",
        outline: "none",
        letterSpacing: ".05em",
        transition: "border-color .15s",
    },
    err: { margin: 0, fontSize: 12, color: "#e06060" },
    submit: {
        marginTop: 6,
        padding: "12px 0",
        border: "none",
        borderRadius: 3,
        background: "#c8a44a",
        color: "#07070a",
        fontSize: 13,
        fontWeight: 500,
        fontFamily: "'JetBrains Mono', monospace",
        cursor: "pointer",
        letterSpacing: ".08em",
        transition: "opacity .15s, transform .1s",
    },
    rule: { margin: "24px 0 18px", borderTop: "1px solid #2a2a38" },
    back: {
        display: "block",
        width: "100%",
        padding: "8px 0",
        border: "none",
        background: "none",
        color: "#7a7a96",
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
        cursor: "pointer",
        letterSpacing: ".05em",
        textAlign: "center",
        transition: "opacity .15s, transform .1s",
    },
};

// ── NOTE ROW ───────────────────────────────────────────────────────────────
function NoteRow({ m, index, token, onDelete, onEdit }) {
    const [editMode, setEditMode] = useState(false);
    const [editVal, setEditVal] = useState(m.body);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [rowErr, setRowErr] = useState("");
    const taRef = useRef(null);
    const color = NOTE_COLORS[m.color ?? (m.id.charCodeAt(0) % NOTE_COLORS.length)];

    useEffect(() => {
        if (editMode && taRef.current) taRef.current.focus();
    }, [editMode]);

    const startEdit = () => { setEditVal(m.body); setRowErr(""); setEditMode(true); };
    const cancelEdit = () => { setEditMode(false); setRowErr(""); };

    const saveEdit = async () => {
        const text = editVal.trim();
        if (!text) { setRowErr("Pesan tidak boleh kosong."); return; }
        if (text.length > MAX_LEN) { setRowErr(`Maks ${MAX_LEN} karakter.`); return; }
        setSaving(true); setRowErr("");
        const { ok, status, data } = await callAdmin(token, { id: m.id, body: text, action: "edit" });
        setSaving(false);
        if (!ok) { setRowErr(data?.error ?? "Gagal menyimpan."); if (status === 401) onEdit(null, true); return; }
        onEdit(m.id, false, text);
        setEditMode(false);
    };

    const del = async () => {
        if (!window.confirm(`Hapus note dari "${m.name?.trim() || "Anonim"}" permanen?`)) return;
        setDeleting(true);
        const { ok, status, data } = await callAdmin(token, { id: m.id });
        setDeleting(false);
        if (!ok) { setRowErr(data?.error ?? "Gagal menghapus."); if (status === 401) onDelete(null, true); return; }
        onDelete(m.id);
    };

    return (
        <article className="yn-row" style={R.row}>
            {/* strip warna kiri */}
            <div style={{ ...R.strip, background: color }} />

            {/* nomor baris */}
            <span style={R.num}>{String(index + 1).padStart(2, "0")}</span>

            {/* konten utama */}
            <div style={R.main}>
                {editMode ? (
                    <div style={R.editWrap}>
                        <textarea
                            ref={taRef}
                            style={R.textarea}
                            value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            rows={3}
                            maxLength={MAX_LEN}
                        />
                        <div style={R.editFoot}>
                            <span style={R.charCount}>{editVal.length}/{MAX_LEN}</span>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button className="yn-btn" style={R.btnCancel} onClick={cancelEdit} disabled={saving}>Batal</button>
                                <button className="yn-btn" style={{ ...R.btnSave, opacity: saving ? .6 : 1 }} onClick={saveEdit} disabled={saving}>
                                    {saving ? "menyimpan…" : "Simpan"}
                                </button>
                            </div>
                        </div>
                        {rowErr && <p style={R.rowErr}>{rowErr}</p>}
                    </div>
                ) : (
                    <>
                        <p style={R.body}>{m.body}</p>
                        {rowErr && <p style={R.rowErr}>{rowErr}</p>}
                    </>
                )}
                <div style={R.meta}>
                    <span style={R.from}>{m.name?.trim() || "Anonim"}</span>
                    <span style={R.dot}>·</span>
                    <span style={R.time}>{fmt(m.created_at)}</span>
                </div>
            </div>

            {/* aksi */}
            {!editMode && (
                <div style={R.actions}>
                    <button className="yn-btn" style={R.btnEdit} onClick={startEdit}>Edit</button>
                    <button className="yn-btn" style={{ ...R.btnDel, opacity: deleting ? .5 : 1 }} onClick={del} disabled={deleting}>
                        {deleting ? "…" : "Hapus"}
                    </button>
                </div>
            )}
        </article>
    );
}

const R = {
    row: {
        display: "flex",
        alignItems: "flex-start",
        gap: 0,
        background: "#111118",
        border: "1px solid #252530",
        borderRadius: 3,
        overflow: "hidden",
        position: "relative",
        transition: "border-color .15s",
    },
    strip: { width: 4, flexShrink: 0, alignSelf: "stretch", minHeight: 54 },
    num: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        color: "#52526a",
        padding: "16px 10px 0 10px",
        flexShrink: 0,
        userSelect: "none",
        letterSpacing: ".05em",
    },
    main: { flex: 1, padding: "14px 12px 14px 6px", minWidth: 0 },
    body: {
        margin: "0 0 8px",
        fontFamily: "'Playfair Display', serif",
        fontSize: 15,
        lineHeight: 1.55,
        color: "#eae6da",
        wordBreak: "break-word",
    },
    meta: {
        display: "flex",
        alignItems: "center",
        gap: 7,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        color: "#70708a",
    },
    from: { color: "#9090aa", fontWeight: 500 },
    dot: { opacity: .5, color: "#52526a" },
    time: { color: "#70708a" },
    actions: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "12px 14px 12px 8px",
        flexShrink: 0,
        justifyContent: "center",
    },
    btnEdit: {
        padding: "5px 12px",
        border: "1px solid #c8a44a60",
        borderRadius: 2,
        background: "transparent",
        color: "#c8a44a",
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
        cursor: "pointer",
        letterSpacing: ".04em",
        transition: "opacity .15s, transform .1s",
    },
    btnDel: {
        padding: "5px 12px",
        border: "1px solid #e0606050",
        borderRadius: 2,
        background: "transparent",
        color: "#e06060",
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
        cursor: "pointer",
        letterSpacing: ".04em",
        transition: "opacity .15s, transform .1s",
    },
    editWrap: { display: "flex", flexDirection: "column", gap: 8 },
    textarea: {
        width: "100%",
        padding: "10px 12px",
        border: "1px solid #c8a44a60",
        borderRadius: 3,
        background: "#07070a",
        color: "#eae6da",
        fontSize: 14,
        fontFamily: "'Playfair Display', serif",
        lineHeight: 1.5,
        resize: "vertical",
        outline: "none",
        minHeight: 72,
    },
    editFoot: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
    },
    charCount: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        color: "#70708a",
    },
    btnCancel: {
        padding: "5px 12px",
        border: "1px solid #2a2a38",
        borderRadius: 2,
        background: "transparent",
        color: "#9090aa",
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
        cursor: "pointer",
        transition: "opacity .15s, transform .1s",
    },
    btnSave: {
        padding: "5px 14px",
        border: "none",
        borderRadius: 2,
        background: "#c8a44a",
        color: "#07070a",
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 500,
        cursor: "pointer",
        letterSpacing: ".05em",
        transition: "opacity .15s, transform .1s",
    },
    rowErr: { margin: 0, fontSize: 11, color: "#e06060", fontFamily: "'JetBrains Mono', monospace" },
};

// ── DIAGNOSTIK ─────────────────────────────────────────────────────────────
// Tool dev: kirim test note ke edge function, tampil status + response mentah.
// Bikin satu note "__diag_…" di papan — hapus lewat list di bawah setelah refresh.
function hintFor(status, data) {
    if (status === 200) return { tone: "ok", msg: "BERHASIL. Nempel note jalan normal." };
    if (status === 401) return { tone: "bad", msg: "401 — gateway tolak key. Key bukan JWT (sb_publishable_…) padahal verify_jwt aktif, ATAU app masih baca env lama. Cek VITE_SUPABASE_ANON_KEY + restart/rebuild." };
    if (status === 429) return { tone: "warn", msg: "429 — cooldown 30 detik. Edge function & DB SEHAT. Tunggu 30 detik, ini bukan bug." };
    if (status === 500) return { tone: "bad", msg: `500 — error server. ${data?.error === "Server misconfigured." ? "IP_SALT belum di-set di env edge function." : "Cek log edge function di dashboard Supabase."}` };
    if (status === 0) return { tone: "bad", msg: "Gagal konek — CORS / URL salah / fungsi belum deploy." };
    return { tone: "warn", msg: `Status ${status} tak terduga. Lihat response di bawah.` };
}

function DiagPanel() {
    const [busy, setBusy] = useState(false);
    const [res, setRes] = useState(null);

    const key = SUPABASE_ANON_KEY || "";
    const keyKind = !key ? "KOSONG" : key.startsWith("eyJ") ? "JWT (anon — benar)" : "publishable (sb_…) — ditolak edge function";
    const keyMask = key ? `${key.slice(0, 10)}…${key.slice(-6)}` : "(tidak ada)";

    const ping = async () => {
        if (!POST_MESSAGE_URL) {
            setRes({ status: 0, ms: 0, data: { error: "POST_MESSAGE_URL kosong — VITE_SUPABASE_URL belum diisi." }, netErr: null });
            return;
        }
        setBusy(true); setRes(null);
        const t0 = performance.now();
        let status = 0, data = {}, netErr = null;
        try {
            const r = await fetch(POST_MESSAGE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
                body: JSON.stringify({ name: "_diag", body: `__diag_${Date.now()}__`, color: 0 }),
            });
            status = r.status;
            data = await r.json().catch(() => ({}));
        } catch (e) {
            netErr = e?.message || "network error";
        }
        const ms = Math.round(performance.now() - t0);
        setBusy(false);
        setRes({ status, ms, data, netErr });
    };

    const hint = res ? hintFor(res.netErr ? 0 : res.status, res.data) : null;

    return (
        <section style={DX.wrap}>
            <div style={DX.head}>
                <span style={DX.badge}>DIAGNOSTIK</span>
                <span style={DX.headSub}>uji nempel note → status mentah</span>
            </div>

            <div style={DX.kv}><span style={DX.k}>POST URL</span><span style={DX.v}>{POST_MESSAGE_URL || "(kosong)"}</span></div>
            <div style={DX.kv}><span style={DX.k}>Key dipakai</span><span style={DX.v}>{keyMask}</span></div>
            <div style={DX.kv}><span style={DX.k}>Jenis key</span><span style={{ ...DX.v, color: key.startsWith("eyJ") ? "#6fcf97" : "#e0a060" }}>{keyKind}</span></div>

            <button className="yn-btn" style={{ ...DX.btn, opacity: busy ? .6 : 1 }} onClick={ping} disabled={busy}>
                {busy ? "mengirim…" : "▶ Kirim test note"}
            </button>

            {res && (
                <div style={DX.out}>
                    <div style={DX.statusRow}>
                        <span style={{ ...DX.statusPill, background: res.status === 200 ? "#0e2a18" : "#2a0e0e", color: res.status === 200 ? "#6fcf97" : "#e06060", borderColor: res.status === 200 ? "#6fcf9740" : "#e0606040" }}>
                            {res.netErr ? "NETWORK ERR" : `HTTP ${res.status}`}
                        </span>
                        <span style={DX.ms}>{res.ms} ms</span>
                    </div>
                    {hint && (
                        <p style={{ ...DX.hint, color: hint.tone === "ok" ? "#6fcf97" : hint.tone === "warn" ? "#e0c060" : "#e08080" }}>
                            {hint.msg}
                        </p>
                    )}
                    <pre style={DX.pre}>{res.netErr ? res.netErr : JSON.stringify(res.data, null, 2)}</pre>
                </div>
            )}
        </section>
    );
}

const DX = {
    wrap: {
        maxWidth: 860,
        margin: "0 auto 24px",
        padding: "18px 20px",
        background: "#0d0d14",
        border: "1px solid #252530",
        borderRadius: 3,
    },
    head: { display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 },
    badge: { fontSize: 9, letterSpacing: ".22em", color: "#c8a44a", fontWeight: 500 },
    headSub: { fontSize: 10, color: "#70708a", letterSpacing: ".03em" },
    kv: { display: "flex", gap: 12, fontSize: 11, padding: "3px 0", alignItems: "baseline" },
    k: { color: "#70708a", minWidth: 88, flexShrink: 0 },
    v: { color: "#cfcad8", wordBreak: "break-all" },
    btn: {
        marginTop: 14,
        padding: "9px 16px",
        border: "1px solid #c8a44a60",
        borderRadius: 2,
        background: "#c8a44a14",
        color: "#c8a44a",
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
        cursor: "pointer",
        letterSpacing: ".05em",
        transition: "opacity .15s, transform .1s",
    },
    out: { marginTop: 16, borderTop: "1px solid #1e1e2a", paddingTop: 14 },
    statusRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 10 },
    statusPill: {
        padding: "4px 10px",
        borderRadius: 2,
        border: "1px solid",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: ".05em",
    },
    ms: { fontSize: 10, color: "#70708a" },
    hint: { margin: "0 0 12px", fontSize: 12, lineHeight: 1.5 },
    pre: {
        margin: 0,
        padding: "12px 14px",
        background: "#07070a",
        border: "1px solid #1e1e2a",
        borderRadius: 2,
        color: "#9ad1b0",
        fontSize: 11,
        lineHeight: 1.5,
        fontFamily: "'JetBrains Mono', monospace",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
    },
};

// ── DASHBOARD ──────────────────────────────────────────────────────────────
export default function AdminNotes({ onBack }) {
    const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || "");
    const [authed, setAuthed] = useState(() => !!sessionStorage.getItem(TOKEN_KEY));
    const [messages, setMessages] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [globalErr, setGlobalErr] = useState("");

    const fetchAll = useCallback(async () => {
        if (!supabase) { setGlobalErr("Supabase belum dikonfigurasi."); setLoading(false); return; }
        setLoading(true);
        const { data, error } = await supabase
            .from("messages").select("*")
            .order("created_at", { ascending: false }).limit(500);
        if (error) setGlobalErr("Gagal memuat pesan.");
        else { setGlobalErr(""); setMessages(data || []); }
        setLoading(false);
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleAuth = (t) => { setToken(t); setAuthed(true); };

    const handleLogout = () => {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken(""); setAuthed(false);
    };

    const handleDelete = (id, unauthorized = false) => {
        if (unauthorized) { handleLogout(); return; }
        setMessages(prev => prev.filter(m => m.id !== id));
    };

    const handleEdit = (id, unauthorized = false, newBody = "") => {
        if (unauthorized) { handleLogout(); return; }
        setMessages(prev => prev.map(m => m.id === id ? { ...m, body: newBody } : m));
    };

    if (!authed) return <Gate onAuth={handleAuth} />;

    const q = query.trim().toLowerCase();
    const shown = q
        ? messages.filter(m =>
            (m.body || "").toLowerCase().includes(q) ||
            (m.name || "").toLowerCase().includes(q))
        : messages;

    return (
        <div style={D.bg}>
            <style>{FONTS}</style>

            {/* ── header ── */}
            <header style={D.header}>
                <div style={D.headerLeft}>
                    <p style={D.kicker}>ADMIN PANEL</p>
                    <h1 style={D.title}>Sticky Memory</h1>
                    <p style={D.sub}>Yearbook 2025 · {messages.length} note tersimpan</p>
                </div>
                <nav style={D.nav}>
                    <button className="yn-btn" style={D.navBtn} onClick={fetchAll}>↻ Refresh</button>
                    <button className="yn-btn" style={D.navBtn} onClick={() => { window.location.hash = ""; }}>← Situs</button>
                    <button className="yn-btn" style={{ ...D.navBtn, color: "#d95f5f", borderColor: "#d95f5f28" }} onClick={handleLogout}>Keluar</button>
                </nav>
            </header>

            {/* ── garis emas ── */}
            <div style={D.goldenRule} />

            {/* ── diagnostik (dev) ── */}
            <DiagPanel />

            {/* ── search ── */}
            <div style={D.searchWrap}>
                <svg style={D.searchIc} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input
                    style={D.searchInput}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="cari isi atau nama pembuat…"
                />
                {query && (
                    <button className="yn-btn" style={D.searchClear} onClick={() => setQuery("")}>✕</button>
                )}
            </div>

            {q && (
                <p style={D.resultCount}>
                    {shown.length > 0
                        ? `${shown.length} dari ${messages.length} note cocok`
                        : `Tidak ada note cocok "${query.trim()}"`}
                </p>
            )}

            {globalErr && <div style={D.errBanner}>{globalErr}</div>}

            {/* ── list ── */}
            {loading ? (
                <div style={D.empty}>
                    <span style={{ animation: "pulse 1.2s infinite" }}>memuat arsip…</span>
                </div>
            ) : shown.length === 0 ? (
                <div style={D.empty}>{q ? `Tidak ada hasil.` : "Belum ada note."}</div>
            ) : (
                <div style={D.list}>
                    {shown.map((m, i) => (
                        <NoteRow
                            key={m.id}
                            m={m}
                            index={i}
                            token={token}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>
            )}

            {/* ── footer ── */}
            <footer style={D.footer}>
                <span>Token aktif di sesi ini saja · ditolak = auto-logout</span>
            </footer>
        </div>
    );
}

const D = {
    bg: {
        minHeight: "100vh",
        background: "#07070a",
        color: "#ddd8cc",
        fontFamily: "'JetBrains Mono', monospace",
        padding: "0 0 80px",
    },
    header: {
        maxWidth: 860,
        margin: "0 auto",
        padding: "40px 24px 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: 16,
        flexWrap: "wrap",
    },
    headerLeft: {},
    kicker: {
        margin: "0 0 10px",
        fontSize: 9,
        letterSpacing: ".28em",
        color: "#c8a44a",
        fontWeight: 500,
    },
    title: {
        margin: "0 0 6px",
        fontFamily: "'Playfair Display', serif",
        fontSize: 36,
        fontWeight: 700,
        color: "#f0ece0",
        letterSpacing: "-.02em",
    },
    sub: { margin: 0, fontSize: 11, color: "#70708a" },
    nav: { display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 4 },
    navBtn: {
        padding: "7px 14px",
        border: "1px solid #2a2a38",
        borderRadius: 2,
        background: "transparent",
        color: "#9090aa",
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
        cursor: "pointer",
        letterSpacing: ".04em",
        transition: "opacity .15s, transform .1s",
    },
    goldenRule: {
        maxWidth: 860,
        margin: "20px auto 24px",
        height: 1,
        background: "linear-gradient(90deg, #c8a44a 0%, #c8a44a50 60%, transparent 100%)",
    },
    searchWrap: {
        maxWidth: 860,
        margin: "0 auto 16px",
        padding: "0 24px",
        position: "relative",
        display: "flex",
        alignItems: "center",
    },
    searchIc: {
        position: "absolute",
        left: 38,
        width: 14, height: 14,
        color: "#70708a",
        pointerEvents: "none",
    },
    searchInput: {
        width: "100%",
        maxWidth: 440,
        padding: "10px 14px 10px 36px",
        border: "1px solid #252530",
        borderRadius: 2,
        background: "#111118",
        color: "#eae6da",
        fontSize: 12,
        fontFamily: "'JetBrains Mono', monospace",
        outline: "none",
        letterSpacing: ".02em",
    },
    searchClear: {
        marginLeft: 8,
        border: "none",
        background: "none",
        color: "#70708a",
        cursor: "pointer",
        fontSize: 12,
        fontFamily: "'JetBrains Mono', monospace",
        transition: "opacity .15s, transform .1s",
    },
    resultCount: {
        maxWidth: 860,
        margin: "0 auto 14px",
        padding: "0 24px",
        fontSize: 11,
        color: "#70708a",
    },
    errBanner: {
        maxWidth: 860,
        margin: "0 auto 16px",
        padding: "10px 24px",
        background: "#1a0a0a",
        border: "1px solid #e0606040",
        color: "#e06060",
        fontSize: 12,
        fontFamily: "'JetBrains Mono', monospace",
    },
    list: {
        maxWidth: 860,
        margin: "0 auto",
        padding: "0 24px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
    },
    empty: {
        maxWidth: 860,
        margin: "60px auto",
        padding: "0 24px",
        fontSize: 13,
        color: "#52526a",
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: ".05em",
    },
    footer: {
        maxWidth: 860,
        margin: "48px auto 0",
        padding: "20px 24px 0",
        borderTop: "1px solid #252530",
        fontSize: 10,
        color: "#52526a",
        letterSpacing: ".05em",
    },
};
