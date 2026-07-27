<?php

namespace App\Contracts\Services;

use App\Models\BarangMasuk;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface BarangMasukServiceInterface
{
    /**
     * @param array{search?: string, sort_by?: string, sort_dir?: string, per_page?: int, page?: int} $params
     */
    public function paginate(array $params): LengthAwarePaginator;

    /** @param array<string, mixed> $data */
    public function store(array $data): BarangMasuk;

    /** @param array<string, mixed> $data */
    public function update(int $id, array $data): BarangMasuk;

    public function destroy(int $id): bool;

    public function generateNoTransaksi(): string;
}
