<?php

namespace App\Contracts\Services;

use App\Models\Kondisi;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface KondisiServiceInterface
{
    /**
     * @param array{search?: string, sort_by?: string, sort_dir?: string, per_page?: int, page?: int} $params
     */
    public function paginate(array $params): LengthAwarePaginator;

    /** @param array<string, mixed> $data */
    public function store(array $data): Kondisi;

    /** @param array<string, mixed> $data */
    public function update(int $id, array $data): Kondisi;

    public function destroy(int $id): bool;
}
