-- RLS tabel messages (Sticky Memory).
--
-- Tabel dibuat lewat dashboard, tapi RLS-nya HARUS di-version-control: tanpa ini
-- publishable key di bundle client bisa dipakai insert/update/delete langsung ke
-- tabel — bypass total edge function post-message (cooldown, cap panjang, ip_hash).
--
-- Aturan: anon hanya boleh SELECT kolom aman. Semua tulis lewat edge function
-- (service role, bypass RLS). ip_hash TIDAK boleh terbaca client.

alter table public.messages enable row level security;

-- baca: publik boleh SELECT (policy row-level)
drop policy if exists "messages public read" on public.messages;
create policy "messages public read"
  on public.messages for select
  using (true);

-- tulis: TIDAK ada policy untuk anon → insert/update/delete diblokir.
-- Bersihkan policy write lama kalau pernah dibuat manual di dashboard.
drop policy if exists "messages public insert" on public.messages;
drop policy if exists "messages anon insert" on public.messages;
drop policy if exists "Enable insert for all users" on public.messages;

-- Sembunyikan ip_hash dari client: cabut SELECT tabel-penuh, kasih per-kolom aman.
-- (column-grant cuma berlaku kalau grant tabel-penuh dicabut dulu)
revoke select on public.messages from anon, authenticated;
grant  select (id, name, body, color, created_at) on public.messages to anon, authenticated;

-- pastikan anon tidak punya hak tulis di level grant (RLS + grant dua-duanya)
revoke insert, update, delete on public.messages from anon, authenticated;
