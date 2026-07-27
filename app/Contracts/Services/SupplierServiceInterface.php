<?php

namespace App\Contracts\Services;

use App\Models\Supplier;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface SupplierServiceInterface
{
    /**
     * Ambil data terpaginasi untuk DataTable serverside.
     *
     * @param  array{search?: string, sort_by?: string, sort_dir?: string, per_page?: int, page?: int} $params
     */
    public function paginate(array $params): LengthAwarePaginator;

    /**
     * Simpan supplier baru.
     *
     * @param  array<string, mixed> $data
     */
    public function store(array $data): Supplier;

    /**
     * Update supplier berdasarkan ID.
     *
     * @param  array<string, mixed> $data
     */
    public function update(int $id, array $data): Supplier;

    /**
     * Hapus supplier berdasarkan ID.
     */
    public function destroy(int $id): bool;
}
