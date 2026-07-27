<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['nama_kadiv', 'npp', 'keterangan', 'is_active'])]
class Kadiv extends Model
{
    protected $table = 'kadiv';

    public function scopeAktif($query)
    {
        return $query->where('is_active', true);
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
