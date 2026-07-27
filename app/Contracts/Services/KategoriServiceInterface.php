<?php

namespace App\Contracts\Services;

use App\Models\Kategori;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface KategoriServiceInterface
{
    /**
     * Ambil data terpaginasi untuk DataTable serverside.
     *
     * @param  array{search?: string, sort_by?: string, sort_dir?: string, per_page?: int, page?: int} $params
     */
    public function paginate(array $params): LengthAwarePaginator;

    /**
     * Simpan kategori baru.
     *
     * @param  array<string, mixed> $data
     */
    public function store(array $data): Kategori;

    /**
     * Update kategori berdasarkan ID.
     *
     * @param  array<string, mixed> $data
     */
    public function update(int $id, array $data): Kategori;

    /**
     * Hapus kategori berdasarkan ID.
     */
    public function destroy(int $id): bool;
}
