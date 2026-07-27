<?php

namespace App\Services;

use App\Contracts\Repositories\KadivRepositoryInterface;
use App\Contracts\Services\KadivServiceInterface;
use App\Models\Kadiv;
use App\Services\Concerns\AppliesQueryFilters;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class KadivService implements KadivServiceInterface
{
    use AppliesQueryFilters;

    public function __construct(
        private readonly KadivRepositoryInterface $kadivRepository,
    ) {}

    public function paginate(array $params): LengthAwarePaginator
    {
        $query = $this->kadivRepository->query();

        $this->applySearch($query, $params['search'] ?? null, [
            'nama_kadiv',
            'keterangan',
        ]);

        $this->applySort($query, $params['sort_by'] ?? null, $params['sort_dir'] ?? null, [
            'id',
            'nama_kadiv',
            'is_active',
            'created_at',
        ], 'id');

        return $query
            ->paginate((int) ($params['per_page'] ?? 10))
            ->withQueryString();
    }

    public function store(array $data): Kadiv
    {
        $data['is_active'] = $data['is_active'] ?? true;

        /** @var Kadiv */
        return $this->kadivRepository->create($data);
    }

    public function update(int $id, array $data): Kadiv
    {
        $data['is_active'] = $data['is_active'] ?? true;

        /** @var Kadiv */
        return $this->kadivRepository->update($id, $data);
    }

    public function destroy(int $id): bool
    {
        return $this->kadivRepository->delete($id);
    }
}
