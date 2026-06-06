import React, { useState, useEffect, useCallback, useRef } from "react";
import { DOC_SECTIONS, DOC_COVER_KEY, driveThumb, parseDriveId } from "../data/documentation";

// Atur cover kotak Dokumentasi. Override disimpan di localStorage (browser ini saja).
// Kalau kosong → frontend pilih foto acak dari covers[] folder.

function loadCovers() {
    try { return JSON.parse(localStorage.getItem(DOC_COVER_KEY) || "{}"); }
    catch { return {}; }
}
function saveCovers(map) {
    try { localStorage.setItem(DOC_COVER_KEY, JSON.stringify(map)); } catch { /* noop */ }
}

// resolve nilai override → URL gambar (id mentah → thumbnail, url penuh → apa adanya)
function overrideToUrl(val) {
    if (!val) return "";
    if (/^https?:\/\//i.test(val)) return val;
    return driveThumb(val);
}

function CoverRow({ box, value, onSave, onReset }) {
    const [input, setInput] = useState("");
    const [preview, setPreview] = useState(() => {
        if (value) return overrideToUrl(value);
        return box.covers?.[0] ? driveThumb(box.covers[0]) : "";
    });
    const [imgFail, setImgFail] = useState(false);

    useEffect(() => {
        setImgFail(false);
        if (value) setPreview(overrideToUrl(value));
        else setPreview(box.covers?.[0] ? driveThumb(box.covers[0]) : "");
    }, [value, box.covers]);

    // safety: kalau thumbnail nggak load dalam 7 dtk (hang/blank), anggap gagal → icon.
    const timerRef = useRef(null);
    useEffect(() => {
        clearTimeout(timerRef.current);
        if (!preview) return;
        setImgFail(false);
        timerRef.current = setTimeout(() => setImgFail(true), 7000);
        return () => clearTimeout(timerRef.current);
    }, [preview]);

    const save = () => {
        const id = parseDriveId(input);
        if (!id) return;
        onSave(box.id, id);
        setInput("");
    };

    // acak preview dari pool (cuma tampilan, tidak menyimpan)
    const shuffle = () => {
        if (!box.covers?.length) return;
        const pick = box.covers[Math.floor(Math.random() * box.covers.length)];
        setImgFail(false);
        setPreview(driveThumb(pick));
    };

    return (
        <article className="yn-row" style={P.row}>
            <div style={P.thumbWrap}>
                {preview && !imgFail ? (
                    <img
                        key={preview}
                        src={preview}
                        alt=""
                        style={P.thumb}
                        referrerPolicy="no-referrer"
                        onLoad={() => clearTimeout(timerRef.current)}
                        onError={() => { clearTimeout(timerRef.current); setImgFail(true); }}
                        loading="lazy"
                    />
                ) : (
                    <span style={P.thumbIcon}>{box.icon || "🖼️"}</span>
                )}
                <span style={P.thumbBadge}>{value ? "diset" : "acak"}</span>
            </div>

            <div style={P.main}>
                <div style={P.head}>
                    <span style={P.name}>{box.name}</span>
                    <a
                        href={`https://drive.google.com/drive/folders/${box.id}`}
                        target="_blank" rel="noopener noreferrer"
                        style={P.folderLink}
                    >folder ↗</a>
                </div>
                <span style={P.meta}>
                    {box.covers?.length ? `${box.covers.length} kandidat foto` : "tidak ada kandidat — fallback icon"}
                </span>

                <div style={P.controls}>
                    <input
                        style={P.input}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="paste link / ID gambar Drive…"
                        onKeyDown={e => { if (e.key === "Enter") save(); }}
                    />
                    <button className="yn-btn" style={P.btnSave} onClick={save}>Simpan</button>
                    {box.covers?.length > 0 && (
                        <button className="yn-btn" style={P.btnGhost} onClick={shuffle}>Acak</button>
                    )}
                    {value && (
                        <button className="yn-btn" style={P.btnReset} onClick={() => onReset(box.id)}>Reset</button>
                    )}
                </div>
            </div>
        </article>
    );
}

export default function AdminPDD() {
    const [covers, setCovers] = useState(loadCovers);

    const handleSave = useCallback((boxId, val) => {
        setCovers(prev => {
            const next = { ...prev, [boxId]: val };
            saveCovers(next);
            return next;
        });
    }, []);

    const handleReset = useCallback((boxId) => {
        setCovers(prev => {
            const next = { ...prev };
            delete next[boxId];
            saveCovers(next);
            return next;
        });
    }, []);

    const totalSet = Object.keys(covers).length;

    return (
        <div style={P.wrap}>
            <header style={P.pageHead}>
                <div>
                    <p style={P.kicker}>ADMIN · COVER PDD</p>
                    <h1 style={P.title}>Cover Dokumentasi</h1>
                    <p style={P.sub}>{totalSet} cover diset · sisanya acak dari folder</p>
                </div>
            </header>

            <div style={P.note}>
                Cover tersimpan di <b>browser ini saja</b> (localStorage). Pengunjung lain tetap melihat
                foto acak. Tempel link/ID gambar Drive (file harus public) lalu Simpan.
            </div>

            {DOC_SECTIONS.map(section => (
                <section key={section.id} style={P.section}>
                    <div style={P.sectionHead}>
                        <span style={P.sectionIndex}>{section.index}</span>
                        <span style={P.sectionLabel}>{section.label}</span>
                        <span style={P.sectionLine} />
                    </div>
                    <div style={P.list}>
                        {section.boxes.map(box => (
                            <CoverRow
                                key={box.id}
                                box={box}
                                value={covers[box.id]}
                                onSave={handleSave}
                                onReset={handleReset}
                            />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}

const P = {
    wrap: { maxWidth: 860, margin: "0 auto", padding: "32px 24px 80px" },
    pageHead: { marginBottom: 18 },
    kicker: { margin: "0 0 10px", fontSize: 9, letterSpacing: ".28em", color: "#c8a44a", fontWeight: 500 },
    title: { margin: "0 0 6px", fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: "#f0ece0", letterSpacing: "-.02em" },
    sub: { margin: 0, fontSize: 11, color: "#70708a" },
    note: {
        margin: "0 0 24px", padding: "12px 14px",
        background: "#13110a", border: "1px solid #c8a44a30", borderRadius: 3,
        fontSize: 11.5, lineHeight: 1.6, color: "#c2b48a",
    },
    section: { marginBottom: 26 },
    sectionHead: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
    sectionIndex: { fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#c8a44a", flexShrink: 0 },
    sectionLabel: { fontSize: 13, color: "#cfcad8", letterSpacing: ".05em", flexShrink: 0 },
    sectionLine: { flex: 1, height: 1, background: "linear-gradient(90deg, #2a2a38, transparent)" },
    list: { display: "flex", flexDirection: "column", gap: 8 },
    row: {
        display: "flex", gap: 14, alignItems: "stretch",
        background: "#111118", border: "1px solid #252530", borderRadius: 4, padding: 12,
    },
    thumbWrap: {
        position: "relative", width: 96, height: 72, flexShrink: 0,
        borderRadius: 3, overflow: "hidden",
        background: "#07070a", border: "1px solid #2a2a38",
        display: "flex", alignItems: "center", justifyContent: "center",
    },
    thumb: { width: "100%", height: "100%", objectFit: "cover" },
    thumbIcon: { fontSize: 28 },
    thumbBadge: {
        position: "absolute", bottom: 4, left: 4,
        fontSize: 8, letterSpacing: ".1em", textTransform: "uppercase",
        padding: "2px 6px", borderRadius: 2,
        background: "rgba(7,7,10,0.8)", color: "#c8a44a",
    },
    main: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 },
    head: { display: "flex", alignItems: "center", gap: 10 },
    name: { fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#eae6da" },
    folderLink: { fontSize: 10, color: "#7a7a96", textDecoration: "none", letterSpacing: ".03em" },
    meta: { fontSize: 10.5, color: "#70708a" },
    controls: { display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" },
    input: {
        flex: 1, minWidth: 160,
        padding: "8px 11px",
        border: "1px solid #2a2a38", borderRadius: 3,
        background: "#07070a", color: "#eae6da",
        fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", outline: "none",
    },
    btnSave: {
        padding: "8px 14px", border: "none", borderRadius: 3,
        background: "#c8a44a", color: "#07070a", fontSize: 11, fontWeight: 500,
        fontFamily: "'JetBrains Mono', monospace", cursor: "pointer", letterSpacing: ".04em",
        transition: "opacity .15s, transform .1s",
    },
    btnGhost: {
        padding: "8px 12px", border: "1px solid #2a2a38", borderRadius: 3,
        background: "transparent", color: "#9090aa", fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace", cursor: "pointer",
        transition: "opacity .15s, transform .1s",
    },
    btnReset: {
        padding: "8px 12px", border: "1px solid #e0606050", borderRadius: 3,
        background: "transparent", color: "#e06060", fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace", cursor: "pointer",
        transition: "opacity .15s, transform .1s",
    },
};
