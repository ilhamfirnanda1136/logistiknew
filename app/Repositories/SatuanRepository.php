<?php

namespace App\Repositories;

use App\Contracts\Repositories\SatuanRepositoryInterface;
use App\Models\Satuan;
use App\Repositories\Eloquent\BaseRepository;

class SatuanRepository extends BaseRepository implements SatuanRepositoryInterface
{
    protected string $modelClass = Satuan::class;
}
