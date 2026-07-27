<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Kendaraan extends Model
{
    protected $table = 'kendaraan';

    protected $fillable = [
        'kode_kendaraan',
        'nama_kendaraan',
        'no_polisi',
        'no_rangka',
        'no_mesin',
        'warna',
        'jumlah',
        'tanggal_input',
        'tahun_perolehan',
        'harga_perolehan',
        'isi_silinder',
        'masa_pakai',
        'kondisi_id',
        'gudang_id',
        'kategori_id',
        'keterangan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_input'   => 'date',
            'tahun_perolehan' => 'integer',
            'harga_perolehan' => 'decimal:2',
            'jumlah'          => 'integer',
        ];
    }

    public function kondisi(): BelongsTo
    {
        return $this->belongsTo(Kondisi::class);
    }

    public function gudang(): BelongsTo
    {
        return $this->belongsTo(Gudang::class);
    }

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(Kategori::class);
    }
}
