/**
 * Generate halaman daftar nama dan merge ke bagian belakang semua PDF kelas.
 * Jalankan sekali: node scripts/add-names-pages.mjs
 * Requires: qpdf (brew install qpdf)
 *
 * PERINGATAN: Jalankan hanya sekali per set PDF. Menjalankan ulang akan
 * menambahkan halaman nama duplikat. Gunakan optimize-pdfs.sh setelah selesai.
 */

import { createCanvas } from 'canvas';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, renameSync, unlinkSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT     = join(__dirname, '..');
const PDF_DIR  = join(ROOT, 'public', 'yearbook');
const CSV_PATH = join(ROOT, 'public', 'Nama_dan_Kelas.csv');

const PAGE_W = 520;
const PAGE_H = 740;

// ── Helpers ───────────────────────────────────────────────────────────────────

function hexAlpha(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function parseCSV(path) {
  const text = readFileSync(path, 'utf-8').replace(/\r/g, '');
  const [header, ...lines] = text.trim().split('\n');
  const keys = header.split(';');
  return lines.map(line => {
    const vals = line.split(';');
    return Object.fromEntries(keys.map((k, i) => [k, vals[i]?.trim() ?? '']));
  });
}

function splitRoundRobin(arr, n) {
  const cols = Array.from({ length: n }, () => []);
  arr.forEach((x, i) => cols[i % n].push(x));
  return cols;
}

// ── Draw names page → PDF buffer ──────────────────────────────────────────────

function drawNamesPage(cls, students) {
  const canvas = createCanvas(PAGE_W, PAGE_H, 'pdf');
  const ctx    = canvas.getContext('2d');
  const hue    = cls.hue;
  const mid    = PAGE_W / 2;

  // Background
  ctx.fillStyle = '#fdfbf7';
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);

  // Outer border frame
  ctx.strokeStyle = hexAlpha(hue, 0.15);
  ctx.lineWidth = 1;
  ctx.strokeRect(18.5, 18.5, PAGE_W - 37, PAGE_H - 37);

  // Corner L-marks
  const CS = 13; // corner arm size
  ctx.strokeStyle = hexAlpha(hue, 0.32);
  ctx.lineWidth = 1.5;
  [
    [12,         12,         1,  1],  // top-left
    [PAGE_W - 12, 12,        -1,  1],  // top-right
    [12,         PAGE_H - 12, 1, -1],  // bottom-left
    [PAGE_W - 12, PAGE_H - 12,-1, -1],  // bottom-right
  ].forEach(([x, y, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x + dx * CS, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * CS);
    ctx.stroke();
  });

  // ── Header ────────────────────────────────────────────────────────────────
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';

  let y = 52;

  // "ANGKATAN 2026"
  ctx.font      = 'bold 10px Helvetica';
  ctx.fillStyle = hue;
  ctx.fillText('ANGKATAN 2026', mid, y);
  y += 22;

  // "XII {name}"
  ctx.font      = 'normal 44px Georgia';
  ctx.fillStyle = '#1a1510';
  ctx.fillText(`XII ${cls.name}`, mid, y);
  y += 52;

  // "SMKN 2 PURWAKARTA"
  ctx.font      = 'normal 9px Helvetica';
  ctx.fillStyle = '#b09878';
  ctx.fillText('SMKN 2 PURWAKARTA', mid, y);
  y += 22;

  // Diamond divider ◆
  ctx.strokeStyle = hexAlpha(hue, 0.2);
  ctx.lineWidth   = 0.8;
  ctx.beginPath(); ctx.moveTo(mid - 54, y + 5); ctx.lineTo(mid - 9, y + 5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(mid + 9,  y + 5); ctx.lineTo(mid + 54, y + 5); ctx.stroke();
  ctx.fillStyle = hexAlpha(hue, 0.6);
  ctx.beginPath();
  ctx.moveTo(mid, y + 1); ctx.lineTo(mid + 4, y + 5);
  ctx.lineTo(mid, y + 9); ctx.lineTo(mid - 4, y + 5);
  ctx.closePath();
  ctx.fill();
  y += 26;

  // ── Names list ────────────────────────────────────────────────────────────
  const numCols = students.length > 28 ? 3 : 2;
  const cols    = splitRoundRobin(students, numCols);
  const PAD     = 46;
  const colW    = (PAGE_W - PAD * 2) / numCols;
  const ROW_H   = 18;
  const NUM_W   = 18;

  cols.forEach((col, ci) => {
    const x0 = PAD + ci * colW;
    col.forEach((student, ri) => {
      const ry   = y + ri * ROW_H;
      const num  = ri * numCols + ci + 1;
      const name = student['Nama Siswa'] || '';

      // Row number
      ctx.font         = 'bold 8px Helvetica';
      ctx.fillStyle    = hexAlpha(hue, 0.45);
      ctx.textAlign    = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(num), x0 + NUM_W, ry + ROW_H / 2);

      // Student name
      ctx.font         = 'normal 11px Georgia';
      ctx.fillStyle    = '#2c241c';
      ctx.textAlign    = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, x0 + NUM_W + 6, ry + ROW_H / 2);

      // Separator
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.lineWidth   = 0.5;
      ctx.beginPath();
      ctx.moveTo(x0, ry + ROW_H - 0.5);
      ctx.lineTo(x0 + colW - 6, ry + ROW_H - 0.5);
      ctx.stroke();
    });
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  const fy = PAGE_H - 30;

  ctx.strokeStyle = hexAlpha(hue, 0.12);
  ctx.lineWidth   = 0.5;
  ctx.beginPath(); ctx.moveTo(mid - 68, fy); ctx.lineTo(mid - 11, fy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(mid + 11, fy); ctx.lineTo(mid + 68, fy); ctx.stroke();

  ctx.font         = 'bold 8px Helvetica';
  ctx.fillStyle    = '#c0a88a';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${students.length} SISWA`, mid, fy);

  return canvas.toBuffer('application/pdf');
}

// ── Main ──────────────────────────────────────────────────────────────────────

const { CLASSES } = await import('../src/data/classes.js');
const allRows     = parseCSV(CSV_PATH);

// Optional: filter by PDF base names passed as CLI args, e.g.:
//   node scripts/add-names-pages.mjs MP-2 AK-1 BD-1
const filter = process.argv.slice(2);
const targets = filter.length
  ? CLASSES.filter(c => filter.some(arg => c.pdf.includes(arg)))
  : CLASSES;

console.log(`\nYearbook — Memasukkan halaman nama ke ${targets.length} kelas PDF...\n`);

let ok = 0, skipped = 0, failed = 0;

for (const cls of targets) {
  const pdfBase = cls.pdf.replace('/yearbook/', '').replace('.pdf', '');
  const pdfPath = join(PDF_DIR, `${pdfBase}.pdf`);

  process.stdout.write(`  ${cls.name.padEnd(8)} `);

  if (!existsSync(pdfPath)) {
    console.log(`SKIP — PDF tidak ditemukan`);
    skipped++;
    continue;
  }

  const students = allRows
    .filter(r => r['Kelas']?.includes(cls.name))
    .sort((a, b) => a['Nama Siswa'].localeCompare(b['Nama Siswa']));

  if (students.length === 0) {
    console.log(`SKIP — Tidak ada siswa di CSV`);
    skipped++;
    continue;
  }

  const tempPath  = join(os.tmpdir(), `${pdfBase}-names-${Date.now()}.pdf`);
  const mergePath = join(PDF_DIR, `${pdfBase}-merged-tmp.pdf`);

  try {
    writeFileSync(tempPath, drawNamesPage(cls, students));

    execSync(
      `qpdf --empty --pages "${pdfPath}" "${tempPath}" -- "${mergePath}"`,
      { stdio: 'pipe' }
    );

    renameSync(mergePath, pdfPath);
    unlinkSync(tempPath);

    console.log(`✓  (${students.length} siswa)`);
    ok++;
  } catch (err) {
    console.log(`GAGAL — ${err.stderr?.toString().trim() || err.message}`);
    if (existsSync(tempPath))  unlinkSync(tempPath);
    if (existsSync(mergePath)) unlinkSync(mergePath);
    failed++;
  }
}

console.log(`\n${ok} berhasil · ${skipped} dilewati · ${failed} gagal`);
if (ok > 0) {
  console.log('\nJalankan scripts/optimize-pdfs.sh untuk update versi -optimized.pdf\n');
}
