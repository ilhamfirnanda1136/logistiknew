<?php

namespace App\Repositories;

use App\Contracts\Repositories\KendaraanRepositoryInterface;
use App\Models\Kendaraan;
use App\Repositories\Eloquent\BaseRepository;
use Illuminate\Database\Eloquent\Builder;

class KendaraanRepository extends BaseRepository implements KendaraanRepositoryInterface
{
    protected string $modelClass = Kendaraan::class;

    public function query(): Builder
    {
        return Kendaraan::query()->with(['kondisi', 'gudang', 'kategori']);
    }
}
