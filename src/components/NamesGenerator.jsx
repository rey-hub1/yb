import React, { useState, useEffect, useRef, useMemo } from 'react';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { zipSync } from 'fflate';
import { CLASSES } from '../data/classes';

const PAGE_W = 520;
const PAGE_H = 740;
const SCALE = 0.62;

function splitByRoundRobin(array, numCols) {
  const cols = Array.from({ length: numCols }, () => []);
  array.forEach((item, i) => cols[i % numCols].push(item));
  return cols;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function NamesGenerator() {
  const [data, setData] = useState([]);
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const previewRef = useRef(null);

  useEffect(() => {
    fetch('/Nama_dan_Kelas.csv')
      .then(res => {
        if (!res.ok) throw new Error('CSV not found');
        return res.text();
      })
      .then(csv => {
        Papa.parse(csv, {
          header: true,
          delimiter: ';',
          skipEmptyLines: true,
          complete: ({ data: rows }) => setData(rows),
        });
      })
      .catch(console.error);
  }, []);

  const studentCounts = useMemo(() => {
    const map = {};
    CLASSES.forEach(cls => {
      map[cls.id] = data.filter(r => r.Kelas?.includes(cls.name)).length;
    });
    return map;
  }, [data]);

  const studentsInClass = useMemo(() =>
    data
      .filter(r => r.Kelas?.includes(selectedClass.name))
      .sort((a, b) => a['Nama Siswa'].localeCompare(b['Nama Siswa'])),
    [data, selectedClass]
  );

  const numCols = studentsInClass.length > 28 ? 3 : 2;
  const studentCols = useMemo(
    () => splitByRoundRobin(studentsInClass, numCols),
    [studentsInClass, numCols]
  );

  // Render a class's names page → PDF bytes (Uint8Array)
  const renderClassToPdfBytes = async (cls) => {
    setSelectedClass(cls);
    await new Promise(r => setTimeout(r, 50));
    await document.fonts.ready;
    await new Promise(r => setTimeout(r, 150));
    if (!previewRef.current) return null;

    const canvas = await html2canvas(previewRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#fdfbf7',
      logging: false,
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [PAGE_W, PAGE_H] });
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, PAGE_W, PAGE_H);
    return new Uint8Array(pdf.output('arraybuffer'));
  };

  const fileName = (cls) => `${cls.name.replace(/\s+/g, '-')}-names.pdf`;

  const generateSinglePDF = async (cls) => {
    setIsGenerating(true);
    try {
      const bytes = await renderClassToPdfBytes(cls);
      if (bytes) downloadBlob(new Blob([bytes], { type: 'application/pdf' }), fileName(cls));
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate all classes → bundle into one ZIP → single download
  const generateAll = async () => {
    setIsGenerating(true);
    const files = {};
    try {
      for (let i = 0; i < CLASSES.length; i++) {
        setProgress({ current: i + 1, total: CLASSES.length });
        const bytes = await renderClassToPdfBytes(CLASSES[i]);
        if (bytes) files[fileName(CLASSES[i])] = bytes;
      }
      const zipped = zipSync(files, { level: 0 }); // PDFs already compressed; level 0 = fast
      downloadBlob(new Blob([zipped], { type: 'application/zip' }), 'daftar-nama-semua-kelas.zip');
    } finally {
      setIsGenerating(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const hue = selectedClass.hue;
  const previewW = Math.round(PAGE_W * SCALE);
  const previewH = Math.round(PAGE_H * SCALE);

  // Page inner content — rendered twice: off-screen capture target + scaled visual preview
  const pageInner = (
    <>
      {/* Outer border frame */}
      <div style={{
        position: 'absolute', top: 18, left: 18, right: 18, bottom: 18,
        border: `1px solid ${hue}28`, pointerEvents: 'none',
      }} />

      {/* Corner L-marks */}
      {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([h, v], i) => (
        <span key={i} style={{
          position: 'absolute',
          ...(v ? { bottom: 12 } : { top: 12 }),
          ...(h ? { right: 12 } : { left: 12 }),
          display: 'block', width: 12, height: 12,
          borderTop:    !v ? `1.5px solid ${hue}50` : 'none',
          borderBottom:  v ? `1.5px solid ${hue}50` : 'none',
          borderLeft:   !h ? `1.5px solid ${hue}50` : 'none',
          borderRight:   h ? `1.5px solid ${hue}50` : 'none',
          pointerEvents: 'none',
        }} />
      ))}

      {/* Page header */}
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <p style={{
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: '9.5px', letterSpacing: '0.28em',
          textTransform: 'uppercase', color: hue,
          fontWeight: 700, margin: '0 0 10px',
        }}>
          Angkatan 2026
        </p>
        <h1 style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: '46px', margin: '0 0 14px',
          color: '#1a1510', lineHeight: 1.1, fontWeight: 400,
        }}>
          XII {selectedClass.name}
        </h1>
        <p style={{
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: '8.5px', letterSpacing: '0.3em',
          textTransform: 'uppercase', color: '#b09878',
          margin: '0 0 16px',
        }}>
          SMKN 2 Purwakarta
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={{ width: 44, height: 1, background: `${hue}32` }} />
          <div style={{ width: 5, height: 5, background: hue, transform: 'rotate(45deg)', opacity: 0.6 }} />
          <div style={{ width: 44, height: 1, background: `${hue}32` }} />
        </div>
      </div>

      {/* Student list */}
      {studentsInClass.length > 0 ? (
        <div style={{ display: 'flex', gap: 20 }}>
          {studentCols.map((col, colIdx) => (
            <div key={colIdx} style={{ flex: 1 }}>
              {col.map((student, rowIdx) => (
                <div key={rowIdx} style={{
                  display: 'flex', alignItems: 'baseline', gap: 5,
                  padding: '3.5px 0', borderBottom: '1px solid rgba(0,0,0,0.06)',
                }}>
                  <span style={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontSize: '8px', color: `${hue}72`,
                    width: 14, textAlign: 'right', flexShrink: 0, fontWeight: 600,
                  }}>
                    {rowIdx * numCols + colIdx + 1}
                  </span>
                  <span style={{
                    fontFamily: '"Lora", serif',
                    fontSize: '10.5px', fontWeight: 500,
                    color: '#2c241c', lineHeight: 1.35,
                  }}>
                    {student['Nama Siswa']}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center', marginTop: 80,
          fontFamily: '"Lora", serif', fontStyle: 'italic',
          color: '#bbb', fontSize: 12,
        }}>
          Data siswa belum tersedia.
        </div>
      )}

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 1, background: `${hue}22` }} />
          <span style={{
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: '8px', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#c0a88a', fontWeight: 600,
          }}>
            {studentsInClass.length} Siswa
          </span>
          <div style={{ width: 36, height: 1, background: `${hue}22` }} />
        </div>
      </div>
    </>
  );

  // Shared page wrapper styles
  const pageWrapStyle = {
    width: PAGE_W,
    height: PAGE_H,
    backgroundColor: '#fdfbf7',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    padding: '52px 46px 48px',
  };

  return (
    <>
      {/* ── Off-screen capture target (no transform — html2canvas reads full 520×740) ── */}
      <div
        ref={previewRef}
        aria-hidden="true"
        style={{ ...pageWrapStyle, position: 'fixed', top: 0, left: -(PAGE_W + 20), pointerEvents: 'none' }}
      >
        {pageInner}
      </div>

    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mt-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1">
            <svg className="w-3 h-3 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase">PDF Generator</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100">Daftar Nama Kelas</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Generate halaman nama dari CSV → merge via{' '}
              <code className="font-mono text-amber-400/60 text-[10px]">merge-names.sh</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isGenerating && progress.total > 0 && (
            <div className="flex items-center gap-2 mr-2">
              <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(progress.current / progress.total) * 100}%`, backgroundColor: hue }}
                />
              </div>
              <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                {progress.current}/{progress.total}
              </span>
            </div>
          )}

          <button
            onClick={() => generateSinglePDF(selectedClass)}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700/80 hover:border-slate-600 hover:bg-slate-700/60 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {selectedClass.name}
          </button>

          <button
            onClick={generateAll}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-amber-400 hover:bg-amber-300 text-amber-950"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Mencetak...
              </>
            ) : (
              <>
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h7M12 4v6m0 0l-2-2m2 2l2-2M14 18h6m-3-3v6" />
                </svg>
                .ZIP Semua ({CLASSES.length})
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex min-h-0">

        {/* Left: class chip grid */}
        <div className="flex-1 p-5 border-r border-slate-800 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Pilih Kelas</span>
            {data.length > 0 && (
              <span className="text-[11px] font-mono text-slate-500">
                <span className="text-slate-300 font-bold">{studentsInClass.length}</span> siswa
                {' · '}
                <span className="text-slate-300 font-bold">{numCols}</span> kolom
              </span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {CLASSES.map(cls => {
              const active = selectedClass.id === cls.id;
              const count = studentCounts[cls.id] ?? 0;
              return (
                <button
                  key={cls.id}
                  onClick={() => !isGenerating && setSelectedClass(cls)}
                  className={`relative rounded-lg p-2.5 text-left border transition-all duration-200 ${
                    active
                      ? 'bg-slate-800/90'
                      : 'bg-slate-950/40 border-slate-800/70 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                  style={{ borderColor: active ? `${cls.hue}70` : undefined }}
                >
                  {active && (
                    <span
                      className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[7px]"
                      style={{ backgroundColor: cls.hue }}
                    />
                  )}
                  <span className="block text-[9px] font-mono text-slate-600 leading-none mb-1">XII</span>
                  <span
                    className="block text-[13px] font-bold leading-none"
                    style={{ color: active ? cls.hue : '#64748b' }}
                  >
                    {cls.name}
                  </span>
                  <span
                    className="block text-[10px] font-mono mt-1.5 tabular-nums"
                    style={{ color: active ? `${cls.hue}90` : '#475569' }}
                  >
                    {data.length > 0 ? count : '·'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: page preview */}
        <div className="p-5 flex flex-col items-start gap-3 shrink-0">
          <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
            Pratinjau — {selectedClass.name}
          </span>

          {/* Scale clip container */}
          <div
            className="bg-slate-950 rounded-lg border border-slate-800/60 overflow-hidden"
            style={{ padding: 8, width: previewW + 16 }}
          >
            <div style={{
              width: previewW, height: previewH,
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(0,0,0,0.65)',
              borderRadius: 1,
            }}>
              {/* Visual-only scaled clone — no ref */}
              <div style={{
                transform: `scale(${SCALE})`,
                transformOrigin: 'top left',
                width: PAGE_W, height: PAGE_H,
                pointerEvents: 'none',
              }}>
                <div style={pageWrapStyle}>
                  {pageInner}
                </div>
              </div>
            </div>
          </div>

          <span className="text-[10px] text-slate-700 font-mono">{PAGE_W} × {PAGE_H} px</span>
        </div>

      </div>
    </div>
    </>
  );
}
