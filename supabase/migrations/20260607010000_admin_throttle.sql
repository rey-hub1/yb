-- Throttle brute-force token admin, durable (lintas isolate edge function).
-- In-memory Map tidak jalan: Supabase nyebar request ke isolate berbeda, state
-- tidak ke-share. Tabel ini diakses HANYA service role (edge function) — RLS on,
-- tanpa policy → anon/authenticated ditolak total.
create table if not exists public.admin_throttle (
  ip      text primary key,
  fails   integer     not null default 0,
  "until" timestamptz not null default now()
);

alter table public.admin_throttle enable row level security;
-- tanpa policy apa pun → cuma service role yang bisa baca/tulis
revoke all on public.admin_throttle from anon, authenticated;
