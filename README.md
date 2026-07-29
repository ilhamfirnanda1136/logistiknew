# Logistik & Asset

Aplikasi manajemen logistik dan aset berbasis **Laravel 13** + **Inertia.js / React** + **MySQL**.

---

## Daftar Isi

1. [Persyaratan Sistem](#1-persyaratan-sistem)
2. [Instalasi Manual (Hosting / Laragon / VPS)](#2-instalasi-manual-hosting--laragon--vps)
3. [Instalasi dengan Docker Compose](#3-instalasi-dengan-docker-compose)
4. [Akun Default](#4-akun-default)
5. [Perintah Berguna](#5-perintah-berguna)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Persyaratan Sistem

### Manual Hosting

| Komponen | Versi minimal |
|----------|----------------|
| PHP      | 8.3+          |
| Composer | 2.x           |
| Node.js  | 20 LTS        |
| npm / pnpm | terbaru     |
| MySQL    | 8.0+          |
| Ekstensi PHP | `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `gd`, `fileinfo` |

Web server: **Nginx** atau **Apache** (document root harus mengarah ke folder `public/`).

### Docker Compose

| Komponen | Versi |
|----------|--------|
| Docker   | 24+   |
| Docker Compose | v2+ |

---

## 2. Instalasi Manual (Hosting / Laragon / VPS)

### Langkah 1 — Clone / unggah project

```bash
git clone <url-repository> logistiknew
cd logistiknew
```

Atau unggah seluruh file project ke folder hosting (misalnya `public_html` / `www/logistiknew`).

### Langkah 2 — Install dependency PHP

```bash
composer install --no-interaction --prefer-dist
```

Untuk production:

```bash
composer install --no-dev --optimize-autoloader --no-interaction
```

### Langkah 3 — Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit file `.env` sesuai database server Anda:

```env
APP_NAME="Logistik & Asset"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=logistiknew
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
```

> **Catatan Laragon:** pastikan MySQL sudah running, lalu buat database `logistiknew` lewat HeidiSQL / phpMyAdmin.

### Langkah 4 — Buat database

Contoh di MySQL CLI:

```sql
CREATE DATABASE logistiknew CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Langkah 5 — Migrasi & seeder

```bash
php artisan migrate --force
php artisan db:seed --force
```

### Langkah 7 — Generate Wayfinder routes (wajib setelah clone)

Folder `resources/js/routes`, `resources/js/actions`, dan `resources/js/wayfinder` **tidak ikut Git** (di-generate otomatis). Setelah clone, jalankan:

```bash
php artisan wayfinder:generate --with-form
```

Tanpa langkah ini, `npm run dev` bisa error: `Failed to resolve import "@/routes/..."`.

### Langkah 8 — Permission (Linux / VPS)

```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

Sesuaikan user `www-data` dengan user web server Anda.

### Langkah 9 — Frontend

```bash
npm install
# atau: pnpm install
```

**Development (hot reload):**

```bash
npm run dev
```

**Production / hosting (build assets):**

```bash
npm run build
```

### Langkah 10 — Jalankan aplikasi

**Opsi A — PHP built-in server (lokal):**

```bash
php artisan serve
```

Buka: [http://127.0.0.1:8000](http://127.0.0.1:8000)

**Opsi B — Laragon:**  
Point virtual host ke folder `public/`, lalu akses domain yang dikonfigurasi (contoh: `http://logistiknew.test`).

**Opsi C — Nginx (contoh singkat):**

```nginx
server {
    listen 80;
    server_name contoh-domain.com;
    root /var/www/logistiknew/public;

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    }
}
```

**Opsi D — Apache:** pastikan `AllowOverride All` dan `mod_rewrite` aktif; document root = `public/`.

### Checklist production hosting

- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `APP_URL` sesuai domain
- [ ] `npm run build` sudah dijalankan
- [ ] `php artisan config:cache`
- [ ] `php artisan route:cache`
- [ ] `php artisan view:cache`
- [ ] Folder `storage/` dan `bootstrap/cache/` writable
- [ ] SSL (HTTPS) aktif

---

## 3. Instalasi dengan Docker Compose

Stack yang disediakan:

| Service | Container            | Port host | Keterangan              |
|---------|----------------------|-----------|-------------------------|
| `app`   | `logistiknew_app`    | —         | PHP 8.3 FPM             |
| `web`   | `logistiknew_web`    | **8000**  | Nginx                   |
| `db`    | `logistiknew_db`     | **3007**  | MySQL 8.0               |
| `vite`  | `logistiknew_vite`   | **5173**  | Vite (dev assets)       |

### Langkah 1 — Clone project

```bash
git clone <url-repository> logistiknew
cd logistiknew
```

### Langkah 2 — Siapkan `.env`

```bash
cp .env.example .env
```

Sesuaikan konfigurasi untuk Docker:

```env
APP_NAME="Logistik & Asset"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=logistiknew
DB_USERNAME=root
DB_PASSWORD=root

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
```

> Penting: di dalam jaringan Docker, host database adalah nama service (`db`), **bukan** `127.0.0.1`.  
> Port MySQL di host (akses dari luar container) adalah `3007`.

Password root MySQL mengikuti `DB_PASSWORD` di `.env` (default di `docker-compose.yml`: `root`).

### Langkah 3 — Build & jalankan container

```bash
docker compose up -d --build
```

Tunggu sampai semua container `running`:

```bash
docker compose ps
```

### Langkah 4 — Install Composer di dalam container

```bash
docker compose exec app composer install --no-interaction --prefer-dist
```

### Langkah 5 — Generate APP_KEY

```bash
docker compose exec app php artisan key:generate
```

### Langkah 6 — Migrasi & seeder

```bash
docker compose exec app php artisan migrate --force
docker compose exec app php artisan db:seed --force
```

### Langkah 7 — Generate Wayfinder routes

```bash
docker compose exec app php artisan wayfinder:generate --with-form
```

> Service `vite` memakai `SKIP_WAYFINDER=1` (tanpa PHP). Generate harus dijalankan di container `app` sebelum / bersamaan dengan `npm run dev`.

### Langkah 8 — Permission storage

```bash
docker compose exec app chown -R www-data:www-data storage bootstrap/cache
docker compose exec app chmod -R 775 storage bootstrap/cache
```

### Langkah 9 — Akses aplikasi

| Layanan        | URL |
|----------------|-----|
| Aplikasi web   | [http://localhost:8000](http://localhost:8000) |
| Vite (dev)     | [http://localhost:5173](http://localhost:5173) |
| MySQL (host)   | `127.0.0.1:3007` (user `root`, password dari `.env`) |

### Mode production di Docker (opsional)

Jika tidak memakai Vite hot-reload, build asset lalu matikan service vite:

```bash
docker compose exec vite sh -c "npm run build"
docker compose stop vite
```

Atau jalankan build lewat container Node sekali jalan:

```bash
docker compose run --rm vite sh -c "npm run build"
```

### Perintah Docker sehari-hari

```bash
# Start
docker compose up -d

# Stop
docker compose down

# Stop + hapus volume DB (HATI-HATI: data hilang)
docker compose down -v

# Lihat log
docker compose logs -f
docker compose logs -f app
docker compose logs -f web

# Artisan
docker compose exec app php artisan migrate
docker compose exec app php artisan db:seed
docker compose exec app php artisan tinker

# Shell ke container
docker compose exec app bash
```

---

## 4. Akun Default

Setelah `php artisan db:seed`:

| Field    | Nilai        |
|----------|--------------|
| Username | `superadmin` |
| Password | `password`   |

> Segera ganti password setelah login pertama, terutama di environment production.

---

## 5. Perintah Berguna

```bash
# Migrasi ulang (HATI-HATI: hapus data)
php artisan migrate:fresh --seed

# Clear cache
php artisan optimize:clear

# Cache config/route/view (production)
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Format PHP
./vendor/bin/pint

# Cek TypeScript
npm run types:check
```

---

## 6. Troubleshooting

### Error `Vite manifest not found` (`public/build/manifest.json`)

Artinya asset frontend belum di-build / Vite belum jalan. Pilih salah satu:

**Development** (Vite hot reload — biarkan terminal tetap jalan):

```bash
php artisan wayfinder:generate --with-form
npm install
npm run dev
```

Lalu di terminal lain:

```bash
php artisan serve
```

**Production / tanpa Vite watch:**

```bash
php artisan wayfinder:generate --with-form
npm install
npm run build
php artisan serve
```

Pastikan file `public/build/manifest.json` ada setelah `npm run build`, atau file `public/hot` ada saat `npm run dev`.

### Error `register is not a function` di welcome

Registrasi publik dimatikan di Fortify. Tombol Register di welcome sudah dihapus — pull update terbaru.

### Error `Failed to resolve import "@/routes/..."` / `@/actions/Laravel/Passkeys/...`

Folder route/action Wayfinder di-gitignore. Setelah `git clone`, generate dulu:

```bash
php artisan wayfinder:generate --with-form
# Docker:
docker compose exec app php artisan wayfinder:generate --with-form
```

Lalu restart Vite:

```bash
npm run dev
```

> Import fitur Fortify yang dimatikan (2FA, Passkeys, email verification, reset password)
> diganti stub di `resources/js/stubs/` agar `npm run build` tidak error setelah clone.

### Halaman putih / 500 setelah deploy

```bash
php artisan optimize:clear
php artisan config:cache
# pastikan APP_KEY terisi di .env
# pastikan storage/ & bootstrap/cache writable
```

### Assets tidak muncul (CSS/JS kosong)

Jalankan ulang build:

```bash
npm install
npm run build
```

Di Docker:

```bash
docker compose restart vite
# atau
docker compose exec vite sh -c "npm run build"
```

### Error koneksi database (Docker)

Pastikan di `.env`:

- `DB_HOST=db`
- `DB_PORT=3306`
- `DB_PASSWORD` sama dengan yang dipakai container MySQL

Lalu restart:

```bash
docker compose restart app
```

### Port sudah dipakai

Ubah mapping port di `docker-compose.yml`, misalnya:

```yaml
ports:
  - "8080:80"   # web
  - "3308:3306" # db
```

### Permission denied di `storage/`

```bash
# Manual
chmod -R 775 storage bootstrap/cache

# Docker
docker compose exec app chmod -R 775 storage bootstrap/cache
```

---

## Struktur singkat

```
logistiknew/
├── app/                 # Controllers, Models, Services, Repositories
├── database/            # Migrations & Seeders
├── docker/              # Nginx & Node entrypoint
├── public/              # Document root web server
├── resources/js/        # React (Inertia) pages & components
├── routes/web.php       # Routing aplikasi
├── Dockerfile           # Image PHP-FPM
├── Dockerfile.node      # Image Vite/Node
├── docker-compose.yml   # Orkestrasi container
└── .env.example         # Template environment
```

---

## Lisensi

Project ini menggunakan stack Laravel. Sesuaikan lisensi sesuai kebijakan organisasi Anda.
