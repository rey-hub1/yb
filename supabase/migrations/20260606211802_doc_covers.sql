-- Cover Dokumentasi global. box_id = ID subfolder Drive (box.id di documentation.js),
-- file_id = ID file gambar Drive (cover terpilih). Baca publik, tulis hanya via
-- edge function set-cover (service role) — tidak ada policy write untuk anon.
create table if not exists public.doc_covers (
  box_id     text primary key,        -- ID subfolder Drive (= box.id di documentation.js)
  file_id    text not null,           -- ID file gambar Drive (cover terpilih)
  updated_at timestamptz default now()
);

alter table public.doc_covers enable row level security;

-- baca: publik (anon/publishable key) boleh SELECT
drop policy if exists "doc_covers public read" on public.doc_covers;
create policy "doc_covers public read"
  on public.doc_covers for select
  using (true);

-- tulis: TIDAK ada policy untuk anon → semua write lewat edge function (service role)
