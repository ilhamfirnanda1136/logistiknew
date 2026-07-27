<?php

namespace App\Contracts\Services;

use App\Models\Satuan;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface SatuanServiceInterface
{
    /**
     * Ambil data terpaginasi untuk DataTable serverside.
     *
     * @param  array{search?: string, sort_by?: string, sort_dir?: string, per_page?: int, page?: int} $params
     */
    public function paginate(array $params): LengthAwarePaginator;

    /**
     * Simpan satuan baru.
     *
     * @param  array<string, mixed> $data
     */
    public function store(array $data): Satuan;

    /**
     * Update satuan berdasarkan ID.
     *
     * @param  array<string, mixed> $data
     */
    public function update(int $id, array $data): Satuan;

    /**
     * Hapus satuan berdasarkan ID.
     */
    public function destroy(int $id): bool;
}
