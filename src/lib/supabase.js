import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
// key publik client: penamaan baru `PUBLISHABLE_KEY` (sb_publishable_...),
// fallback ke `ANON_KEY` lama. Public-safe, diproteksi RLS.
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

// null kalau env belum diisi → komponen tampilkan pesan setup, bukan crash
export const supabase = url && key ? createClient(url, key) : null;
export const SUPABASE_ANON_KEY = key ?? null;

// URL edge function untuk post-message (server-side rate limiting)
export const POST_MESSAGE_URL = url
  ? `${url}/functions/v1/post-message`
  : null;
