#!/bin/bash

# Script to merge generated names PDF to the end of the original PDFs using qpdf.
# Make sure the downloaded files (e.g. AK-1-names.pdf) are moved to the public/yearbook folder first.

TARGET_DIR="public/yearbook"
TEMP_DIR="public/yearbook/temp"

if ! command -v qpdf &> /dev/null; then
    echo "❌ qpdf belum terinstal. Jalankan: brew install qpdf"
    exit 1
fi

echo "🚀 Memulai penggabungan halaman nama ke PDF..."
mkdir -p "$TEMP_DIR"

for pdf_file in "$TARGET_DIR"/*.pdf; do
    # Skip optimized or names files as primary target
    if [[ "$pdf_file" == *"-optimized.pdf" ]] || [[ "$pdf_file" == *"-names.pdf" ]]; then
        continue
    fi
    
    [ -e "$pdf_file" ] || continue
    
    filename=$(basename "$pdf_file")
    base_name="${filename%.pdf}"
    
    # Format generated names filename (handling spaces just in case)
    # The React app saves it as e.g., "AK-1-names.pdf"
    # But some names might have spaces, e.g., "AK 1" -> "AK-1-names.pdf"
    
    names_file="$TARGET_DIR/${base_name}-names.pdf"
    
    if [ ! -f "$names_file" ]; then
        # Check alternative format with spaces
        names_file="$TARGET_DIR/${base_name// /-}-names.pdf"
    fi

    if [ -f "$names_file" ]; then
        echo "----------------------------------------"
        echo "⚙️ Menyatukan $filename dengan halaman nama..."
        
        merged_file="$TEMP_DIR/merged_$filename"
        
        # Merge original PDF and names PDF
        qpdf --empty --pages "$pdf_file" "$names_file" -- "$merged_file"
        
        if [ $? -eq 0 ]; then
            # Replace original file with the merged one
            mv "$merged_file" "$pdf_file"
            echo "   ✅ Berhasil digabungkan!"
            
            # (Opsional) Hapus file names.pdf jika sudah tidak dibutuhkan
            # rm "$names_file"
        else
            echo "   ❌ Gagal menggabungkan."
        fi
    fi
done

rm -rf "$TEMP_DIR"
echo "----------------------------------------"
echo "🎉 Proses penggabungan selesai! Jalankan script optimize-pdfs.sh kembali jika ingin meng-generate ulang versi -optimized.pdf nya."
