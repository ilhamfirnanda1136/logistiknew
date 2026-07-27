<?php

namespace App\Contracts\Services;

use App\Models\Barang;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface BarangServiceInterface
{
    /**
     * Ambil data terpaginasi untuk DataTable serverside.
     *
     * @param  array{search?: string, sort_by?: string, sort_dir?: string, per_page?: int, page?: int} $params
     */
    public function paginate(array $params): LengthAwarePaginator;

    /**
     * Simpan barang baru.
     *
     * @param  array<string, mixed> $data
     */
    public function store(array $data): Barang;

    /**
     * Update barang berdasarkan ID.
     *
     * @param  array<string, mixed> $data
     */
    public function update(int $id, array $data): Barang;

    /**
     * Hapus barang berdasarkan ID.
     */
    public function destroy(int $id): bool;
}
