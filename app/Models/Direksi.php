<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['nama_direksi', 'keterangan', 'is_active'])]
class Direksi extends Model
{
    /**
     * Nama tabel di database.
     */
    protected $table = 'direksi';

    /**
     * Scope: hanya direksi yang aktif.
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
