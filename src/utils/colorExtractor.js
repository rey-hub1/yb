import { pdfjs } from "react-pdf";

// Cache untuk palet warna PDF yang telah diekstraksi
export const PDF_COLOR_CACHE = new Map();

export function rgbToHex(r, g, b) {
  return `#${[r, g, b]
    .map((value) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((char) => char + char).join("") : clean;
  const value = Number.parseInt(full, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

export function isLightColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.66;
}

export function mixHexColors(baseHex, targetHex, amount) {
  const base = hexToRgb(baseHex);
  const target = hexToRgb(targetHex);
  const clamped = Math.max(0, Math.min(1, amount));

  return rgbToHex(
    Math.round(base.r + (target.r - base.r) * clamped),
    Math.round(base.g + (target.g - base.g) * clamped),
    Math.round(base.b + (target.b - base.b) * clamped),
  );
}

export function hexToRgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function rgbDistance(colorA, colorB) {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);

  return Math.sqrt(
    (a.r - b.r) ** 2 +
    (a.g - b.g) ** 2 +
    (a.b - b.b) ** 2,
  );
}

export function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;

  if (delta === 0) {
    return { h: 0, s: 0, l };
  }

  const s = delta / (1 - Math.abs(2 * l - 1));
  let h;

  if (max === rn) h = ((gn - bn) / delta) % 6;
  else if (max === gn) h = (bn - rn) / delta + 2;
  else h = (rn - gn) / delta + 4;

  return {
    h: Math.round(h * 60 < 0 ? h * 60 + 360 : h * 60),
    s,
    l,
  };
}

export function buildPalette(primary, secondary, options = {}) {
  const safeSecondary = secondary ?? (
    isLightColor(primary)
      ? mixHexColors(primary, "#102033", 0.4)
      : mixHexColors(primary, "#ffffff", 0.26)
  );
  const accent = options.accent ?? mixHexColors(primary, "#ffffff", isLightColor(primary) ? 0.04 : 0.14);

  return {
    primary,
    secondary: safeSecondary,
    accent,
    left: options.left ?? primary,
    right: options.right ?? safeSecondary,
  };
}

export function buildSpreadPalette(leftPalette, rightPalette) {
  if (!rightPalette) {
    return buildPalette(leftPalette.primary, leftPalette.secondary, {
      accent: leftPalette.accent,
      left: leftPalette.primary,
      right: leftPalette.primary,
    });
  }

  return buildPalette(
    mixHexColors(leftPalette.primary, rightPalette.primary, 0.42),
    mixHexColors(leftPalette.secondary, rightPalette.secondary, 0.58),
    {
      accent: mixHexColors(leftPalette.accent, rightPalette.accent, 0.5),
      left: leftPalette.primary,
      right: rightPalette.primary,
    },
  );
}

export function getSpreadPageNumbers(pageIndex, numPages) {
  if (!numPages) {
    return { left: 1, right: null };
  }

  if (pageIndex <= 0) {
    return { left: 1, right: null };
  }

  const left = Math.min(numPages, pageIndex + 1);
  const right = pageIndex + 2 <= numPages ? pageIndex + 2 : null;

  return { left, right };
}

export function getPdfPaletteFromPixels(
  imageData,
  bounds = { xStart: 0, xEnd: 1, yStart: 0, yEnd: 1 },
) {
  const buckets = new Map();
  const { data, width, height } = imageData;
  const startX = Math.max(0, Math.floor(width * bounds.xStart));
  const endX = Math.min(width, Math.ceil(width * bounds.xEnd));
  const startY = Math.max(0, Math.floor(height * bounds.yStart));
  const endY = Math.min(height, Math.ceil(height * bounds.yEnd));
  const sampleWidth = Math.max(1, endX - startX);
  const sampleHeight = Math.max(1, endY - startY);

  for (let y = startY; y < endY; y += 2) {
    for (let x = startX; x < endX; x += 2) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a < 180) continue;

      const { h, s, l } = rgbToHsl(r, g, b);
      const brightness = (r + g + b) / 765;

      if (brightness > 0.97 && s < 0.08) continue;
      if (brightness < 0.08) continue;
      if (s < 0.08 && l > 0.84) continue;

      const relX = (x - startX) / sampleWidth;
      const relY = (y - startY) / sampleHeight;
      const centerWeight = 1 - Math.min(1, Math.abs(relX - 0.5) * 2);
      const upperWeight = 1 - Math.min(1, Math.abs(relY - 0.28) * 2.4);
      const positionWeight = 1 + centerWeight * 0.8 + Math.max(0, upperWeight) * 1.15;
      const vibranceWeight = 0.9 + s * 3.6 + (1 - Math.abs(l - 0.5)) * 0.7;
      const weight = positionWeight * vibranceWeight;
      const key = `${Math.round(h / 14) * 14}-${Math.round(s * 5)}-${Math.round(l * 5)}`;
      const current = buckets.get(key) ?? {
        score: 0,
        totalR: 0,
        totalG: 0,
        totalB: 0,
        totalS: 0,
        count: 0,
      };

      current.score += weight;
      current.totalR += r;
      current.totalG += g;
      current.totalB += b;
      current.totalS += s;
      current.count += 1;
      buckets.set(key, current);
    }
  }

  const candidates = Array.from(buckets.values())
    .filter((bucket) => bucket.count >= 12)
    .map((bucket) => {
      const avgR = Math.round(bucket.totalR / bucket.count);
      const avgG = Math.round(bucket.totalG / bucket.count);
      const avgB = Math.round(bucket.totalB / bucket.count);
      const hex = rgbToHex(avgR, avgG, avgB);
      const hsl = rgbToHsl(avgR, avgG, avgB);

      return {
        ...bucket,
        hex,
        hsl,
        avgS: bucket.totalS / bucket.count,
      };
    })
    .sort((a, b) => b.score - a.score);

  const primaryCandidate = candidates.find((candidate) => candidate.hsl.s > 0.18) ?? candidates[0];

  if (!primaryCandidate) return null;

  const secondaryCandidate = candidates.find((candidate) =>
    candidate !== primaryCandidate &&
    candidate.score > primaryCandidate.score * 0.2 &&
    rgbDistance(candidate.hex, primaryCandidate.hex) > 72,
  );

  return buildPalette(primaryCandidate.hex, secondaryCandidate?.hex);
}

export async function extractPdfPalette(pdfUrl, pageNumber, fallbackColor, pdfDocument) {
  const fallbackPalette = buildPalette(fallbackColor);
  const cacheKey = `${pdfUrl}::${pageNumber}`;

  if (PDF_COLOR_CACHE.has(cacheKey)) {
    return PDF_COLOR_CACHE.get(cacheKey);
  }

  // Kalau viewer udah punya PDF proxy yg ke-load (react-pdf <Document>), pakai itu —
  // jangan getDocument baru, soalnya itu artinya download+parse PDF KEDUA KALINYA
  // cuma buat sampling warna (boros di koneksi lelet). loadingTask cuma dibikin
  // (dan di-destroy) kalau kita yang punya document-nya sendiri.
  const ownsDocument = !pdfDocument;
  const loadingTask = ownsDocument ? pdfjs.getDocument(pdfUrl) : null;
  const pdfPromise = ownsDocument ? loadingTask.promise : Promise.resolve(pdfDocument);

  const palettePromise = pdfPromise
    .then(async (pdf) => {
      try {
        const sourcePageNumber = Math.min(Math.max(1, pageNumber), pdf.numPages);
        const page = await pdf.getPage(sourcePageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(1.35, Math.max(0.34, 220 / baseViewport.width));
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { willReadFrequently: true });

        if (!context) return fallbackPalette;

        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));

        await page.render({ canvasContext: context, viewport }).promise;
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        const overallPalette = getPdfPaletteFromPixels(imageData);

        if (!overallPalette) return fallbackPalette;

        const leftPalette = getPdfPaletteFromPixels(imageData, {
          xStart: 0.03,
          xEnd: 0.47,
          yStart: 0.08,
          yEnd: 0.92,
        });
        const rightPalette = getPdfPaletteFromPixels(imageData, {
          xStart: 0.53,
          xEnd: 0.97,
          yStart: 0.08,
          yEnd: 0.92,
        });

        const left = leftPalette?.primary ?? overallPalette.primary;
        let right = rightPalette?.primary ?? overallPalette.secondary;

        if (rgbDistance(left, right) < 44) {
          right = rgbDistance(left, overallPalette.secondary) > 44
            ? overallPalette.secondary
            : mixHexColors(
                left,
                isLightColor(left) ? "#13233b" : "#ffffff",
                isLightColor(left) ? 0.3 : 0.2,
              );
        }

        return buildPalette(overallPalette.primary, overallPalette.secondary, { left, right });
      } finally {
        // Cuma destroy kalau kita yang bikin document-nya sendiri — pdf yg dipinjam
        // dari <Document> masih dipakai viewer, destroy bakal bikin viewer rusak.
        if (ownsDocument) await pdf.destroy();
      }
    })
    .catch(() => fallbackPalette);

  PDF_COLOR_CACHE.set(cacheKey, palettePromise);
  return palettePromise;
}

export function getCardStyle(cls, index, extractedPalettes) {
  const palette = extractedPalettes[cls.pdf] ?? cls.palette ?? buildPalette(cls.hue);
  const hue = palette.primary;

  return {
    "--hue": hue,
    "--delay": `${index * 40}ms`,
  };
}

export function getViewerThemeStyle(palette) {
  if (!palette) return undefined;

  const primary = palette.primary;
  const secondary = palette.secondary;
  const accent = palette.accent;
  const left = palette.left ?? primary;
  const right = palette.right ?? secondary;
  const overlayStart = mixHexColors(left, "#05070b", 0.42);
  const overlayMid = mixHexColors(primary, secondary, 0.38);
  const overlayEnd = mixHexColors(right, "#04060a", 0.46);
  const overlayDepth = mixHexColors(mixHexColors(left, right, 0.5), "#000000", 0.72);

  return {
    "--yb-overlay-bg": overlayDepth,
    "--yb-overlay-bg-start": overlayStart,
    "--yb-overlay-bg-mid": overlayMid,
    "--yb-overlay-bg-end": overlayEnd,
    "--yb-overlay-glow-a": hexToRgba(mixHexColors(left, "#ffffff", 0.06), 0.34),
    "--yb-overlay-glow-b": hexToRgba(mixHexColors(right, "#ffffff", 0.05), 0.28),
    "--yb-overlay-book-glow": hexToRgba(mixHexColors(primary, accent, 0.35), 0.22),
    "--yb-overlay-hdr": hexToRgba(accent, 0.28),
    "--yb-overlay-accent": accent,
    "--yb-overlay-accent-soft": hexToRgba(accent, 0.16),
    "--yb-overlay-txt": "#ffffff",
    "--yb-overlay-dim": "rgba(255,255,255,0.72)",
  };
}
