<?php

namespace App\Services;

use App\Contracts\Repositories\KondisiRepositoryInterface;
use App\Contracts\Services\KondisiServiceInterface;
use App\Models\Kondisi;
use App\Services\Concerns\AppliesQueryFilters;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class KondisiService implements KondisiServiceInterface
{
    use AppliesQueryFilters;

    public function __construct(
        private readonly KondisiRepositoryInterface $kondisiRepository,
    ) {}

    public function paginate(array $params): LengthAwarePaginator
    {
        $query = $this->kondisiRepository->query();

        $this->applySearch($query, $params['search'] ?? null, [
            'nama_kondisi',
            'keterangan',
        ]);

        $this->applySort($query, $params['sort_by'] ?? null, $params['sort_dir'] ?? null, [
            'id',
            'nama_kondisi',
            'created_at',
        ], 'nama_kondisi');

        return $query
            ->paginate((int) ($params['per_page'] ?? 10))
            ->withQueryString();
    }

    public function store(array $data): Kondisi
    {
        /** @var Kondisi */
        return $this->kondisiRepository->create($data);
    }

    public function update(int $id, array $data): Kondisi
    {
        /** @var Kondisi */
        return $this->kondisiRepository->update($id, $data);
    }

    public function destroy(int $id): bool
    {
        return $this->kondisiRepository->delete($id);
    }
}
