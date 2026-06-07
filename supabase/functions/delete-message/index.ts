import { createClient } from "jsr:@supabase/supabase-js@2";

const MAX_LEN = 80;

function makeCors(req: Request) {
  // Batasi origin ke domain production jika ALLOWED_ORIGIN di-set,
  // fallback * hanya untuk dev (tanpa env var)
  const allowed = Deno.env.get("ALLOWED_ORIGIN") ?? "*";
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigin = allowed === "*" ? "*" : (origin === allowed ? origin : allowed);
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-admin-token",
    "Vary": "Origin",
  };
}

// Constant-time comparison — tidak short-circuit pada panjang berbeda
// sehingga attacker tidak bisa enumerate panjang token via timing
function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  const maxLen = Math.max(ab.length, bb.length);
  let diff = ab.length ^ bb.length;
  for (let i = 0; i < maxLen; i++) {
    diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return diff === 0;
}

function json(data: unknown, status = 200, cors: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

// Throttle brute-force token: maks 5 gagal / IP / 60s, lalu lockout 60s.
// DB-backed (tabel admin_throttle) — Supabase nyebar request ke isolate berbeda
// jadi Map in-memory tidak ke-share; state harus di DB biar lockout beneran jalan.
const MAX_FAILS = 5;
const WINDOW_MS = 60_000;

// IP client = entry PERTAMA x-forwarded-for. Di infra Supabase, entry terakhir
// adalah edge CloudFront yang rotasi tiap request (bukan client) — keying ke situ
// bikin throttle tak pernah numpuk. x-real-ip null di sini, jadi pakai XFF[0].
function clientIp(req: Request): string {
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const xff = (req.headers.get("x-forwarded-for") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return xff.length ? xff[0] : "unknown";
}

// deno-lint-ignore no-explicit-any
async function isThrottled(sb: any, ip: string): Promise<boolean> {
  const { data } = await sb.from("admin_throttle").select("fails, until").eq("ip", ip).maybeSingle();
  return !!data && new Date(data.until).getTime() > Date.now() && data.fails >= MAX_FAILS;
}
// deno-lint-ignore no-explicit-any
async function recordFail(sb: any, ip: string) {
  const now = Date.now();
  const { data } = await sb.from("admin_throttle").select("fails, until").eq("ip", ip).maybeSingle();
  const expired = !data || new Date(data.until).getTime() < now;
  const fails = expired ? 1 : data.fails + 1;
  await sb.from("admin_throttle").upsert({ ip, fails, until: new Date(now + WINDOW_MS).toISOString() });
}

Deno.serve(async (req) => {
  const cors = makeCors(req);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: cors });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const ip = clientIp(req);
  if (await isThrottled(supabase, ip)) {
    return json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, 429, cors);
  }

  const token = req.headers.get("x-admin-token") ?? "";
  const expected = (Deno.env.get("ADMIN_TOKEN") ?? "").trim();
  if (!expected || !safeEqual(token, expected)) {
    await recordFail(supabase, ip);
    return json({ error: "Unauthorized" }, 401, cors);
  }
  await supabase.from("admin_throttle").delete().eq("ip", ip);

  let payload: { id?: string; body?: string; action?: string; verify?: boolean };
  try { payload = await req.json(); }
  catch { return json({ error: "Invalid JSON." }, 400, cors); }

  if (payload.verify) return json({ ok: true }, 200, cors);

  if (!payload.id) return json({ error: "id wajib." }, 400, cors);

  if (payload.action === "edit") {
    const text = (payload.body ?? "").trim();
    if (!text) return json({ error: "Pesan kosong." }, 400, cors);
    if (text.length > MAX_LEN) return json({ error: `Maksimal ${MAX_LEN} karakter.` }, 400, cors);

    const { data, error } = await supabase
      .from("messages")
      .update({ body: text })
      .eq("id", payload.id)
      .select("id, name, body, color, created_at")
      .single();

    if (error) return json({ error: "Gagal mengubah." }, 500, cors);
    return json({ ok: true, data }, 200, cors);
  }

  const { error } = await supabase.from("messages").delete().eq("id", payload.id);
  if (error) return json({ error: "Gagal menghapus." }, 500, cors);
  return json({ ok: true, id: payload.id }, 200, cors);
});
