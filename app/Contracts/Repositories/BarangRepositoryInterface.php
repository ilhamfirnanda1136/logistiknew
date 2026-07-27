<?php

namespace App\Contracts\Repositories;

use App\Models\Barang;
use Illuminate\Database\Eloquent\Builder;

interface BarangRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Query builder dengan eager-load relasi barang.
     */
    public function query(): Builder;
}
