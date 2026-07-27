<?php

namespace App\Repositories;

use App\Contracts\Repositories\KadivRepositoryInterface;
use App\Models\Kadiv;
use App\Repositories\Eloquent\BaseRepository;

class KadivRepository extends BaseRepository implements KadivRepositoryInterface
{
    protected string $modelClass = Kadiv::class;
}
