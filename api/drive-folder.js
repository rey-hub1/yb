// Proxy + parser Google Drive embeddedfolderview.
//
// Google nge-block iframe embeddedfolderview di domain produksi (deteksi framing
// by origin → halaman "This content is blocked"). Tapi di sisi SERVER (tanpa
// sinyal iframe) Google tetap balikin grid HTML normal. Function ini fetch HTML
// itu, parse ID + nama file, balikin JSON. Frontend render galeri sendiri pakai
// thumbnail lh3 (img referrerPolicy=no-referrer) — tidak gantung embed Google.
//
// Vercel serverless (Node). Zero dependency (pakai global fetch Node 18+).

export default async function handler(req, res) {
  const id = String(req.query?.id || "").trim();
  // ID folder Drive = 25+ char alfanumerik/-/_; validasi cegah SSRF ke URL lain
  if (!/^[-\w]{10,}$/.test(id)) {
    res.status(400).json({ error: "id folder tidak valid" });
    return;
  }

  try {
    const r = await fetch(
      `https://drive.google.com/embeddedfolderview?id=${id}#grid`,
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; yb-bot/1.0)" } },
    );
    if (!r.ok) {
      res.status(502).json({ error: "Gagal mengambil folder dari Drive" });
      return;
    }
    const html = await r.text();

    // Tiap file = <div ... id="entry-<FILE_ID>" ...> dengan judul di .flip-entry-title.
    // Lazy match dari id ke flip-entry-title terdekat → pasangan id+nama.
    const files = [];
    const seen = new Set();
    const re = /id="entry-([-\w]+)"[\s\S]*?flip-entry-title">([^<]*)/g;
    let m;
    while ((m = re.exec(html))) {
      const fid = m[1];
      if (seen.has(fid)) continue;
      seen.add(fid);
      files.push({ id: fid, name: (m[2] || "").trim() });
    }

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
