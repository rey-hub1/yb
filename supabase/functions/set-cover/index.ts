import { createClient } from "jsr:@supabase/supabase-js@2";

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

type CoverItem = { box_id?: string; file_id?: string };

Deno.serve(async (req) => {
  const cors = makeCors(req);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: cors });

  const token = req.headers.get("x-admin-token") ?? "";
  const expected = (Deno.env.get("ADMIN_TOKEN") ?? "").trim();
  if (!expected || !safeEqual(token, expected)) return json({ error: "Unauthorized" }, 401, cors);

  let payload: {
    verify?: boolean;
    items?: CoverItem[];
    box_id?: string;
    file_id?: string;
    action?: string;
  };
  try { payload = await req.json(); }
  catch { return json({ error: "Invalid JSON." }, 400, cors); }

  if (payload.verify) return json({ ok: true }, 200, cors);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // hapus satu cover → balik ke foto acak
  if (payload.action === "delete") {
    if (!payload.box_id) return json({ error: "box_id wajib." }, 400, cors);
    const { error } = await supabase.from("doc_covers").delete().eq("box_id", payload.box_id);
    if (error) return json({ error: "Gagal menghapus." }, 500, cors);
    return json({ ok: true, box_id: payload.box_id }, 200, cors);
  }

  // upsert batch (tombol Push) atau satu cover
  const rawItems = payload.items ?? [{ box_id: payload.box_id, file_id: payload.file_id }];
  const items = rawItems
    .filter((it): it is { box_id: string; file_id: string } =>
      typeof it?.box_id === "string" && !!it.box_id &&
      typeof it?.file_id === "string" && !!it.file_id)
    .map((it) => ({ box_id: it.box_id, file_id: it.file_id, updated_at: new Date().toISOString() }));

  if (!items.length) return json({ error: "Tidak ada cover valid." }, 400, cors);

  const { error } = await supabase
    .from("doc_covers")
    .upsert(items, { onConflict: "box_id" });
  if (error) return json({ error: "Gagal menyimpan." }, 500, cors);
  return json({ ok: true, count: items.length }, 200, cors);
});
