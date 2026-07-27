<?php

namespace App\Contracts\Services;

use App\Models\Kadiv;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface KadivServiceInterface
{
    /**
     * Ambil data terpaginasi untuk DataTable serverside.
     *
     * @param  array{search?: string, sort_by?: string, sort_dir?: string, per_page?: int, page?: int} $params
     */
    public function paginate(array $params): LengthAwarePaginator;

    /**
     * Simpan kadiv baru.
     *
     * @param  array<string, mixed> $data
     */
    public function store(array $data): Kadiv;

    /**
     * Update kadiv berdasarkan ID.
     *
     * @param  array<string, mixed> $data
     */
    public function update(int $id, array $data): Kadiv;

    /**
     * Hapus kadiv berdasarkan ID.
     */
    public function destroy(int $id): bool;
}
