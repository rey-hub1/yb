import React, { useState, useEffect, useCallback } from "react";
import { CLASSES } from "../data/classes";
import { extractPdfPalette, buildPalette, isLightColor, getViewerThemeStyle } from "../utils/colorExtractor";
import NamesGenerator from "./NamesGenerator";

function ColorPicker({ color, onChange, label }) {
  const [inputValue, setInputValue] = useState(color);

  // Sync state if color prop changes from outside
  useEffect(() => {
    setInputValue(color);
  }, [color]);

  const handleChange = (val) => {
    setInputValue(val);
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      onChange(val);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300">
      <span className="text-[10px] text-slate-400 font-semibold tracking-wide">{label}</span>
      
      <div className="relative w-8 h-8 rounded-full border border-slate-700 overflow-hidden cursor-pointer hover:scale-105 active:scale-95 transition-transform"
           style={{ background: "conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)" }}
           title="Pilih Warna (Color Wheel)"
      >
        <div className="absolute inset-[3px] rounded-full border border-slate-900 shadow-inner" style={{ backgroundColor: color }} />
        <input
          type="color"
          value={color}
          onChange={(e) => handleChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>

      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        className="w-16 text-center text-[10px] font-mono bg-slate-900 border border-slate-800 rounded py-0.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
        placeholder="#Hex"
      />
    </div>
  );
}

export default function AdminPanel({ onBack }) {
  const [selectedClassId, setSelectedClassId] = useState(() => CLASSES[0]?.id || null);

  const [customHues, setCustomHues] = useState(() => {
    const initial = {};
    CLASSES.forEach((cls) => {
      initial[cls.id] = cls.hue;
    });
    return initial;
  });

  const [extractedPalettes, setExtractedPalettes] = useState(() => {
    const initial = {};
    CLASSES.forEach((cls) => {
      if (cls.palette) {
        initial[cls.pdf] = cls.palette;
      }
    });
    return initial;
  });

  const [loadingMap, setLoadingMap] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [errorMap, setErrorMap] = useState({});
  const [copied, setCopied] = useState(false);

  // Check which PDFs actually exist on the server/public folder
  useEffect(() => {
    CLASSES.forEach(async (cls) => {
      setStatusMap((prev) => ({ ...prev, [cls.pdf]: "checking" }));
      try {
        const res = await fetch(cls.pdf, { method: "HEAD" });
        if (res.ok) {
          setStatusMap((prev) => ({ ...prev, [cls.pdf]: "exists" }));
        } else {
          setStatusMap((prev) => ({ ...prev, [cls.pdf]: "missing" }));
        }
      } catch (err) {
        setStatusMap((prev) => ({ ...prev, [cls.pdf]: "missing" }));
      }
    });
  }, []);

  const handleHueChange = useCallback((clsId, newHue) => {
    setCustomHues((prev) => ({
      ...prev,
      [clsId]: newHue,
    }));
  }, []);

  const handlePaletteChange = useCallback((pdfPath, key, newColor) => {
    setExtractedPalettes((prev) => {
      const cls = CLASSES.find((c) => c.pdf === pdfPath);
      const fallbackHue = cls ? (customHues[cls.id] || cls.hue) : "#ffffff";
      const current = prev[pdfPath] || buildPalette(fallbackHue);
      const updated = { ...current, [key]: newColor };

      // Auto-sync left/right if they were matching primary/secondary
      if (key === "primary" && current.left === current.primary) {
        updated.left = newColor;
      }
      if (key === "secondary" && current.right === current.secondary) {
        updated.right = newColor;
      }
      return {
        ...prev,
        [pdfPath]: updated,
      };
    });
  }, [customHues]);

  const handleCreatePalette = useCallback((cls) => {
    const currentHue = customHues[cls.id] || cls.hue;
    const newPalette = buildPalette(currentHue);
    setExtractedPalettes((prev) => ({
      ...prev,
      [cls.pdf]: newPalette,
    }));
  }, [customHues]);

  const handleDeletePalette = useCallback((cls) => {
    setExtractedPalettes((prev) => {
      const updated = { ...prev };
      delete updated[cls.pdf];
      return updated;
    });
  }, []);

  const handleExtract = useCallback(async (cls) => {
    setLoadingMap((prev) => ({ ...prev, [cls.pdf]: true }));
    setErrorMap((prev) => ({ ...prev, [cls.pdf]: null }));

    try {
      // Extract palette from page 2 (index 2) of the PDF
      const palette = await extractPdfPalette(cls.pdf, 2, customHues[cls.id] || cls.hue);
      if (palette) {
        setExtractedPalettes((prev) => ({
          ...prev,
          [cls.pdf]: palette,
        }));
      } else {
        throw new Error("Gagal mengekstrak warna dominan");
      }
    } catch (err) {
      console.error("Gagal mengekstrak warna untuk", cls.name, err);
      setErrorMap((prev) => ({
        ...prev,
        [cls.pdf]: err.message || "Gagal membaca PDF",
      }));
    } finally {
      setLoadingMap((prev) => ({ ...prev, [cls.pdf]: false }));
    }
  }, [customHues]);

  const handleExtractAll = useCallback(async () => {
    // Filter only classes where PDF exists
    const availableClasses = CLASSES.filter(cls => statusMap[cls.pdf] === "exists");
    for (const cls of availableClasses) {
      if (!extractedPalettes[cls.pdf]) {
        await handleExtract(cls);
      }
    }
  }, [statusMap, extractedPalettes, handleExtract]);

  const generateConfigString = useCallback(() => {
    const items = CLASSES.map((cls) => {
      const hue = customHues[cls.id] || cls.hue;
      const pal = extractedPalettes[cls.pdf];
      const palString = pal
        ? `, palette: ${JSON.stringify(pal)}`
        : "";
      return `  { id: ${cls.id}, name: "${cls.name}", pdf: "${cls.pdf}", hue: "${hue}"${palString} },`;
    });

    return `export const CLASSES = [\n${items.join("\n")}\n];\n`;
  }, [customHues, extractedPalettes]);

  const handleCopy = useCallback(() => {
    const configText = generateConfigString();
    navigator.clipboard.writeText(configText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [generateConfigString]);

  return (
    <div className="min-height-screen bg-slate-950 text-slate-100 font-sans p-6 sm:p-10 selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-800 pb-8 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-indigo-600/20 text-indigo-400 text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border border-indigo-500/30">
              Admin Mode
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
              Yearbook Color Palettes
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            Ekstrak warna langsung dari halaman PDF untuk menghilangkan kendala performa loading halaman utama.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-all duration-200 hover:text-white"
          >
            ← Kembali ke Web
          </button>
          <button
            onClick={handleExtractAll}
            className="px-4 py-2 text-sm font-semibold text-indigo-300 bg-indigo-950/40 border border-indigo-900 hover:border-indigo-800 hover:bg-indigo-950/60 rounded-lg transition-all duration-200"
          >
            Ekstrak Semua PDF Ready
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg ${
              copied
                ? "bg-emerald-600 text-white shadow-emerald-900/30 border border-emerald-500"
                : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/20 border border-indigo-500"
            }`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Tersalin!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy classes.js Config
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Classes List (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h2 className="text-lg font-bold text-slate-300">Daftar Kelas ({CLASSES.length})</h2>
            <span className="text-xs text-slate-500">Ekstraksi dijalankan pada halaman ke-2 PDF</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CLASSES.map((cls) => {
              const status = statusMap[cls.pdf] || "checking";
              const palette = extractedPalettes[cls.pdf];
              const loading = loadingMap[cls.pdf] || false;
              const error = errorMap[cls.pdf];

              const currentHue = palette ? palette.primary : (customHues[cls.id] || cls.hue);
              const isSelected = selectedClassId === cls.id;

              return (
                <div
                  key={cls.id}
                  className={`border rounded-xl p-5 transition-all duration-350 flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? "border-indigo-500 bg-slate-900/90 ring-1 ring-indigo-500/20 shadow-lg shadow-indigo-950/40"
                      : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/80"
                  }`}
                  onClick={() => setSelectedClassId(cls.id)}
                >
                  {/* Top: Name and file status */}
                  <div className="flex items-start justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                        <span className="text-indigo-400 font-mono text-sm">#{String(cls.id).padStart(2, "0")}</span>
                        {cls.name}
                      </h3>
                      <p className="text-slate-500 font-mono text-[11px] truncate max-w-[200px]" title={cls.pdf}>
                        {cls.pdf}
                      </p>
                    </div>

                    {status === "checking" && (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        Checking...
                      </span>
                    )}
                    {status === "exists" && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/50">
                        PDF OK
                      </span>
                    )}
                    {status === "missing" && (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-950/30 px-2 py-0.5 rounded border border-rose-900/50">
                        HILANG
                      </span>
                    )}
                  </div>

                  {/* Mini Card Preview */}
                  <div className="relative w-full h-16 bg-[#fcfbfa] border border-black/5 text-[#231c15] rounded shadow-sm overflow-hidden p-3 flex flex-col justify-between transition-all duration-300"
                       style={{ fontFamily: "'Lora', Georgia, serif" }}>
                    {/* Tab indicator */}
                    <div className="absolute top-0 left-0 right-0 h-1 transition-all duration-300" style={{ backgroundColor: currentHue }} />
                    {/* Binder hole */}
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#e6dec8] shadow-inner" />
                    {/* Number */}
                    <div className="absolute top-2 right-2.5 text-[9px] font-bold opacity-30 font-mono">
                      {String(cls.id).padStart(2, "0")}
                    </div>
                    {/* Content */}
                    <div className="pl-5 pr-2">
                      <span className="text-[7px] uppercase tracking-wider text-[#a38c74] font-bold font-sans">Kelas</span>
                      <h4 className="font-serif text-[13px] font-bold truncate transition-all duration-350" style={{ color: currentHue }}>
                        {cls.name}
                      </h4>
                    </div>
                  </div>

                  {/* Mid: Palettes visual / Color Editor */}
                  <div onClick={(e) => e.stopPropagation()}>
                    {palette ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Palet Warna (Edit via Roda):</span>
                          <button
                            onClick={() => handleDeletePalette(cls)}
                            className="text-[9px] text-rose-400 hover:text-rose-300 font-semibold transition-colors"
                          >
                            Hapus Palet
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <ColorPicker
                            label="Primary"
                            color={palette.primary}
                            onChange={(val) => handlePaletteChange(cls.pdf, "primary", val)}
                          />
                          <ColorPicker
                            label="Secondary"
                            color={palette.secondary}
                            onChange={(val) => handlePaletteChange(cls.pdf, "secondary", val)}
                          />
                          <ColorPicker
                            label="Accent"
                            color={palette.accent}
                            onChange={(val) => handlePaletteChange(cls.pdf, "accent", val)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Warna Asal (Hue):</span>
                          <button
                            onClick={() => handleCreatePalette(cls)}
                            className="text-[9px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                          >
                            Buat Palet ✦
                          </button>
                        </div>
                        <div className="flex justify-start">
                          <ColorPicker
                            label="Base Hue"
                            color={customHues[cls.id] || cls.hue}
                            onChange={(val) => handleHueChange(cls.id, val)}
                          />
                        </div>
                      </div>
                    )}

                    {error && (
                      <p className="text-xs text-rose-400 mt-2 bg-rose-950/20 p-2 rounded border border-rose-900/30">
                        ⚠ {error}
                      </p>
                    )}
                  </div>

                  {/* Bottom: Action */}
                  <div className="flex items-center justify-between border-t border-slate-800/60 pt-3 mt-1" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[11px] text-slate-400">
                      {palette ? "✓ Terkomputasi" : "Belum diekstrak"}
                    </span>
                    <button
                      onClick={() => handleExtract(cls)}
                      disabled={status !== "exists" || loading}
                      className={`px-3 py-1.5 text-xs font-semibold rounded transition-all duration-200 ${
                        status !== "exists"
                          ? "bg-slate-950 text-slate-600 border border-slate-850 cursor-not-allowed"
                          : loading
                          ? "bg-indigo-900/40 text-indigo-300 border border-indigo-800 cursor-wait animate-pulse"
                          : palette
                          ? "bg-slate-950 text-indigo-400 border border-indigo-900/50 hover:bg-indigo-950/30 hover:border-indigo-800"
                          : "bg-indigo-600 text-white hover:bg-indigo-500"
                      }`}
                    >
                      {loading ? (
                        <span className="flex items-center gap-1">
                          <svg className="animate-spin h-3.5 w-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Memproses...
                        </span>
                      ) : palette ? (
                        "Ekstrak Ulang"
                      ) : (
                        "Ekstrak Warna"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Preview & Instructions (1 Column) */}
        <div className="space-y-6">
          {/* Card Preview Simulation */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
            {(() => {
              const activeCls = CLASSES.find((c) => c.id === selectedClassId) || CLASSES[0];
              const palette = extractedPalettes[activeCls.pdf] || null;
              const currentHue = palette ? palette.primary : (customHues[activeCls.id] || activeCls.hue);
              const activePalette = palette || buildPalette(currentHue);
              const viewerStyle = getViewerThemeStyle(activePalette);

              return (
                <>
                  <div className="border-b border-slate-800 pb-3">
                    <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                      <span className="text-emerald-400">✦</span>
                      Pratinjau Kelas: {activeCls.name}
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">
                      Simulasi tampilan warna kelas secara langsung pada kartu utama dan background flipbook.
                    </p>
                  </div>

                  {/* Card Simulation Wrapper */}
                  <div className="flex flex-col items-center p-6 bg-slate-950 rounded-lg border border-slate-850 gap-3">
                    <div
                      className="relative w-full max-w-[220px] aspect-[4/3] overflow-hidden bg-[#fcfbfa] border border-black/5 text-[#231c15] text-left rounded shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-102 hover:shadow-lg"
                      style={{
                        fontFamily: "'Lora', Georgia, serif"
                      }}
                    >
                      {/* Tab indicator */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-300" style={{ backgroundColor: currentHue }} />
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-black/5" style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }} />
                      
                      {/* Ring binder hole */}
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#e6dec8] shadow-inner" />

                      <div className="absolute top-3 right-3 text-[11px] font-serif opacity-40 font-bold">
                        {String(activeCls.id).padStart(2, "0")}
                      </div>

                      <div className="pl-9 pr-5 py-6 flex flex-col gap-1">
                        <span className="text-[9px] font-sans font-bold tracking-widest text-[#a38c74] uppercase">Kelas</span>
                        <span className="font-serif text-xl font-normal transition-all" style={{ color: currentHue }}>
                          {activeCls.name}
                        </span>
                        <div className="w-full h-[1px] bg-gradient-to-r from-black/10 to-transparent my-2" />
                        <span className="text-[11px] italic text-[#a38c74] flex items-center gap-1">
                          Buka ↗
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">Simulasi Kartu Kelas</span>
                  </div>

                  {/* Gradient Simulation Wrapper */}
                  <div className="flex flex-col items-center p-4 bg-slate-950 rounded-lg border border-slate-850 gap-3">
                    <div 
                      className="w-full aspect-[16/10] rounded-lg border border-slate-800 relative overflow-hidden flex items-center justify-center p-4 transition-all duration-500"
                      style={{
                        backgroundColor: viewerStyle?.["--yb-overlay-bg"] || "#05070b",
                        boxShadow: "inset 0 0 30px rgba(0,0,0,0.8)"
                      }}
                    >
                      {/* Gradient background layer */}
                      <div 
                        className="absolute inset-0 opacity-90 transition-all duration-500"
                        style={{
                          background: `linear-gradient(135deg, ${viewerStyle?.["--yb-overlay-bg-start"] || "#111"} 0%, ${viewerStyle?.["--yb-overlay-bg-mid"] || "#000"} 50%, ${viewerStyle?.["--yb-overlay-bg-end"] || "#0a0a0a"} 100%)`
                        }} 
                      />
                      
                      {/* Book Glow layer */}
                      <div 
                        className="absolute inset-0 transition-all duration-500"
                        style={{
                          background: `radial-gradient(circle at 50% 50%, ${viewerStyle?.["--yb-overlay-book-glow"] || "rgba(255,255,255,0.03)"} 0%, transparent 60%)`
                        }} 
                      />

                      {/* Glow A & B overlays */}
                      <div 
                        className="absolute top-0 left-0 w-1/2 h-full pointer-events-none mix-blend-screen opacity-40 transition-all duration-500"
                        style={{
                          background: `radial-gradient(circle at 0% 0%, ${viewerStyle?.["--yb-overlay-glow-a"] || "transparent"} 0%, transparent 70%)`
                        }}
                      />
                      <div 
                        className="absolute bottom-0 right-0 w-1/2 h-full pointer-events-none mix-blend-screen opacity-40 transition-all duration-500"
                        style={{
                          background: `radial-gradient(circle at 100% 100%, ${viewerStyle?.["--yb-overlay-glow-b"] || "transparent"} 0%, transparent 70%)`
                        }}
                      />

                      {/* Mock Book Spread */}
                      <div className="relative flex gap-0.5 w-[85%] aspect-[1.4] shadow-2xl z-10 transition-all duration-300">
                        {/* Left Page */}
                        <div 
                          className="flex-1 bg-white rounded-l p-2.5 flex flex-col justify-between border-r border-slate-200/50 shadow-[inset_-6px_0_12px_rgba(0,0,0,0.05)]"
                          style={{ fontFamily: "'Lora', Georgia, serif" }}
                        >
                          <span className="text-[8px] font-bold tracking-wider" style={{ color: activePalette.primary }}>{activeCls.name}</span>
                          <div className="space-y-1 my-auto">
                            <div className="w-5/6 h-1 bg-slate-100 rounded" />
                            <div className="w-full h-1 bg-slate-100 rounded" />
                            <div className="w-4/6 h-1 bg-slate-100 rounded" />
                          </div>
                          <span className="text-[6px] text-slate-400 font-mono">2</span>
                        </div>
                        {/* Right Page */}
                        <div 
                          className="flex-1 bg-white rounded-r p-2.5 flex flex-col justify-between shadow-[inset_6px_0_12px_rgba(0,0,0,0.05)]"
                          style={{ fontFamily: "'Lora', Georgia, serif" }}
                        >
                          <span className="text-[8px] font-bold tracking-wider text-right" style={{ color: activePalette.secondary || activePalette.primary }}>MEMORIES</span>
                          <div className="space-y-1 my-auto">
                            <div className="w-full h-1 bg-slate-100 rounded" />
                            <div className="w-5/6 h-1 bg-slate-100 rounded" />
                            <div className="w-3/4 h-1 bg-slate-100 rounded" />
                          </div>
                          <span className="text-[6px] text-slate-400 font-mono text-right">3</span>
                        </div>
                        
                        {/* Book Spine shadow */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-1.5 -translate-x-1/2 bg-gradient-to-r from-black/10 via-black/20 to-black/10" />
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">Simulasi Gradient Background</span>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Quick Guide */}
          <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-indigo-400 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cara Menggunakan
            </h2>

            <ol className="list-decimal list-inside text-xs text-slate-400 space-y-2.5 leading-relaxed">
              <li>
                Pastikan file PDF kelas Anda sudah ditaruh di folder <code className="bg-slate-900 text-indigo-300 font-mono px-1 py-0.5 rounded">public/yearbook/</code> dengan nama yang tepat.
              </li>
              <li>
                Klik tombol <strong className="text-slate-300">"Ekstrak Warna"</strong> di masing-masing kartu kelas untuk memproses PDF.
              </li>
              <li>
                Setelah semua warna yang Anda inginkan terekstrak dengan benar, klik tombol <strong className="text-slate-300">"Copy classes.js Config"</strong> di kanan atas.
              </li>
              <li>
                Tempel/Paste kode baru tersebut ke dalam file proyek Anda di <code className="bg-slate-900 text-indigo-300 font-mono px-1 py-0.5 rounded">[classes.js](file:///Users/reynonawfal/Documents/WEB/project/yb/src/data/classes.js)</code> secara menyeluruh.
              </li>
              <li>
                Halaman utama Yearbook sekarang akan langsung termuat secara instan dengan warna tema yang memukau tanpa hambatan performa!
              </li>
            </ol>
          </div>
        </div>

      </div>

      {/* Code Preview Drawer at Bottom */}
      <div className="max-w-7xl mx-auto mt-10">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between bg-slate-950/80 border-b border-slate-850 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-400 ml-2">src/data/classes.js (Pratinjau Hasil)</span>
            </div>
            <button
              onClick={handleCopy}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
            >
              {copied ? "✓ Tersalin" : "Salin Kode"}
            </button>
          </div>
          <div className="p-5 max-h-[300px] overflow-y-auto font-mono text-xs text-indigo-300/80 bg-slate-950/40 select-all leading-normal">
            <pre>{generateConfigString()}</pre>
          </div>
        </div>
        <NamesGenerator />
      </div>
    </div>
  );
}
