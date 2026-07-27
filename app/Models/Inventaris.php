<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventaris extends Model
{
    protected $table = 'inventaris';

    protected $fillable = [
        'kode_barang',
        'tanggal_input',
        'tanggal_perolehan',
        'no_inventaris',
        'nama_inventaris',
        'merek',
        'jumlah',
        'dimensi_id',
        'satuan_id',
        'kategori_id',
        'kondisi_id',
        'gudang_id',
        'keterangan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_input'     => 'date',
            'tanggal_perolehan' => 'date',
            'jumlah'            => 'integer',
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

    public function kondisi(): BelongsTo
    {
        return $this->belongsTo(Kondisi::class);
    }

    public function gudang(): BelongsTo
    {
        return $this->belongsTo(Gudang::class);
    }
}
