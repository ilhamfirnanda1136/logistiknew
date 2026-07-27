<?php

namespace App\Repositories;

use App\Contracts\Repositories\DimensiRepositoryInterface;
use App\Models\Dimensi;
use App\Repositories\Eloquent\BaseRepository;

class DimensiRepository extends BaseRepository implements DimensiRepositoryInterface
{
    protected string $modelClass = Dimensi::class;
}
