<?php

namespace App\Repositories;

use App\Contracts\Repositories\BarangRepositoryInterface;
use App\Models\Barang;
use App\Repositories\Eloquent\BaseRepository;
use Illuminate\Database\Eloquent\Builder;

class BarangRepository extends BaseRepository implements BarangRepositoryInterface
{
    protected string $modelClass = Barang::class;

    /**
     * Override query agar otomatis eager-load relasi barang.
     */
    public function query(): Builder
    {
        return Barang::query()->with(['dimensi', 'satuan', 'kategori', 'gudang']);
    }
}
