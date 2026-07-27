<?php

namespace App\Repositories;

use App\Contracts\Repositories\PenggunaRepositoryInterface;
use App\Models\User;
use App\Repositories\Eloquent\BaseRepository;
use Illuminate\Database\Eloquent\Builder;

class PenggunaRepository extends BaseRepository implements PenggunaRepositoryInterface
{
    protected string $modelClass = User::class;

    /**
     * Override query agar otomatis eager-load relasi pengguna.
     */
    public function query(): Builder
    {
        return User::query()->with(['jabatan', 'gudang']);
    }
}
