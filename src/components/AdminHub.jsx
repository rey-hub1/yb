import React, { useState } from "react";
import AdminGate from "./AdminGate";
import AdminNotes from "./AdminNotes";
import AdminPDD from "./AdminPDD";
import { TOKEN_KEY, FONTS } from "../lib/adminShared";

const MENU_STYLES = `
  .yn-menu-card {
    background: #111118;
    border: 1px solid #2a2a38;
    border-radius: 6px;
    padding: 48px 32px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .yn-menu-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #c8a44a 0%, #e8c97a 50%, #c8a44a 100%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .yn-menu-card:hover {
    transform: translateY(-4px);
    border-color: #c8a44a50;
    box-shadow: 0 12px 24px rgba(0,0,0,0.4);
  }
  .yn-menu-card:hover::before {
    opacity: 1;
  }
  .yn-menu-card:hover .yn-icon-wrap {
    background: #c8a44a18;
    border-color: #c8a44a50;
    transform: scale(1.05);
  }
`;

// Hub admin: login sekali (AdminGate) lalu pilih panel Sticky Memory / Cover PDD.
export default function AdminHub() {
    const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || "");
    const [authed, setAuthed] = useState(() => !!sessionStorage.getItem(TOKEN_KEY));
    const [tab, setTab] = useState("menu");

    const handleAuth = (t) => { setToken(t); setAuthed(true); };
    const logout = () => { sessionStorage.removeItem(TOKEN_KEY); setToken(""); setAuthed(false); };

    if (!authed) return <AdminGate onAuth={handleAuth} />;

    return (
        <div style={H.bg}>
            <style>{FONTS + MENU_STYLES}</style>
            
            {tab === "menu" ? (
                <div style={H.menuWrapper}>
                    <div style={H.menuTop}>
                        <h1 style={H.menuTitle}>Admin Dashboard</h1>
                        <button className="yn-btn" style={{ ...H.navBtn, color: "#d95f5f", borderColor: "#d95f5f28" }} onClick={logout}>Keluar</button>
                    </div>
                    <div style={H.menuContainer}>
                        <div className="yn-menu-card" onClick={() => setTab("notes")}>
                            <div className="yn-icon-wrap" style={H.cardIconWrap}>
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c8a44a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                            </div>
                            <h2 style={H.cardTitle}>Sticky Memory</h2>
                            <p style={H.cardDesc}>Kelola pesan, coretan, dan kenangan yang ditinggalkan pengguna.</p>
                        </div>
                        <div className="yn-menu-card" onClick={() => setTab("pdd")}>
                            <div className="yn-icon-wrap" style={H.cardIconWrap}>
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c8a44a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                            </div>
                            <h2 style={H.cardTitle}>Cover Dokumentasi</h2>
                            <p style={H.cardDesc}>Kelola galeri foto dan aset untuk halaman sampul PDD.</p>
                        </div>
                    </div>
                    <div style={H.menuFooter}>
                         <button className="yn-btn" style={{...H.navBtn, padding: "10px 18px"}} onClick={() => { window.location.href = "/"; }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px", marginRight: 6 }}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                            Kembali ke Situs
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div style={H.bar}>
                        <div style={H.tabs}>
                            <button className="yn-btn" style={H.navBtn} onClick={() => setTab("menu")}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px", marginRight: 5 }}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                                Dashboard
                            </button>
                            <span style={H.activeBreadcrumb}>
                                / {tab === "notes" ? "Sticky Memory" : "Cover Dokumentasi"}
                            </span>
                        </div>
                        <div style={H.actions}>
                            <button className="yn-btn" style={H.navBtn} onClick={() => { window.location.href = "/"; }}>Situs</button>
                            <button className="yn-btn" style={{ ...H.navBtn, color: "#d95f5f", borderColor: "#d95f5f28" }} onClick={logout}>Keluar</button>
                        </div>
                    </div>
                    {tab === "notes" ? <AdminNotes token={token} embedded /> : <AdminPDD token={token} />}
                </>
            )}
        </div>
    );
}

const H = {
    bg: { minHeight: "100vh", background: "#07070a", fontFamily: "'JetBrains Mono', monospace" },
    bar: {
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, flexWrap: "wrap",
        maxWidth: 860, margin: "0 auto", padding: "14px 24px",
        background: "rgba(7,7,10,0.92)", backdropFilter: "blur(8px)",
        borderBottom: "1px solid #1e1e2a",
    },
    tabs: { display: "flex", gap: 12, alignItems: "center" },
    activeBreadcrumb: { color: "#c8a44a", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, letterSpacing: ".02em" },
    actions: { display: "flex", gap: 8 },
    navBtn: {
        padding: "8px 14px", border: "1px solid #2a2a38", borderRadius: 2,
        background: "transparent", color: "#9090aa", fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace", cursor: "pointer", letterSpacing: ".04em",
        transition: "opacity .15s, transform .1s", display: "inline-flex", alignItems: "center",
    },
    menuWrapper: {
        maxWidth: 860,
        margin: "0 auto",
        padding: "80px 24px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        animation: "fadeUp .4s ease both",
    },
    menuTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 60,
    },
    menuTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: 32,
        fontWeight: 700,
        color: "#f0ece0",
        margin: 0,
        letterSpacing: "-.02em",
    },
    menuContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: 24,
    },
    cardIconWrap: {
        width: 72, height: 72,
        borderRadius: "50%",
        border: "1px solid #2a2a38",
        background: "#07070a",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 24,
        transition: "all 0.3s ease",
    },
    cardTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: 22,
        fontWeight: 700,
        color: "#f0ece0",
        margin: "0 0 12px",
    },
    cardDesc: {
        fontSize: 13,
        color: "#7a7a96",
        lineHeight: 1.6,
        margin: 0,
        maxWidth: 240,
    },
    menuFooter: {
        textAlign: "center",
        marginTop: 60,
        paddingTop: 40,
        borderTop: "1px solid #1e1e2a",
    }
};
