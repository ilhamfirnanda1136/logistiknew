<?php

namespace App\Repositories;

use App\Contracts\Repositories\DireksiRepositoryInterface;
use App\Models\Direksi;
use App\Repositories\Eloquent\BaseRepository;

class DireksiRepository extends BaseRepository implements DireksiRepositoryInterface
{
    protected string $modelClass = Direksi::class;
}
