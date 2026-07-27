<?php

use App\Http\Controllers\BarangController;
use App\Http\Controllers\BarangKeluarController;
use App\Http\Controllers\BarangMasukController;
use App\Http\Controllers\DireksiController;
use App\Http\Controllers\DimensiController;
use App\Http\Controllers\DivisiController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\PenggunaController;
use App\Http\Controllers\SatuanController;
use App\Http\Controllers\JabatanController;
use App\Http\Controllers\KadivController;
use App\Http\Controllers\KondisiController;
use App\Http\Controllers\ManagerController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\GudangController;
use App\Http\Controllers\InventarisController;
use App\Http\Controllers\KendaraanController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // ── Pengguna ──────────────────────────────────────────────────────────────
    Route::prefix('pengguna')->name('pengguna.')->group(function () {
        Route::get('/', [PenggunaController::class, 'index'])->name('index');
        Route::get('/datatable', [PenggunaController::class, 'datatable'])->name('datatable');
        Route::post('/', [PenggunaController::class, 'store'])->name('store');
        Route::put('/{pengguna}', [PenggunaController::class, 'update'])->name('update');
        Route::delete('/{pengguna}', [PenggunaController::class, 'destroy'])->name('destroy');
    });

    // ── Barang ────────────────────────────────────────────────────────────────
    Route::prefix('barang')->name('barang.')->group(function () {
        // Master Barang
        Route::get('/', [BarangController::class, 'index'])->name('index');
        Route::get('/datatable', [BarangController::class, 'datatable'])->name('datatable');
        Route::get('/export', [BarangController::class, 'exportExcel'])->name('export');
        Route::get('/template', [BarangController::class, 'downloadTemplate'])->name('template');
        Route::post('/import', [BarangController::class, 'importExcel'])->name('import');
        Route::post('/', [BarangController::class, 'store'])->name('store');
        Route::put('/{barang}', [BarangController::class, 'update'])->name('update');
        Route::delete('/{barang}', [BarangController::class, 'destroy'])->name('destroy');

        // Dimensi
        Route::prefix('dimensi')->name('dimensi.')->group(function () {
            Route::get('/', [DimensiController::class, 'index'])->name('index');
            Route::get('/datatable', [DimensiController::class, 'datatable'])->name('datatable');
            Route::post('/', [DimensiController::class, 'store'])->name('store');
            Route::put('/{dimensi}', [DimensiController::class, 'update'])->name('update');
            Route::delete('/{dimensi}', [DimensiController::class, 'destroy'])->name('destroy');
        });

        // Satuan
        Route::prefix('satuan')->name('satuan.')->group(function () {
            Route::get('/', [SatuanController::class, 'index'])->name('index');
            Route::get('/datatable', [SatuanController::class, 'datatable'])->name('datatable');
            Route::post('/', [SatuanController::class, 'store'])->name('store');
            Route::put('/{satuan}', [SatuanController::class, 'update'])->name('update');
            Route::delete('/{satuan}', [SatuanController::class, 'destroy'])->name('destroy');
        });

        // Kategori
        Route::prefix('kategori')->name('kategori.')->group(function () {
            Route::get('/', [KategoriController::class, 'index'])->name('index');
            Route::get('/datatable', [KategoriController::class, 'datatable'])->name('datatable');
            Route::post('/', [KategoriController::class, 'store'])->name('store');
            Route::put('/{kategori}', [KategoriController::class, 'update'])->name('update');
            Route::delete('/{kategori}', [KategoriController::class, 'destroy'])->name('destroy');
        });
    });

    // ── Kondisi ───────────────────────────────────────────────────────────────
    Route::prefix('kondisi')->name('kondisi.')->group(function () {
        Route::get('/', [KondisiController::class, 'index'])->name('index');
        Route::get('/datatable', [KondisiController::class, 'datatable'])->name('datatable');
        Route::post('/', [KondisiController::class, 'store'])->name('store');
        Route::put('/{kondisi}', [KondisiController::class, 'update'])->name('update');
        Route::delete('/{kondisi}', [KondisiController::class, 'destroy'])->name('destroy');
    });

    // ── Inventaris (Asset) ────────────────────────────────────────────────────
    Route::prefix('asset')->name('asset.')->group(function () {
        Route::get('/', [InventarisController::class, 'index'])->name('index');
        Route::get('/datatable', [InventarisController::class, 'datatable'])->name('datatable');
        Route::post('/', [InventarisController::class, 'store'])->name('store');
        Route::put('/{inventaris}', [InventarisController::class, 'update'])->name('update');
        Route::delete('/{inventaris}', [InventarisController::class, 'destroy'])->name('destroy');
    });

    // ── Kendaraan Dinas ───────────────────────────────────────────────────────
    Route::prefix('kendaraan-dinas')->name('kendaraan-dinas.')->group(function () {
        Route::get('/', [KendaraanController::class, 'index'])->name('index');
        Route::get('/datatable', [KendaraanController::class, 'datatable'])->name('datatable');
        Route::post('/', [KendaraanController::class, 'store'])->name('store');
        Route::put('/{kendaraan}', [KendaraanController::class, 'update'])->name('update');
        Route::delete('/{kendaraan}', [KendaraanController::class, 'destroy'])->name('destroy');
    });

    // ── Transaksi: Barang Masuk ───────────────────────────────────────────────
    Route::prefix('transaksi/barang-masuk')->name('transaksi.barang-masuk.')->group(function () {
        Route::get('/', [BarangMasukController::class, 'index'])->name('index');
        Route::get('/datatable', [BarangMasukController::class, 'datatable'])->name('datatable');
        Route::post('/', [BarangMasukController::class, 'store'])->name('store');
        Route::put('/{barangMasuk}', [BarangMasukController::class, 'update'])->name('update');
        Route::delete('/{barangMasuk}', [BarangMasukController::class, 'destroy'])->name('destroy');
    });

    // ── Transaksi: Barang Keluar ──────────────────────────────────────────────
    Route::prefix('transaksi/barang-keluar')->name('transaksi.barang-keluar.')->group(function () {
        Route::get('/', [BarangKeluarController::class, 'index'])->name('index');
        Route::get('/datatable', [BarangKeluarController::class, 'datatable'])->name('datatable');
        Route::post('/', [BarangKeluarController::class, 'store'])->name('store');
        Route::put('/{barangKeluar}', [BarangKeluarController::class, 'update'])->name('update');
        Route::delete('/{barangKeluar}', [BarangKeluarController::class, 'destroy'])->name('destroy');
    });

    // ── Jabatan ───────────────────────────────────────────────────────────────
    Route::prefix('jabatan')->name('jabatan.')->group(function () {
        Route::get('/', [JabatanController::class, 'index'])->name('index');
        Route::get('/datatable', [JabatanController::class, 'datatable'])->name('datatable');
        Route::post('/', [JabatanController::class, 'store'])->name('store');
        Route::put('/{jabatan}', [JabatanController::class, 'update'])->name('update');
        Route::delete('/{jabatan}', [JabatanController::class, 'destroy'])->name('destroy');
    });

    // ── Divisi ────────────────────────────────────────────────────────────────
    Route::prefix('divisi')->name('divisi.')->group(function () {
        Route::get('/', [DivisiController::class, 'index'])->name('index');
        Route::get('/datatable', [DivisiController::class, 'datatable'])->name('datatable');
        Route::post('/', [DivisiController::class, 'store'])->name('store');
        Route::put('/{divisi}', [DivisiController::class, 'update'])->name('update');
        Route::delete('/{divisi}', [DivisiController::class, 'destroy'])->name('destroy');
    });

    // ── Direksi ───────────────────────────────────────────────────────────────
    Route::prefix('direksi')->name('direksi.')->group(function () {
        Route::get('/', [DireksiController::class, 'index'])->name('index');
        Route::get('/datatable', [DireksiController::class, 'datatable'])->name('datatable');
        Route::post('/', [DireksiController::class, 'store'])->name('store');
        Route::put('/{direksi}', [DireksiController::class, 'update'])->name('update');
        Route::delete('/{direksi}', [DireksiController::class, 'destroy'])->name('destroy');
    });

    // ── Manager ───────────────────────────────────────────────────────────────
    Route::prefix('manager')->name('manager.')->group(function () {
        Route::get('/', [ManagerController::class, 'index'])->name('index');
        Route::get('/datatable', [ManagerController::class, 'datatable'])->name('datatable');
        Route::post('/', [ManagerController::class, 'store'])->name('store');
        Route::put('/{manager}', [ManagerController::class, 'update'])->name('update');
        Route::delete('/{manager}', [ManagerController::class, 'destroy'])->name('destroy');
    });

    // ── Kadiv ─────────────────────────────────────────────────────────────────
    Route::prefix('kadiv')->name('kadiv.')->group(function () {
        Route::get('/', [KadivController::class, 'index'])->name('index');
        Route::get('/datatable', [KadivController::class, 'datatable'])->name('datatable');
        Route::post('/', [KadivController::class, 'store'])->name('store');
        Route::put('/{kadiv}', [KadivController::class, 'update'])->name('update');
        Route::delete('/{kadiv}', [KadivController::class, 'destroy'])->name('destroy');
    });

    // ── Supplier ──────────────────────────────────────────────────────────────
    Route::prefix('supplier')->name('supplier.')->group(function () {
        Route::get('/', [SupplierController::class, 'index'])->name('index');
        Route::get('/datatable', [SupplierController::class, 'datatable'])->name('datatable');
        Route::post('/', [SupplierController::class, 'store'])->name('store');
        Route::put('/{id}', [SupplierController::class, 'update'])->name('update');
        Route::delete('/{id}', [SupplierController::class, 'destroy'])->name('destroy');
    });

    // ── Gudang ────────────────────────────────────────────────────────────────
    Route::prefix('gudang')->name('gudang.')->group(function () {
        Route::get('/', [GudangController::class, 'index'])->name('index');
        Route::get('/datatable', [GudangController::class, 'datatable'])->name('datatable');
        Route::post('/', [GudangController::class, 'store'])->name('store');
        Route::put('/{id}', [GudangController::class, 'update'])->name('update');
        Route::delete('/{id}', [GudangController::class, 'destroy'])->name('destroy');
    });
});

require __DIR__.'/settings.php';
