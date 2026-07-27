<?php

namespace App\Contracts\Repositories;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Interface dasar untuk semua Repository.
 *
 * Menyediakan contract CRUD generik sehingga concrete interface
 * cukup meng-extend dan menambahkan method khusus jika diperlukan.
 */
interface BaseRepositoryInterface
{
    /**
     * Dapatkan query builder bersih dari model.
     */
    public function query(): Builder;

    /**
     * Cari model berdasarkan ID atau gagal (404).
     */
    public function findOrFail(int $id): Model;

    /**
     * Simpan record baru.
     *
     * @param  array<string, mixed> $data
     */
    public function create(array $data): Model;

    /**
     * Update record berdasarkan ID.
     *
     * @param  array<string, mixed> $data
     */
    public function update(int $id, array $data): Model;

    /**
     * Hapus record berdasarkan ID.
     */
    public function delete(int $id): bool;
}
