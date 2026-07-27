<?php

namespace App\Contracts\Services;

use App\Models\Divisi;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface DivisiServiceInterface
{
    /**
     * Ambil data terpaginasi untuk DataTable serverside.
     *
     * @param  array{search?: string, sort_by?: string, sort_dir?: string, per_page?: int, page?: int} $params
     */
    public function paginate(array $params): LengthAwarePaginator;

    /**
     * Simpan divisi baru.
     *
     * @param  array<string, mixed> $data
     */
    public function store(array $data): Divisi;

    /**
     * Update divisi berdasarkan ID.
     *
     * @param  array<string, mixed> $data
     */
    public function update(int $id, array $data): Divisi;

    /**
     * Hapus divisi berdasarkan ID.
     */
    public function destroy(int $id): bool;
}
