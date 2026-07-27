<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Barang extends Model
{
    protected $fillable = [
        'kode_barang',
        'nama_barang',
        'dimensi_id',
        'satuan_id',
        'kategori_id',
        'gudang_id',
        'stok',
        'is_item_sr',
        'keterangan',
    ];

    protected function casts(): array
    {
        return [
            'stok'       => 'decimal:2',
            'is_item_sr' => 'boolean',
        ];
    }

    public function dimensi(): BelongsTo
    {
        return $this->belongsTo(Dimensi::class);
    }

    public function satuan(): BelongsTo
    {
        return $this->belongsTo(Satuan::class);
    }

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(Kategori::class);
    }

    public function gudang(): BelongsTo
    {
        return $this->belongsTo(Gudang::class);
    }
}
