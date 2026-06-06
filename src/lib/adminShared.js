// Shared admin primitives dipakai AdminHub, AdminNotes, AdminPDD.
// Token diverifikasi server-side lewat edge function delete-message (x-admin-token).
import { DELETE_MESSAGE_URL } from "./supabase";

export const TOKEN_KEY = "yb-admin-token";

export async function callAdmin(token, payload) {
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

// ── FONTS (dipakai semua panel admin) ────────────────────────────────────────
export const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
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
