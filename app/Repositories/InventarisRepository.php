<?php

namespace App\Repositories;

use App\Contracts\Repositories\InventarisRepositoryInterface;
use App\Models\Inventaris;
use App\Repositories\Eloquent\BaseRepository;
use Illuminate\Database\Eloquent\Builder;

class InventarisRepository extends BaseRepository implements InventarisRepositoryInterface
{
    protected string $modelClass = Inventaris::class;

    public function query(): Builder
    {
        return Inventaris::query()->with(['dimensi', 'satuan', 'kategori', 'kondisi', 'gudang']);
    }
}
