<?php

namespace App\Contracts\Services;

use App\Models\Jabatan;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface JabatanServiceInterface
{
    /**
     * Ambil data terpaginasi untuk DataTable serverside.
     *
     * @param  array{search?: string, sort_by?: string, sort_dir?: string, per_page?: int, page?: int} $params
     */
    public function paginate(array $params): LengthAwarePaginator;

    /**
     * Simpan jabatan baru.
     *
     * @param  array<string, mixed> $data
     */
    public function store(array $data): Jabatan;

    /**
     * Update jabatan berdasarkan ID.
     *
     * @param  array<string, mixed> $data
     */
    public function update(int $id, array $data): Jabatan;

    /**
     * Hapus jabatan berdasarkan ID.
     */
    public function destroy(int $id): bool;
}
