<?php

namespace App\Contracts\Repositories;

use Illuminate\Database\Eloquent\Builder;

interface PenggunaRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Query builder dengan eager-load relasi pengguna.
     */
    public function query(): Builder;
}
