import { createClient } from "jsr:@supabase/supabase-js@2";

const COOLDOWN_MS = 30_000;
const MAX_LEN = 80;
const MAX_NAME = 18;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hashIp(ip: string, salt: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(ip + salt),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function jsonErr(msg: string, status: number) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: CORS });

  // IP_SALT wajib — tanpanya ip_hash bisa di-rainbow-table dengan salt default publik
  const ipSalt = Deno.env.get("IP_SALT");
  if (!ipSalt) return jsonErr("Server misconfigured.", 500);

  // Ambil IP terakhir di x-forwarded-for — proxy Supabase menambah IP real di akhir.
  // IP pertama bisa dipalsukan client untuk bypass cooldown.
  const xffHeader = req.headers.get("x-forwarded-for") ?? "";
  const xffIps = xffHeader.split(",").map((s) => s.trim()).filter(Boolean);
  const rawIp = xffIps.length > 0 ? xffIps[xffIps.length - 1] : "unknown";
  const ipHash = await hashIp(rawIp, ipSalt);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let payload: { name?: unknown; body?: unknown; color?: unknown };
  try {
    payload = await req.json();
  } catch {
    return jsonErr("Invalid JSON.", 400);
  }

  // --- validasi body ---
  const text = (typeof payload.body === "string" ? payload.body : "").trim();
  if (!text) return jsonErr("Pesan kosong.", 400);
  if (text.length > MAX_LEN) return jsonErr(`Maksimal ${MAX_LEN} karakter.`, 400);

  // --- validasi name ---
  const rawName = typeof payload.name === "string" ? payload.name.trim() : null;
  if (rawName && rawName.length > MAX_NAME) return jsonErr(`Nama maksimal ${MAX_NAME} karakter.`, 400);

  // --- validasi color (0–5, integer) ---
  const color = typeof payload.color === "number" && Number.isInteger(payload.color)
    ? payload.color
    : 0;
  if (color < 0 || color > 5) return jsonErr("Warna tidak valid.", 400);

  // --- cek cooldown server-side ---
  const since = new Date(Date.now() - COOLDOWN_MS).toISOString();
  const { count, error: countErr } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);

  if (countErr) return jsonErr("Server error.", 500);
  if ((count ?? 0) > 0) return jsonErr("Tunggu 30 detik sebelum nempel lagi.", 429);

  // --- insert ---
  const { data, error: insertErr } = await supabase
    .from("messages")
    .insert({
      name: rawName || null,
      body: text,
      color,
      ip_hash: ipHash,
    })
    .select("id, name, body, color, created_at")
    .single();

  if (insertErr) return jsonErr("Gagal menempel.", 500);

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
