<?php

namespace App\Repositories;

use App\Contracts\Repositories\DivisiRepositoryInterface;
use App\Models\Divisi;
use App\Repositories\Eloquent\BaseRepository;

class DivisiRepository extends BaseRepository implements DivisiRepositoryInterface
{
    protected string $modelClass = Divisi::class;
}
