import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig } from 'vite';

// Jika SKIP_WAYFINDER=1 (di Docker Vite container tanpa PHP),
// plugin wayfinder dinonaktifkan agar tidak mencoba memanggil 'php artisan'
const skipWayfinder = process.env.SKIP_WAYFINDER === '1';

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 5173,
        hmr: {
            host: 'localhost',
            port: 5173,
        },
        watch: {
            usePolling: true,   // Wajib di Docker/WSL + Windows agar HMR bisa deteksi perubahan file
            interval: 1000,     // Cek setiap 1 detik
        },
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        // Hanya aktif jika BUKAN di container Docker tanpa PHP
        ...(!skipWayfinder ? [wayfinder({ formVariants: true })] : []),
    ],
});
