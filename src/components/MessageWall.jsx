import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

const MAX_LEN = 500;
const COOLDOWN_MS = 30_000;
const LAST_KEY = "yb-kenangan-last";
const TONES = 6; // jumlah varian warna kertas (yb-note--t0..t5)

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
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// hash stabil dari id → varian warna/rotasi/selotip (konsisten antar render)
function noteVariant(id = "") {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return {
    tone: h % TONES,
    rot: ((h >> 3) % 7) - 3,        // -3..3 deg
    tapeRot: ((h >> 6) % 13) - 6,   // -6..6 deg
  };
}

export default function MessageWall() {
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
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

  // load awal
  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let alive = true;
    (async () => {
      const { data, error: err } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!alive) return;
      if (err) setError("Gagal memuat pesan.");
      else addMessages(data || []);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [addMessages]);

  // realtime: pesan baru dari orang lain langsung muncul
  useEffect(() => {
    if (!supabase) return;
    const ch = supabase
      .channel("messages-insert")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" },
        (payload) => addMessages([payload.new], true))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [addMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const text = body.trim();
    if (!text) return;
    if (text.length > MAX_LEN) { setError(`Maksimal ${MAX_LEN} karakter.`); return; }

    const last = Number(localStorage.getItem(LAST_KEY) || 0);
    const wait = COOLDOWN_MS - (Date.now() - last);
    if (wait > 0) {
      setError(`Tunggu ${Math.ceil(wait / 1000)} detik sebelum nempel lagi.`);
      return;
    }
    if (!supabase) { setError("Fitur belum dikonfigurasi (env Supabase kosong)."); return; }

    setSending(true);
    const { data, error: err } = await supabase
      .from("messages")
      .insert({ name: name.trim() || null, body: text })
      .select()
      .single();
    setSending(false);

    if (err) { setError("Gagal menempel. Coba lagi."); return; }
    localStorage.setItem(LAST_KEY, String(Date.now()));
    if (data) addMessages([data], true);
    setBody("");
  };

  return (
    <section id="kenangan" className="yb-kenangan">
      <div className="yb-kenangan-head">
        <span className="yb-kenangan-kicker">tempel kenanganmu</span>
        <h2 className="yb-kenangan-title">Kotak Kenangan</h2>
        <p className="yb-kenangan-sub">
          Tulis di kertas, tempel di papan. Pesan, harapan, atau salam perpisahan — boleh anonim.
        </p>
      </div>

      {/* notepad bergaris tempat nulis */}
      <form className="yb-notepad" onSubmit={handleSubmit}>
        <div className="yb-notepad-rings" aria-hidden="true">
          <span /><span /><span /><span /><span /><span />
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
              maxLength={60}
            />
          </div>
          <div className="yb-notepad-foot">
            <span className="yb-notepad-count">{body.length}/{MAX_LEN}</span>
            <button className="yb-notepad-btn" type="submit" disabled={sending || !body.trim()}>
              {sending ? "menempel…" : "Tempel ✎"}
            </button>
          </div>
          {error && <p className="yb-notepad-error">{error}</p>}
        </div>
      </form>

      {/* papan tempel */}
      <div className="yb-board">
        {loading && <p className="yb-board-empty">Memuat papan…</p>}
        {!loading && messages.length === 0 && (
          <p className="yb-board-empty">Papan masih kosong. Jadi note pertama ✦</p>
        )}
        {messages.map((m) => {
          const v = noteVariant(m.id);
          return (
            <article
              key={m.id}
              className={`yb-note yb-note--t${v.tone}`}
              style={{ "--rot": `${v.rot}deg`, "--tape-rot": `${v.tapeRot}deg` }}
            >
              <span className="yb-note-tape" aria-hidden="true" />
              <p className="yb-note-body">{m.body}</p>
              <div className="yb-note-meta">
                <span className="yb-note-from">{m.name?.trim() || "Anonim"}</span>
                <span className="yb-note-time">{timeAgo(m.created_at)}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
