<?php

namespace App\Services;

use App\Contracts\Repositories\GudangRepositoryInterface;
use App\Contracts\Services\GudangServiceInterface;
use App\Models\Gudang;
use App\Services\Concerns\AppliesQueryFilters;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class GudangService implements GudangServiceInterface
{
    use AppliesQueryFilters;

    public function __construct(
        private readonly GudangRepositoryInterface $gudangRepository,
    ) {}

    public function paginate(array $params): LengthAwarePaginator
    {
        $query = $this->gudangRepository->query();

        $this->applySearch($query, $params['search'] ?? null, [
            'nama_gudang',
            'keterangan',
        ]);

        $this->applySort($query, $params['sort_by'] ?? null, $params['sort_dir'] ?? null, [
            'id',
            'nama_gudang',
            'jenis_gudang',
            'created_at',
        ], 'id');

        return $query
            ->paginate((int) ($params['per_page'] ?? 10))
            ->withQueryString();
    }

    public function store(array $data): Gudang
    {
        /** @var Gudang */
        return $this->gudangRepository->create($data);
    }

    public function update(int $id, array $data): Gudang
    {
        /** @var Gudang */
        return $this->gudangRepository->update($id, $data);
    }

    public function destroy(int $id): bool
    {
        return $this->gudangRepository->delete($id);
    }
}
