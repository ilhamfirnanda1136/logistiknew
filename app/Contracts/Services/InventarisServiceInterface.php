<?php

namespace App\Contracts\Services;

use App\Models\Inventaris;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface InventarisServiceInterface
{
    /**
     * @param array{
     *     search?: string,
     *     sort_by?: string,
     *     sort_dir?: string,
     *     per_page?: int,
     *     page?: int,
     *     gudang_id?: int|string,
     *     kategori_id?: int|string,
     * } $params
     */
    public function paginate(array $params): LengthAwarePaginator;

    /** @param array<string, mixed> $data */
    public function store(array $data): Inventaris;

    /** @param array<string, mixed> $data */
    public function update(int $id, array $data): Inventaris;

    public function destroy(int $id): bool;
}
