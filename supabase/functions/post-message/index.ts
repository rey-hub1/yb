import { createClient } from "jsr:@supabase/supabase-js@2";

const COOLDOWN_MS = 30_000;
const MAX_LEN = 80;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hashIp(ip: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(ip + (Deno.env.get("IP_SALT") ?? "yb-salt")),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  // preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: CORS });
  }

  // ambil IP dari header (Supabase Edge meneruskan x-forwarded-for)
  const rawIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = await hashIp(rawIp);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, // service role agar bisa bypass RLS
  );

  // parse body
  let payload: { name?: string; body?: string; color?: number };
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON." }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const text = (payload.body ?? "").trim();
  if (!text) {
    return new Response(JSON.stringify({ error: "Pesan kosong." }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
  if (text.length > MAX_LEN) {
    return new Response(
      JSON.stringify({ error: `Maksimal ${MAX_LEN} karakter.` }),
      { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }

  // --- cek cooldown server-side ---
  const since = new Date(Date.now() - COOLDOWN_MS).toISOString();
  const { count, error: countErr } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);

  if (countErr) {
    return new Response(JSON.stringify({ error: "Server error." }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  if ((count ?? 0) > 0) {
    return new Response(
      JSON.stringify({ error: "Tunggu 30 detik sebelum nempel lagi." }),
      { status: 429, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }

  // --- insert ---
  const { data, error: insertErr } = await supabase
    .from("messages")
    .insert({
      name: payload.name?.trim() || null,
      body: text,
      color: payload.color ?? 0,
      ip_hash: ipHash,
    })
    .select()
    .single();

  if (insertErr) {
    return new Response(JSON.stringify({ error: "Gagal menempel." }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
