// Proxy + parser Google Drive embeddedfolderview.
//
// Google nge-block iframe embeddedfolderview di domain produksi (deteksi framing
// by origin → halaman "This content is blocked"). Tapi di sisi SERVER (tanpa
// sinyal iframe) Google tetap balikin grid HTML normal. Function ini fetch HTML
// itu, parse ID + nama file, balikin JSON. Frontend render galeri sendiri pakai
// thumbnail lh3 (img referrerPolicy=no-referrer) — tidak gantung embed Google.
//
// Vercel serverless (Node). Zero dependency (pakai global fetch Node 18+).
// `fetchFolderFiles` di-reuse oleh dev middleware Vite (lihat vite.config.js)
// supaya galeri juga jalan di `npm run dev` (Vite tidak menjalankan /api).

// ID folder Drive = 10+ char alfanumerik/-/_; validasi cegah SSRF ke URL lain
export const FOLDER_ID_RE = /^[-\w]{10,}$/;

// decode entity HTML umum di nama file (&amp; &lt; &gt; &quot; &#39;)
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export async function fetchFolderFiles(id) {
  const r = await fetch(
    `https://drive.google.com/embeddedfolderview?id=${id}#grid`,
    { headers: { "User-Agent": "Mozilla/5.0 (compatible; yb-bot/1.0)" } },
  );
  if (!r.ok) throw new Error(`Drive responded ${r.status}`);
  const html = await r.text();

  // Tiap entry = <div ... id="entry-<ID>"> ... <div ...flip-entry-title">NAMA.
  // Antara id & title ada penanda tipe:
  //   - folder: class "drive-sprite-folder…" / href "/drive/folders/" (TANPA /type/)
  //   - file:   ikon mime ".../type/<image|video|…>/…"
  const files = [];
  const seen = new Set();
  const re = /id="entry-([-\w]+)"([\s\S]*?)flip-entry-title">([^<]*)/g;
  let m;
  while ((m = re.exec(html))) {
    const fid = m[1];
    if (seen.has(fid)) continue;
    seen.add(fid);
    const meta = m[2];
    let kind;
    if (/drive-sprite-folder|aria-label="Folder"|\/drive\/folders\//.test(meta)) kind = "folder";
    else if (/\/type\/video\//.test(meta)) kind = "video";
    else if (/\/type\/image\//.test(meta)) kind = "image";
    else kind = "other";
    files.push({ id: fid, name: decodeEntities((m[3] || "").trim()), kind });
  }
  return files;
}

export default async function handler(req, res) {
  const id = String(req.query?.id || "").trim();
  if (!FOLDER_ID_RE.test(id)) {
    res.status(400).json({ error: "id folder tidak valid" });
    return;
  }
  try {
    const files = await fetchFolderFiles(id);
    // cache di edge Vercel 1 jam, stale 1 hari → hemat hit ke Google
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400",
    );
    res.status(200).json({ files });
  } catch {
    res.status(502).json({ error: "Gagal mengambil folder dari Drive" });
  }
}
