<?php

namespace App\Contracts\Services;

use App\Models\Manager;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ManagerServiceInterface
{
    /**
     * Ambil data terpaginasi untuk DataTable serverside.
     *
     * @param  array{search?: string, sort_by?: string, sort_dir?: string, per_page?: int, page?: int} $params
     */
    public function paginate(array $params): LengthAwarePaginator;

    /**
     * Simpan manager baru.
     *
     * @param  array<string, mixed> $data
     */
    public function store(array $data): Manager;

    /**
     * Update manager berdasarkan ID.
     *
     * @param  array<string, mixed> $data
     */
    public function update(int $id, array $data): Manager;

    /**
     * Hapus manager berdasarkan ID.
     */
    public function destroy(int $id): bool;
}
