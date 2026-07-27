<?php

namespace App\Contracts\Services;

use App\Models\Gudang;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface GudangServiceInterface
{
    /**
     * Ambil data terpaginasi untuk DataTable serverside.
     *
     * @param  array{search?: string, sort_by?: string, sort_dir?: string, per_page?: int, page?: int} $params
     */
    public function paginate(array $params): LengthAwarePaginator;

    /**
     * Simpan gudang baru.
     *
     * @param  array<string, mixed> $data
     */
    public function store(array $data): Gudang;

    /**
     * Update gudang berdasarkan ID.
     *
     * @param  array<string, mixed> $data
     */
    public function update(int $id, array $data): Gudang;

    /**
     * Hapus gudang berdasarkan ID.
     */
    public function destroy(int $id): bool;
}
