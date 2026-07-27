<?php

namespace App\Contracts\Services;

use App\Models\Dimensi;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface DimensiServiceInterface
{
    /**
     * Ambil data terpaginasi untuk DataTable serverside.
     *
     * @param  array{search?: string, sort_by?: string, sort_dir?: string, per_page?: int, page?: int} $params
     */
    public function paginate(array $params): LengthAwarePaginator;

    /**
     * Simpan dimensi baru.
     *
     * @param  array<string, mixed> $data
     */
    public function store(array $data): Dimensi;

    /**
     * Update dimensi berdasarkan ID.
     *
     * @param  array<string, mixed> $data
     */
    public function update(int $id, array $data): Dimensi;

    /**
     * Hapus dimensi berdasarkan ID.
     */
    public function destroy(int $id): bool;
}
