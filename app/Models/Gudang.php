<?php

namespace App\Models;

use App\Enums\JenisGudang;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gudang extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_gudang',
        'jenis_gudang',
        'keterangan',
        'latitude',
        'longitude',
    ];

    protected function casts(): array
    {
        return [
            'jenis_gudang' => JenisGudang::class,
            'latitude'     => 'float',
            'longitude'    => 'float',
        ];
    }
}
