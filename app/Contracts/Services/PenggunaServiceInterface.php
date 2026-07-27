<?php

namespace App\Contracts\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PenggunaServiceInterface
{
    /**
     * Ambil data terpaginasi untuk DataTable serverside.
     *
     * @param  array{search?: string, sort_by?: string, sort_dir?: string, per_page?: int, page?: int} $params
     */
    public function paginate(array $params): LengthAwarePaginator;

    /**
     * Simpan pengguna baru (dengan hashing password).
     *
     * @param  array<string, mixed> $data
     */
    public function store(array $data): User;

    /**
     * Update pengguna berdasarkan ID (password hanya diupdate jika diisi).
     *
     * @param  array<string, mixed> $data
     */
    public function update(int $id, array $data): User;

    /**
     * Hapus pengguna berdasarkan ID.
     */
    public function destroy(int $id): bool;
}
