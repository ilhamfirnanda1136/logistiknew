#!/bin/sh
set -e

echo "=============================="
echo " Vite Dev Server Starting..."
echo "=============================="

# Cek apakah node_modules sudah ada dan vite tersedia
if [ ! -f /var/www/node_modules/.bin/vite ]; then
    echo "[INFO] node_modules tidak ditemukan di /var/www."
    echo "[INFO] Menyalin dari backup image..."
    cp -r /node_modules_cache/. /var/www/node_modules/
    echo "[OK]   node_modules berhasil dipulihkan!"
else
    echo "[OK]   node_modules sudah ada, langsung jalan."
fi

echo "=============================="
echo " Menjalankan: vite --host"
echo "=============================="

exec /var/www/node_modules/.bin/vite --host
