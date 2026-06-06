import React, { useState } from "react";
import { callAdmin, TOKEN_KEY, FONTS } from "../lib/adminShared";

// Gerbang login admin. Verifikasi token ke edge function, simpan di sessionStorage.
export default function AdminGate({ onAuth }) {
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
                <div style={G.topBar} />
                <div style={G.lockWrap}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c8a44a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>
                <p style={G.kicker}>RESTRICTED ACCESS</p>
                <h1 style={G.title}>Admin Panel</h1>
                <p style={G.sub}>Yearbook 2026 · Sticky Memory & Cover PDD</p>
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
                        ) : (
                            <>Masuk <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px", marginLeft: 4 }}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></>
                        )}
                    </button>
                </form>
                <div style={G.rule} />
                <button className="yn-btn" style={G.back} onClick={() => { window.location.href = "/"; }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px", marginRight: 5 }}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                    kembali ke situs
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
    kicker: { margin: "0 0 8px", fontSize: 9, letterSpacing: "0.25em", color: "#c8a44a", fontWeight: 500 },
    title: {
        margin: "0 0 4px",
        fontFamily: "'Playfair Display', serif",
        fontSize: 28, fontWeight: 700, color: "#f0ece0", letterSpacing: "-.02em",
    },
    sub: { margin: "0 0 28px", fontSize: 11, color: "#7a7a96" },
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
