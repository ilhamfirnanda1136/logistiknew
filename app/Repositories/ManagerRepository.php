<?php

namespace App\Repositories;

use App\Contracts\Repositories\ManagerRepositoryInterface;
use App\Models\Manager;
use App\Repositories\Eloquent\BaseRepository;

class ManagerRepository extends BaseRepository implements ManagerRepositoryInterface
{
    protected string $modelClass = Manager::class;
}
