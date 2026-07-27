<?php

namespace App\Services;

use App\Contracts\Repositories\DivisiRepositoryInterface;
use App\Contracts\Services\DivisiServiceInterface;
use App\Models\Divisi;
use App\Services\Concerns\AppliesQueryFilters;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class DivisiService implements DivisiServiceInterface
{
    use AppliesQueryFilters;

    public function __construct(
        private readonly DivisiRepositoryInterface $divisiRepository,
    ) {}

    public function paginate(array $params): LengthAwarePaginator
    {
        $query = $this->divisiRepository->query();

        $this->applySearch($query, $params['search'] ?? null, [
            'nama_divisi',
            'keterangan',
        ]);

        $this->applySort($query, $params['sort_by'] ?? null, $params['sort_dir'] ?? null, [
            'id',
            'nama_divisi',
            'is_active',
            'created_at',
        ], 'id');

        return $query
            ->paginate((int) ($params['per_page'] ?? 10))
            ->withQueryString();
    }

    public function store(array $data): Divisi
    {
        $data['is_active'] = $data['is_active'] ?? true;

        /** @var Divisi */
        return $this->divisiRepository->create($data);
    }

    public function update(int $id, array $data): Divisi
    {
        $data['is_active'] = $data['is_active'] ?? true;

        /** @var Divisi */
        return $this->divisiRepository->update($id, $data);
    }

    public function destroy(int $id): bool
    {
        return $this->divisiRepository->delete($id);
    }
}
