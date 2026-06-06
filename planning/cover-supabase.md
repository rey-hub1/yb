# Plan: Cover Dokumentasi Global via Supabase (+ tombol Push)

## Context
Sekarang cover kotak Dokumentasi disimpan di **localStorage** (`yb-doc-covers`) → cuma kelihatan di
browser admin, pengunjung lain tetap lihat foto acak. Tujuan: cover yang di-set admin **tampil ke
semua pengunjung & semua device**.

Mekanisme: admin atur cover (preview render lokal seperti sekarang), lalu pencet tombol
**"Push ke Supabase"** → tersimpan di DB. Frontend baca cover dari Supabase saat halaman dibuka.

Alur data:
```
admin edit (state + draft localStorage)  →  [Push ke Supabase]  →  edge function set-cover (x-admin-token)
                                                                         ↓ upsert
                                                                   tabel doc_covers
frontend (Documentation) load  →  supabase.select(doc_covers)  →  cover global tampil ke semua
```

---

## 1. Database — tabel `doc_covers`
Migration baru: `supabase/migrations/<ts>_doc_covers.sql`
```sql
create table if not exists public.doc_covers (
  box_id     text primary key,        -- ID subfolder Drive (= box.id di documentation.js)
  file_id    text not null,           -- ID file gambar Drive (cover terpilih)
  updated_at timestamptz default now()
);

alter table public.doc_covers enable row level security;

-- baca: publik (anon/publishable key) boleh SELECT
create policy "doc_covers public read"
  on public.doc_covers for select
  using (true);

-- tulis: TIDAK ada policy untuk anon → semua write lewat edge function (service role)
```
Read pakai supabase client biasa (publishable key, sama seperti `messages`). Write diblok RLS →
hanya edge function (service role) yang bisa upsert/delete.

---

## 2. Edge function — `set-cover`
Folder baru: `supabase/functions/set-cover/index.ts`. Pola **sama persis** seperti
`supabase/functions/delete-message/index.ts` (auth `x-admin-token` + constant-time compare ke
`ADMIN_TOKEN`, client service role).

Payload:
- `{ verify: true }` → cek token (opsional, buat reuse).
- `{ items: [{ box_id, file_id }, ...] }` → **upsert batch** (dipakai tombol Push).
- `{ box_id, file_id }` → upsert satu.
- `{ box_id, action: "delete" }` → hapus satu (reset cover → balik acak).

Inti:
```ts
// auth: header x-admin-token === Deno.env.get("ADMIN_TOKEN") (timing-safe)
// service client: createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
if (action === "delete") await sb.from("doc_covers").delete().eq("box_id", box_id);
else await sb.from("doc_covers").upsert(items ?? [{ box_id, file_id }]); // onConflict box_id
```
- `config.toml`: tambah `[functions.set-cover] verify_jwt = false` (pakai x-admin-token sendiri,
  konsisten dgn fix verify_jwt sebelumnya).
- Reuse `ADMIN_TOKEN` + `SUPABASE_SERVICE_ROLE_KEY` yang sudah ada di env edge function. Tidak ada
  secret baru.

---

## 3. supabase lib — `src/lib/supabase.js`
Tambah export URL edge function baru:
```js
export const SET_COVER_URL = url ? `${url}/functions/v1/set-cover` : null;
```

## 4. adminShared — helper push
`src/lib/adminShared.js`: tambah `callSetCover(token, payload)` (mirip `callAdmin` tapi ke
`SET_COVER_URL`). Reuse pola fetch + `x-admin-token`.

---

## 5. Frontend render — `src/components/YearbookFlipbook.jsx`
`Documentation` sekarang baca override dari localStorage saja. Ubah jadi **baca dari Supabase**:
- Tambah `useEffect` fetch sekali: `supabase.from("doc_covers").select("box_id, file_id")` →
  bikin map `{ box_id: file_id }` → simpan ke state `overrides`.
- Fallback: kalau supabase null / gagal → pakai localStorage (biar tetap jalan offline/preview).
- `DocCover` tetap sama (`override` → `driveThumb(id)` + `referrerPolicy="no-referrer"`). Pool acak
  tetap dari `box.covers` kalau tidak ada override.

Catatan: fetch cover ringan (≤24 baris), tidak ganggu splash.

---

## 6. Admin PDD — `src/components/AdminPDD.jsx`
- **Load awal**: ambil cover dari Supabase (bukan cuma localStorage). Tampilkan sebagai nilai
  tersimpan. Simpan juga ke localStorage sebagai cache/draft.
- **Edit lokal**: set/Reset cover update state + draft localStorage (preview render instan, seperti
  sekarang). Tandai baris yang **belum di-push** (badge "draft / belum di-push").
- **Tombol Push** (global, di header panel): "Push ke Supabase" → kirim semua entri ke edge function
  `set-cover` (`{ items: [...] }`) + kirim delete untuk yang di-reset. Tampilkan status
  (mengirim… / berhasil / gagal X). Setelah sukses → tandai semua "tersimpan di server".
- Token diambil dari prop (`AdminHub` sudah passing `token`). AdminPDD perlu terima `token` prop
  (sudah dilewatkan dari hub, tinggal dipakai).

State per baris: `server` (nilai di DB) vs `local` (nilai draft) → dirty kalau beda → enable Push.

---

## Langkah eksekusi
1. Tulis migration `doc_covers.sql` → `supabase db push` (atau jalankan SQL di dashboard).
2. Buat `supabase/functions/set-cover/index.ts` (copy pola delete-message) + update `config.toml`.
3. `supabase functions deploy set-cover`.
4. Tambah `SET_COVER_URL` di `supabase.js`, `callSetCover` di `adminShared.js`.
5. Update `Documentation` (fetch dari Supabase + fallback localStorage).
6. Update `AdminPDD` (load server, badge dirty, tombol Push).
7. `npm run build` + tes.

## Verifikasi
1. Admin → tab Cover PDD → set cover 1 kotak → badge "draft" → **Push ke Supabase** → status berhasil.
2. Cek tabel `doc_covers` di dashboard ada barisnya.
3. Buka situs di **browser/HP lain** (incognito) → kotak pakai cover itu (global). 
4. Reset 1 cover → Push → kotak balik foto acak di semua device.
5. Matikan/again offline supabase → frontend fallback ke localStorage/acak tanpa crash.

## Risiko / catatan
- File Drive tetap harus **public** + img `referrerPolicy="no-referrer"` (lihat
  [[drive-thumbnail-referrer]]).
- Edge function `set-cover` harus `verify_jwt=false` + dilindungi `x-admin-token` (lihat pola
  delete-message; sama isu seperti [[vercel-deploy-pitfalls]]).
- Tidak ada secret baru — reuse ADMIN_TOKEN + SERVICE_ROLE_KEY.
- localStorage tetap dipakai sebagai draft + fallback, bukan dibuang.
```
