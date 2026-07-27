<?php

namespace App\Repositories;

use App\Contracts\Repositories\KategoriRepositoryInterface;
use App\Models\Kategori;
use App\Repositories\Eloquent\BaseRepository;

class KategoriRepository extends BaseRepository implements KategoriRepositoryInterface
{
    protected string $modelClass = Kategori::class;
}
