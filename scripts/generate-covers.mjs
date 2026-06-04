/**
 * Ekstrak halaman 1 tiap PDF sebagai JPEG ke /public/yearbook/covers/
 * Jalankan sekali: node scripts/generate-covers.mjs
 * macOS only — pakai sips (built-in, tanpa dependency tambahan)
 */

import { execSync } from "child_process";
import { mkdirSync, existsSync, renameSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT    = join(__dirname, "..");
const PDF_DIR = join(ROOT, "public", "yearbook");
const OUT_DIR = join(ROOT, "public", "yearbook", "covers");

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const PDFS = [
  "RPL-1", "RPL-2",
  "TKJ-1", "TKJ-2",
  "MP-1",  "MP-2",
  "DPB-1", "DPB-2", "DPB-3",
  "AK-1",  "AK-2",  "AK-3",
  "BR-1",  "BR-2",
  "BD-1",  "BD-2",
];

for (const name of PDFS) {
  const pdfPath = join(PDF_DIR, `${name}.pdf`);
  const outPath = join(OUT_DIR, `${name}.jpg`);

  process.stdout.write(`${name}.pdf → `);

  try {
    // sips: PDF halaman pertama → JPEG, resize lebar 520px
    execSync(
      `sips -s format jpeg -s formatOptions 85 -Z 520 "${pdfPath}" --out "${outPath}"`,
      { stdio: "pipe" }
    );
    console.log(`covers/${name}.jpg ✓`);
  } catch (err) {
    console.log(`GAGAL — ${err.stderr?.toString().trim() || err.message}`);
  }
}

console.log("\nSelesai. Cek public/yearbook/covers/");
