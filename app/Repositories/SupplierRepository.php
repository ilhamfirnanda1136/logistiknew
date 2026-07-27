<?php

namespace App\Repositories;

use App\Contracts\Repositories\SupplierRepositoryInterface;
use App\Models\Supplier;
use App\Repositories\Eloquent\BaseRepository;

class SupplierRepository extends BaseRepository implements SupplierRepositoryInterface
{
    protected string $modelClass = Supplier::class;
}
