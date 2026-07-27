<?php

namespace App\Services;

use App\Contracts\Repositories\DireksiRepositoryInterface;
use App\Contracts\Services\DireksiServiceInterface;
use App\Models\Direksi;
use App\Services\Concerns\AppliesQueryFilters;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class DireksiService implements DireksiServiceInterface
{
    use AppliesQueryFilters;

    public function __construct(
        private readonly DireksiRepositoryInterface $direksiRepository,
    ) {}

    public function paginate(array $params): LengthAwarePaginator
    {
        $query = $this->direksiRepository->query();

        $this->applySearch($query, $params['search'] ?? null, [
            'nama_direksi',
            'keterangan',
        ]);

        $this->applySort($query, $params['sort_by'] ?? null, $params['sort_dir'] ?? null, [
            'id',
            'nama_direksi',
            'is_active',
            'created_at',
        ], 'id');

        return $query
            ->paginate((int) ($params['per_page'] ?? 10))
            ->withQueryString();
    }

    public function store(array $data): Direksi
    {
        $data['is_active'] = $data['is_active'] ?? true;

        /** @var Direksi */
        return $this->direksiRepository->create($data);
    }

    public function update(int $id, array $data): Direksi
    {
        $data['is_active'] = $data['is_active'] ?? true;

        /** @var Direksi */
        return $this->direksiRepository->update($id, $data);
    }

    public function destroy(int $id): bool
    {
        return $this->direksiRepository->delete($id);
    }
}
