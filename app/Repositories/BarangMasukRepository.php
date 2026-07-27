<?php

namespace App\Repositories;

use App\Contracts\Repositories\BarangMasukRepositoryInterface;
use App\Models\BarangMasuk;
use App\Repositories\Eloquent\BaseRepository;
use Illuminate\Database\Eloquent\Builder;

class BarangMasukRepository extends BaseRepository implements BarangMasukRepositoryInterface
{
    protected string $modelClass = BarangMasuk::class;

    public function query(): Builder
    {
        return BarangMasuk::query()->with([
            'supplier',
            'gudang',
            'details.barang.dimensi',
            'details.barang.satuan',
        ]);
    }
}
