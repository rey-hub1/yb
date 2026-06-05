#!/bin/bash
#
# Append halaman daftar nama ke SETIAP PDF kelas — versi biasa DAN -optimized.
#
# Sumber halaman nama : public/yearbook/daftar-nama-semua-kelas/{BASE}-names.pdf
# Target              : public/yearbook/{BASE}.pdf  dan  public/yearbook/{BASE}-optimized.pdf
#
# Menggabung langsung pakai qpdf (lossless, cepat) tanpa re-compress.
# Jalankan dari root proyek:  bash scripts/merge-class-names.sh
#
# PERINGATAN: Jalankan hanya SEKALI per set PDF. Menjalankan ulang akan
# menambah halaman nama duplikat. Script menampilkan jumlah halaman
# sebelum/sesudah supaya bisa diverifikasi (harusnya +1 halaman saja).

set -euo pipefail

TARGET_DIR="public/yearbook"
NAMES_DIR="$TARGET_DIR/daftar-nama-semua-kelas"
TEMP_DIR="$TARGET_DIR/temp-merge"

if ! command -v qpdf &> /dev/null; then
    echo "❌ qpdf belum terinstal. Jalankan: brew install qpdf"
    exit 1
fi

if [ ! -d "$NAMES_DIR" ]; then
    echo "❌ Folder sumber tidak ada: $NAMES_DIR"
    exit 1
fi

echo "🚀 Menggabungkan halaman nama ke PDF biasa + optimized..."
mkdir -p "$TEMP_DIR"

merged=0
skipped=0

merge_into() {
    # $1 = target pdf path, $2 = names pdf path, $3 = label
    local target="$1" names="$2" label="$3"

    if [ ! -f "$target" ]; then
        echo "   ⏭️  $label tidak ada — dilewati"
        ((skipped++)) || true
        return
    fi

    local before after out
    before=$(qpdf --show-npages "$target")
    out="$TEMP_DIR/$(basename "$target")"

    qpdf --empty --pages "$target" "$names" -- "$out"
    after=$(qpdf --show-npages "$out")

    mv "$out" "$target"
    echo "   ✅ $label: $before → $after halaman (+$((after - before)))"
    ((merged++)) || true
}

for names_file in "$NAMES_DIR"/*-names.pdf; do
    [ -e "$names_file" ] || continue

    fname=$(basename "$names_file")
    base="${fname%-names.pdf}"          # AK-1-names.pdf -> AK-1

    echo "----------------------------------------"
    echo "📄 $base"

    merge_into "$TARGET_DIR/$base.pdf"           "$names_file" "biasa    ($base.pdf)"
    merge_into "$TARGET_DIR/$base-optimized.pdf" "$names_file" "optimized ($base-optimized.pdf)"
done

rm -rf "$TEMP_DIR"
echo "----------------------------------------"
echo "🎉 Selesai! $merged file digabung · $skipped dilewati."
echo "   Cek jumlah halaman di atas — tiap target harusnya +1."
