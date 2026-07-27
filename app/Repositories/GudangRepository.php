<?php

namespace App\Repositories;

use App\Contracts\Repositories\GudangRepositoryInterface;
use App\Models\Gudang;
use App\Repositories\Eloquent\BaseRepository;

class GudangRepository extends BaseRepository implements GudangRepositoryInterface
{
    protected string $modelClass = Gudang::class;
}
