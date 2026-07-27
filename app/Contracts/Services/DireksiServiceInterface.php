<?php

namespace App\Contracts\Services;

use App\Models\Direksi;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface DireksiServiceInterface
{
    /**
     * Ambil data terpaginasi untuk DataTable serverside.
     *
     * @param  array{search?: string, sort_by?: string, sort_dir?: string, per_page?: int, page?: int} $params
     */
    public function paginate(array $params): LengthAwarePaginator;

    /**
     * Simpan direksi baru.
     *
     * @param  array<string, mixed> $data
     */
    public function store(array $data): Direksi;

    /**
     * Update direksi berdasarkan ID.
     *
     * @param  array<string, mixed> $data
     */
    public function update(int $id, array $data): Direksi;

    /**
     * Hapus direksi berdasarkan ID.
     */
    public function destroy(int $id): bool;
}
