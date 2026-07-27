<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventaris', function (Blueprint $table) {
            $table->id();
            $table->string('kode_barang')->unique();
            $table->date('tanggal_input')->nullable();
            $table->date('tanggal_perolehan')->nullable();
            $table->string('no_inventaris')->nullable();
            $table->string('nama_inventaris');
            $table->string('merek')->nullable();
            $table->unsignedInteger('jumlah')->default(0);
            $table->foreignId('dimensi_id')->nullable()->constrained('dimensi')->nullOnDelete();
            $table->foreignId('satuan_id')->nullable()->constrained('satuan')->nullOnDelete();
            $table->foreignId('kategori_id')->nullable()->constrained('kategori')->nullOnDelete();
            $table->foreignId('kondisi_id')->nullable()->constrained('kondisi')->nullOnDelete();
            $table->foreignId('gudang_id')->nullable()->constrained('gudangs')->nullOnDelete();
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventaris');
    }
};
