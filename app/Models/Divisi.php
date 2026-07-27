<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['nama_divisi', 'keterangan', 'is_active'])]
class Divisi extends Model
{
    /**
     * Nama tabel di database (mencegah auto-pluralisasi menjadi 'divisis').
     */
    protected $table = 'divisi';

    /**
     * Scope: hanya divisi yang aktif.
     */
    public function scopeAktif($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
