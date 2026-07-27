<?php

namespace App\Services;

use App\Contracts\Repositories\ManagerRepositoryInterface;
use App\Contracts\Services\ManagerServiceInterface;
use App\Models\Manager;
use App\Services\Concerns\AppliesQueryFilters;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ManagerService implements ManagerServiceInterface
{
    use AppliesQueryFilters;

    public function __construct(
        private readonly ManagerRepositoryInterface $managerRepository,
    ) {}

    public function paginate(array $params): LengthAwarePaginator
    {
        $query = $this->managerRepository->query();

        $this->applySearch($query, $params['search'] ?? null, [
            'nama_manager',
            'keterangan',
        ]);

        $this->applySort($query, $params['sort_by'] ?? null, $params['sort_dir'] ?? null, [
            'id',
            'nama_manager',
            'is_active',
            'created_at',
        ], 'id');

        return $query
            ->paginate((int) ($params['per_page'] ?? 10))
            ->withQueryString();
    }

    public function store(array $data): Manager
    {
        $data['is_active'] = $data['is_active'] ?? true;

        /** @var Manager */
        return $this->managerRepository->create($data);
    }

    public function update(int $id, array $data): Manager
    {
        $data['is_active'] = $data['is_active'] ?? true;

        /** @var Manager */
        return $this->managerRepository->update($id, $data);
    }

    public function destroy(int $id): bool
    {
        return $this->managerRepository->delete($id);
    }
}
