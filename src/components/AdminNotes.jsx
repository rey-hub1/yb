import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase, POST_MESSAGE_URL, SUPABASE_ANON_KEY } from "../lib/supabase";
import { callAdmin, TOKEN_KEY, FONTS } from "../lib/adminShared";
import AdminGate from "./AdminGate";

const MAX_LEN = 80;
const NOTE_COLORS = ["#fef3c0","#fcded0","#d7eed9","#fbd6e2","#d6e6f4","#ece2f7"];

function fmt(iso) {
    return new Date(iso).toLocaleString("id-ID", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

// ── NOTE ROW ───────────────────────────────────────────────────────────────
function NoteRow({ m, index, token, onDelete, onEdit, selected, onToggleSelect }) {
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
        <article className="yn-row" style={{ ...R.row, ...(selected ? R.rowSelected : null) }}>
            {/* strip warna kiri */}
            <div style={{ ...R.strip, background: color }} />

            {/* checkbox pilih */}
            <label style={R.checkWrap} title="Pilih note">
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleSelect(m.id)}
                    style={R.check}
                />
            </label>

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
    rowSelected: { borderColor: "#c8a44a", background: "#16140d" },
    checkWrap: {
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 6px 0 12px", flexShrink: 0, alignSelf: "stretch", cursor: "pointer",
    },
    check: { width: 15, height: 15, accentColor: "#c8a44a", cursor: "pointer" },
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
                <span style={DX.headSub}>uji nempel note · status mentah</span>
            </div>

            <div style={DX.kv}><span style={DX.k}>POST URL</span><span style={DX.v}>{POST_MESSAGE_URL || "(kosong)"}</span></div>
            <div style={DX.kv}><span style={DX.k}>Key dipakai</span><span style={DX.v}>{keyMask}</span></div>
            <div style={DX.kv}><span style={DX.k}>Jenis key</span><span style={{ ...DX.v, color: key.startsWith("eyJ") ? "#6fcf97" : "#e0a060" }}>{keyKind}</span></div>

            <button className="yn-btn" style={{ ...DX.btn, opacity: busy ? .6 : 1 }} onClick={ping} disabled={busy}>
                {busy ? "mengirim…" : (
                    <><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ verticalAlign: "-1px", marginRight: 6 }}><polygon points="5 3 19 12 5 21 5 3" /></svg>Kirim test note</>
                )}
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
export default function AdminNotes({ token: tokenProp, embedded = false }) {
    // embedded = dipakai di dalam AdminHub (login dikelola hub). Standalone = pakai Gate sendiri.
    const [token, setToken] = useState(() => tokenProp || sessionStorage.getItem(TOKEN_KEY) || "");
    const [authed, setAuthed] = useState(() => embedded || !!sessionStorage.getItem(TOKEN_KEY));
    const [messages, setMessages] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [globalErr, setGlobalErr] = useState("");
    const [selected, setSelected] = useState(() => new Set());
    const [bulkBusy, setBulkBusy] = useState(false);

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

    const toggleSelect = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };
    const selectAll = (list) => setSelected(new Set(list.map(m => m.id)));
    const clearSelection = () => setSelected(new Set());

    // hapus massal — edge function 1 id per panggilan, jadi loop sekuensial.
    // baris yg sukses dibuang dari state; 401 = token kadaluarsa → logout.
    const bulkDelete = async () => {
        const ids = [...selected];
        if (ids.length === 0 || bulkBusy) return;
        if (!window.confirm(`Hapus ${ids.length} note terpilih permanen? Tindakan ini tidak bisa dibatalkan.`)) return;
        setBulkBusy(true);
        const okIds = [];
        let unauthorized = false;
        for (const id of ids) {
            const { ok, status } = await callAdmin(token, { id });
            if (ok) okIds.push(id);
            else if (status === 401) { unauthorized = true; break; }
        }
        setBulkBusy(false);
        if (okIds.length) {
            setMessages(prev => prev.filter(m => !okIds.includes(m.id)));
            setSelected(prev => {
                const next = new Set(prev);
                okIds.forEach(id => next.delete(id));
                return next;
            });
        }
        if (unauthorized) { handleLogout(); return; }
        const failed = ids.length - okIds.length;
        if (failed > 0) setGlobalErr(`${okIds.length} terhapus, ${failed} gagal. Coba lagi.`);
    };

    if (!authed) return <AdminGate onAuth={handleAuth} />;

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
                    <button className="yn-btn" style={D.navBtn} onClick={fetchAll}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px", marginRight: 5 }}><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" /></svg>
                        Refresh
                    </button>
                    {!embedded && (
                        <>
                            <button className="yn-btn" style={D.navBtn} onClick={() => { window.location.hash = ""; }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px", marginRight: 5 }}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                                Situs
                            </button>
                            <button className="yn-btn" style={{ ...D.navBtn, color: "#d95f5f", borderColor: "#d95f5f28" }} onClick={handleLogout}>Keluar</button>
                        </>
                    )}
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
                    <button className="yn-btn" style={D.searchClear} onClick={() => setQuery("")} aria-label="Hapus pencarian">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
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

            {/* ── bulk action bar ── */}
            {!loading && shown.length > 0 && (
                <div style={D.bulkBar}>
                    <label style={D.bulkAll}>
                        <input
                            type="checkbox"
                            checked={shown.length > 0 && shown.every(m => selected.has(m.id))}
                            ref={el => { if (el) el.indeterminate = selected.size > 0 && !shown.every(m => selected.has(m.id)); }}
                            onChange={e => e.target.checked ? selectAll(shown) : clearSelection()}
                            style={{ width: 15, height: 15, accentColor: "#c8a44a", cursor: "pointer" }}
                        />
                        <span>{selected.size > 0 ? `${selected.size} dipilih` : "Pilih semua"}</span>
                    </label>
                    {selected.size > 0 && (
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="yn-btn" style={D.bulkCancel} onClick={clearSelection} disabled={bulkBusy}>Batal</button>
                            <button
                                className="yn-btn"
                                style={{ ...D.bulkDel, opacity: bulkBusy ? .6 : 1 }}
                                onClick={bulkDelete}
                                disabled={bulkBusy}
                            >
                                {bulkBusy ? "menghapus…" : `Hapus ${selected.size} terpilih`}
                            </button>
                        </div>
                    )}
                </div>
            )}

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
                            selected={selected.has(m.id)}
                            onToggleSelect={toggleSelect}
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
    bulkBar: {
        maxWidth: 860,
        margin: "0 auto 12px",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
    },
    bulkAll: {
        display: "flex",
        alignItems: "center",
        gap: 9,
        fontSize: 12,
        color: "#9090aa",
        cursor: "pointer",
        userSelect: "none",
    },
    bulkCancel: {
        padding: "7px 14px",
        border: "1px solid #2a2a38",
        borderRadius: 2,
        background: "transparent",
        color: "#9090aa",
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
        cursor: "pointer",
        transition: "opacity .15s, transform .1s",
    },
    bulkDel: {
        padding: "7px 16px",
        border: "1px solid #e0606050",
        borderRadius: 2,
        background: "#e0606018",
        color: "#e06060",
        fontSize: 11,
        fontWeight: 500,
        fontFamily: "'JetBrains Mono', monospace",
        cursor: "pointer",
        letterSpacing: ".04em",
        transition: "opacity .15s, transform .1s",
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
