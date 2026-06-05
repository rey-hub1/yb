import { createClient } from "jsr:@supabase/supabase-js@2";

const MAX_LEN = 80;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-token",
};

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: CORS });

  const token = req.headers.get("x-admin-token") ?? "";
  const expected = (Deno.env.get("ADMIN_TOKEN") ?? "").trim();
  if (!expected || !safeEqual(token, expected)) return json({ error: "Unauthorized" }, 401);

  let payload: { id?: string; body?: string; action?: string; verify?: boolean };
  try { payload = await req.json(); }
  catch { return json({ error: "Invalid JSON." }, 400); }

  // mode verify: cek token valid saja
  if (payload.verify) return json({ ok: true });

  if (!payload.id) return json({ error: "id wajib." }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // mode edit
  if (payload.action === "edit") {
    const text = (payload.body ?? "").trim();
    if (!text) return json({ error: "Pesan kosong." }, 400);
    if (text.length > MAX_LEN) return json({ error: `Maksimal ${MAX_LEN} karakter.` }, 400);

    const { data, error } = await supabase
      .from("messages")
      .update({ body: text })
      .eq("id", payload.id)
      .select()
      .single();

    if (error) return json({ error: "Gagal mengubah." }, 500);
    return json({ ok: true, data });
  }

  // mode delete (default)
  const { error } = await supabase.from("messages").delete().eq("id", payload.id);
  if (error) return json({ error: "Gagal menghapus." }, 500);
  return json({ ok: true, id: payload.id });
});
