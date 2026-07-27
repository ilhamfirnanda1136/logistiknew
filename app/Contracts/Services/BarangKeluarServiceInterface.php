<?php

namespace App\Contracts\Services;

use App\Models\BarangKeluar;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface BarangKeluarServiceInterface
{
    /**
     * @param array{search?: string, sort_by?: string, sort_dir?: string, per_page?: int, page?: int} $params
     */
    public function paginate(array $params): LengthAwarePaginator;

    /** @param array<string, mixed> $data */
    public function store(array $data): BarangKeluar;

    /** @param array<string, mixed> $data */
    public function update(int $id, array $data): BarangKeluar;

    public function destroy(int $id): bool;

    public function generateNoTransaksi(): string;
}
