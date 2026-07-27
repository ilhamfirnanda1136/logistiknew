<?php

namespace App\Repositories;

use App\Contracts\Repositories\JabatanRepositoryInterface;
use App\Models\Jabatan;
use App\Repositories\Eloquent\BaseRepository;

class JabatanRepository extends BaseRepository implements JabatanRepositoryInterface
{
    protected string $modelClass = Jabatan::class;
}
