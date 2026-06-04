#!/bin/bash

# Pastikan Anda berada di root proyek saat menjalankan script ini
TARGET_DIR="public/yearbook"
TEMP_DIR="public/yearbook/temp"

# Cek apakah command line tools terinstal
if ! command -v gs &> /dev/null; then
    echo "❌ Ghostscript belum terinstal. Jalankan: brew install ghostscript"
    exit 1
fi

if ! command -v qpdf &> /dev/null; then
    echo "❌ qpdf belum terinstal. Jalankan: brew install qpdf"
    exit 1
fi

echo "🚀 Memulai proses optimasi dan kompresi PDF secara massal..."
mkdir -p "$TEMP_DIR"

# Loop setiap file PDF di dalam folder target
for pdf_file in "$TARGET_DIR"/*.pdf; do
    # Skip file yang sudah dioptimasi agar tidak berulang
    if [[ "$pdf_file" == *"-optimized.pdf" ]]; then
        continue
    fi
    
    [ -e "$pdf_file" ] || continue
    
    filename=$(basename "$pdf_file")
    base_name="${filename%.pdf}"
    optimized_file="$TARGET_DIR/${base_name}-optimized.pdf"
    
    echo "----------------------------------------"
    echo "⚙️ Memproses: $filename"
    
    orig_size=$(stat -f%z "$pdf_file" 2>/dev/null || stat -c%s "$pdf_file")
    orig_mb=$(echo "scale=2; $orig_size / 1048576" | bc)
    echo "   Ukuran awal: $orig_mb MB"

    compressed_file="$TEMP_DIR/compressed_$filename"
    final_temp_file="$TEMP_DIR/$filename"
    
    echo "   -> Melakukan kompresi gambar..."
    gs -sDEVICE=pdfwrite \
       -dCompatibilityLevel=1.4 \
       -dPDFSETTINGS=/ebook \
       -dNOPAUSE -dQUIET -dBATCH \
       -sOutputFile="$compressed_file" \
       "$pdf_file"
    
    echo "   -> Menerapkan Fast Web View (Linearization)..."
    qpdf --linearize "$compressed_file" "$final_temp_file"
    
    # Simpan sebagai file dengan akhiran -optimized.pdf
    mv "$final_temp_file" "$optimized_file"
    
    rm "$compressed_file"
    
    new_size=$(stat -f%z "$optimized_file" 2>/dev/null || stat -c%s "$optimized_file")
    new_mb=$(echo "scale=2; $new_size / 1048576" | bc)
    echo "   ✅ Selesai! Tersimpan sebagai ${base_name}-optimized.pdf ($new_mb MB)"
done

rm -rf "$TEMP_DIR"

echo "----------------------------------------"
echo "🎉 Semua PDF berhasil dioptimasi (Versi unduhan asli tetap dipertahankan)!"
