<?php

namespace App\Repositories;

use App\Contracts\Repositories\BarangKeluarRepositoryInterface;
use App\Models\BarangKeluar;
use App\Repositories\Eloquent\BaseRepository;
use Illuminate\Database\Eloquent\Builder;

class BarangKeluarRepository extends BaseRepository implements BarangKeluarRepositoryInterface
{
    protected string $modelClass = BarangKeluar::class;

    public function query(): Builder
    {
        return BarangKeluar::query()->with([
            'gudang',
            'details.barang.dimensi',
            'details.barang.satuan',
        ]);
    }
}
