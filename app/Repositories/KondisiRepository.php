<?php

namespace App\Repositories;

use App\Contracts\Repositories\KondisiRepositoryInterface;
use App\Models\Kondisi;
use App\Repositories\Eloquent\BaseRepository;

class KondisiRepository extends BaseRepository implements KondisiRepositoryInterface
{
    protected string $modelClass = Kondisi::class;
}
